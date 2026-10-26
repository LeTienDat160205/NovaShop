import json
import os
import threading
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from bson import ObjectId
from dotenv import load_dotenv
from pymongo import MongoClient

from recommendation_engine import (
    build_tfidf_vectors,
    rank_content_profile_products,
    rank_personalized_products,
    rank_products,
    rank_similar_products,
)


ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT.parent / "backend-node" / ".env")
CATALOG_CACHE_SECONDS = 300
CATALOG_PROJECTION = {
    "name": 1,
    "price": 1,
    "listPrice": 1,
    "list_price": 1,
    "rating": 1,
    "images": 1,
    "brand": 1,
    "categoryPath": 1,
    "group": 1,
    "specifications": 1,
    "description": 1,
    "createdAt": 1,
}
catalog_cache_lock = threading.Lock()
catalog_cache = {
    "loaded_at": 0,
    "products": [],
    "rating_summaries": {},
    "content_vectors": {},
}


def get_mongodb_uri():
    uri = os.getenv("MONGODB_URI")
    if uri:
        return uri

    password = os.getenv("MONGO_DB")
    if not password:
        raise RuntimeError("Set MONGODB_URI or MONGO_DB in backend-node/.env.")

    from urllib.parse import quote_plus

    return (
        "mongodb+srv://novashopdb:"
        f"{quote_plus(password)}@novashopdb.1rntkxm.mongodb.net/"
        "novashopdb?appName=NovaShopDB"
    )


mongo_client = MongoClient(get_mongodb_uri(), serverSelectionTimeoutMS=5000)
database = mongo_client["novashopdb"]


def get_rating_summaries(product_ids):
    if not product_ids:
        return {}

    dataset_ratings = list(database["datasetratings"].aggregate([
        {
            "$match": {
                "productId": {"$in": product_ids},
                "source": "ReviewClean",
            }
        },
        {
            "$group": {
                "_id": "$productId",
                "datasetCount": {"$sum": 1},
                "ratingSum": {"$sum": "$rating"},
            }
        },
    ]))
    customer_reviews = list(database["reviews"].aggregate([
        {"$match": {"productId": {"$in": product_ids}}},
        {
            "$group": {
                "_id": "$productId",
                "count": {"$sum": 1},
                "ratingSum": {"$sum": "$rating"},
            }
        },
    ]))

    summaries = {}
    for summary in dataset_ratings:
        product_id = str(summary["_id"])
        combined = summaries.setdefault(
            product_id,
            {"count": 0, "ratingSum": 0, "datasetCount": 0},
        )
        combined["count"] += summary["datasetCount"]
        combined["datasetCount"] += summary["datasetCount"]
        combined["ratingSum"] += summary["ratingSum"]

    for summary in customer_reviews:
        product_id = str(summary["_id"])
        combined = summaries.setdefault(
            product_id,
            {"count": 0, "ratingSum": 0, "datasetCount": 0},
        )
        combined["count"] += summary["count"]
        combined["ratingSum"] += summary["ratingSum"]

    return summaries


def get_catalog_snapshot():
    now = datetime.now(timezone.utc).timestamp()
    with catalog_cache_lock:
        if now - catalog_cache["loaded_at"] >= CATALOG_CACHE_SECONDS:
            products = list(database["products"].find({}, CATALOG_PROJECTION))
            rating_summaries = get_rating_summaries(
                [product["_id"] for product in products]
            )
            catalog_cache["products"] = products
            catalog_cache["rating_summaries"] = rating_summaries
            catalog_cache["content_vectors"] = build_tfidf_vectors(products)
            catalog_cache["loaded_at"] = now

        return (
            [dict(product) for product in catalog_cache["products"]],
            catalog_cache["rating_summaries"],
            catalog_cache["content_vectors"],
        )


def serialize_product(product):
    return {
        key: str(value) if isinstance(value, ObjectId) else value
        for key, value in product.items()
        if key != "__v"
    }


def get_personalized_recommendations(
    user_id,
    products,
    profile_products,
    limit,
    offset=0,
    content_vectors=None,
):
    user_object_id = ObjectId(user_id)
    interactions = database["interactions"]
    user_events = list(interactions.find(
        {"userId": user_object_id},
        {"userId": 1, "productId": 1, "type": 1, "createdAt": 1},
    ).sort("createdAt", -1).limit(500))
    if not user_events:
        return None

    seed_product_ids = list({
        event["productId"]
        for event in user_events
        if event.get("productId")
    })
    if not seed_product_ids:
        return None

    content_recommendations = rank_content_profile_products(
        products,
        profile_products,
        user_events,
        limit=offset + limit,
        content_vectors=content_vectors,
    )
    if content_recommendations:
        return content_recommendations[offset:]

    interaction_cutoff = datetime.now(timezone.utc) - timedelta(days=365)
    peer_seed_events = list(interactions.find(
        {
            "userId": {"$ne": user_object_id},
            "productId": {"$in": seed_product_ids},
            "createdAt": {"$gte": interaction_cutoff},
        },
        {"userId": 1, "productId": 1, "type": 1, "createdAt": 1},
    ).sort("createdAt", -1).limit(20000))
    peer_ids = list({
        event["userId"]
        for event in peer_seed_events
        if event.get("userId")
    })
    if not peer_ids:
        return None

    peer_candidate_events = list(interactions.find(
        {
            "userId": {"$in": peer_ids},
            "createdAt": {"$gte": interaction_cutoff},
        },
        {"userId": 1, "productId": 1, "type": 1, "createdAt": 1},
    ).sort("createdAt", -1).limit(25000))

    personalized = rank_personalized_products(
        products,
        user_events,
        peer_seed_events,
        peer_candidate_events,
        user_id,
        limit=offset + limit,
    )
    if personalized:
        return personalized[offset:]
    return None


class RecommendationHandler(BaseHTTPRequestHandler):
    def _send_json(self, status, body):
        payload = json.dumps(body, default=str).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_GET(self):
        parsed_url = urlparse(self.path)
        if parsed_url.path == "/health":
            try:
                mongo_client.admin.command("ping")
                self._send_json(200, {"status": "OK"})
            except Exception as error:
                self.log_error(f"Health check failed: {error}")
                self._send_json(503, {"status": "ERR", "message": "Database unavailable"})
            return

        is_similar_request = parsed_url.path == "/recommendations/similar"
        if parsed_url.path != "/recommendations/default" and not is_similar_request:
            self._send_json(404, {"status": "ERR", "message": "Không tìm thấy endpoint"})
            return

        params = parse_qs(parsed_url.query)
        product_id = params.get("productId", [None])[0]
        if is_similar_request and (
            not product_id or not ObjectId.is_valid(product_id)
        ):
            self._send_json(
                400,
                {"status": "ERR", "message": "ID sản phẩm không hợp lệ"},
            )
            return

        try:
            default_limit = "8" if is_similar_request else "12"
            limit = int(params.get("limit", [default_limit])[0])
        except ValueError:
            self._send_json(
                400,
                {"status": "ERR", "message": "limit phải là số nguyên"},
            )
            return

        try:
            page = int(params.get("page", ["1"])[0])
        except ValueError:
            self._send_json(
                400,
                {"status": "ERR", "message": "page phải là số nguyên"},
            )
            return

        if page < 1:
            self._send_json(
                400,
                {"status": "ERR", "message": "page phải lớn hơn hoặc bằng 1"},
            )
            return

        if limit < 1 or limit > 24:
            self._send_json(
                400,
                {"status": "ERR", "message": "limit phải từ 1 đến 24"},
            )
            return

        exclude_product_id = params.get("excludeProductId", [None])[0]
        if exclude_product_id and not ObjectId.is_valid(exclude_product_id):
            self._send_json(
                400,
                {"status": "ERR", "message": "ID sản phẩm không hợp lệ"},
            )
            return
        exclude_product_ids = [
            product_id
            for value in params.get("excludeProductIds", [])
            for product_id in value.split(",")
            if product_id
        ]
        if any(not ObjectId.is_valid(product_id) for product_id in exclude_product_ids):
            self._send_json(
                400,
                {"status": "ERR", "message": "Danh sách ID sản phẩm loại trừ không hợp lệ"},
            )
            return

        user_id = params.get("userId", [None])[0]
        if user_id and not ObjectId.is_valid(user_id):
            self._send_json(
                400,
                {"status": "ERR", "message": "ID người dùng không hợp lệ"},
            )
            return

        try:
            profile_products, rating_summaries, content_vectors = get_catalog_snapshot()
            products = profile_products
            if is_similar_request:
                if not any(str(product["_id"]) == product_id for product in products):
                    self._send_json(
                        404,
                        {"status": "ERR", "message": "Không tìm thấy sản phẩm"},
                    )
                    return
                rated_products = rank_products(
                    [dict(product) for product in profile_products],
                    rating_summaries,
                    limit=len(profile_products),
                )
                recommendations = rank_similar_products(
                    rated_products,
                    product_id,
                    limit=limit,
                    content_vectors=content_vectors,
                )
                self._send_json(200, {
                    "status": "OK",
                    "mode": "content-based",
                    "message": "Lấy sản phẩm tương tự thành công",
                    "data": [serialize_product(product) for product in recommendations],
                })
                return

            if exclude_product_id:
                excluded_id = str(exclude_product_id)
                products = [
                    product for product in products
                    if str(product["_id"]) != excluded_id
                ]
            excluded_ids = {str(product_id) for product_id in exclude_product_ids}
            products = [
                product for product in products
                if str(product["_id"]) not in excluded_ids
            ]
            all_default_recommendations = rank_products(
                [dict(product) for product in products],
                rating_summaries,
                limit=len(products),
                exclude_product_id=exclude_product_id,
                exclude_product_ids=exclude_product_ids,
            )
            default_scores = {
                str(product["_id"]): product["recommendationScore"]
                for product in all_default_recommendations
            }
            for product in products:
                product["recommendationScore"] = default_scores.get(
                    str(product["_id"]),
                    0,
                )
            offset = (page - 1) * limit
            recommendations = all_default_recommendations[offset:offset + limit]
            mode = "default"
            if user_id:
                personalized = get_personalized_recommendations(
                    user_id,
                    products,
                    profile_products,
                    limit,
                    offset,
                    content_vectors,
                )
                if personalized is not None:
                    recommendations = personalized
                    mode = "personalized"

            self._send_json(200, {
                "status": "OK",
                "mode": mode,
                "page": page,
                "limit": limit,
                "total": (
                    len(all_default_recommendations)
                    if mode == "default"
                    else None
                ),
                "hasMore": (
                    offset + len(recommendations) < len(all_default_recommendations)
                    if mode == "default"
                    else len(recommendations) == limit
                ),
                "message": (
                    "Lấy đề xuất theo tương tác thành công"
                    if mode == "personalized"
                    else "Lấy đề xuất sản phẩm mặc định thành công"
                ),
                "data": [serialize_product(product) for product in recommendations],
            })
        except Exception as error:
            self.log_error(f"Failed to generate default recommendations: {error}")
            self._send_json(
                500,
                {
                    "status": "ERR",
                    "message": "Không thể tạo đề xuất sản phẩm",
                },
            )

    def log_error(self, message):
        print(f"{message}: request={self.path}", flush=True)


if __name__ == "__main__":
    host = os.getenv("REC_ENGINE_HOST", "127.0.0.1")
    port = int(os.getenv("REC_ENGINE_PORT", "8001"))
    server = ThreadingHTTPServer((host, port), RecommendationHandler)
    print(f"Recommendation engine listening on {host}:{port}", flush=True)
    server.serve_forever()
