import math
from datetime import datetime, timedelta, timezone


MINIMUM_REVIEWS = 5
INTERACTION_WEIGHTS = {
    "view": 1.0,
    "favorite": 3.0,
    "like": 3.0,
    "cart": 4.0,
    "purchase": 6.0,
    "buy": 6.0,
}


def _as_number(value, default=0.0):
    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _round_rating(value):
    return int(value * 10 + 0.5) / 10


def _interaction_weight(event, now):
    weight = INTERACTION_WEIGHTS.get(event.get("type"), 0)
    if not weight:
        return 0

    created_at = event.get("createdAt")
    if isinstance(created_at, str):
        try:
            created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
        except ValueError:
            created_at = None
    if isinstance(created_at, datetime):
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        age_days = max(0, (now - created_at).total_seconds() / 86400)
        weight *= math.pow(0.5, age_days / 60)
    return weight


def _product_categories(product):
    categories = product.get("categoryPath") or []
    if isinstance(categories, (list, tuple, set)):
        categories = list(categories)
        return [str(categories[-1]).strip().casefold()] if categories else []
    return [str(categories).strip().casefold()]


def rank_products(
    products,
    rating_summaries,
    limit=12,
    exclude_product_id=None,
    exclude_product_ids=None,
    minimum_reviews=MINIMUM_REVIEWS,
):
    excluded_ids = {str(product_id) for product_id in (exclude_product_ids or [])}
    if exclude_product_id:
        excluded_ids.add(str(exclude_product_id))

    rated_products = []
    total_evidence = 0
    weighted_rating_sum = 0.0

    for product in products:
        product_id = str(product.get("_id", ""))
        if product_id in excluded_ids:
            continue

        summary = rating_summaries.get(product_id, {})
        review_count = max(0, int(_as_number(summary.get("count"))))
        stored_rating = _as_number(product.get("rating"))
        rating_sum = _as_number(summary.get("ratingSum"))
        dataset_count = max(0, int(_as_number(summary.get("datasetCount"))))

        if dataset_count:
            rating = _round_rating(rating_sum / review_count)
            evidence_count = review_count
        else:
            stored_rating_count = 1 if stored_rating > 0 else 0
            rating_denominator = review_count + stored_rating_count
            rating = (
                _round_rating((rating_sum + stored_rating) / rating_denominator)
                if rating_denominator
                else 0
            )
            evidence_count = review_count + stored_rating_count

        rated_products.append({
            "product": product,
            "rating": rating,
            "reviewCount": review_count,
            "evidenceCount": evidence_count,
        })
        total_evidence += evidence_count
        weighted_rating_sum += rating * evidence_count

    global_average = (
        weighted_rating_sum / total_evidence if total_evidence else 0
    )

    for item in rated_products:
        evidence_count = item["evidenceCount"]
        if evidence_count:
            denominator = evidence_count + minimum_reviews
            score = (
                evidence_count / denominator * item["rating"]
                + minimum_reviews / denominator * global_average
            )
        else:
            score = 0

        item["product"]["rating"] = item["rating"]
        item["product"]["reviewCount"] = item["reviewCount"]
        item["product"]["recommendationScore"] = round(score, 3)

    def sort_key(item):
        product = item["product"]
        created_at = product.get("createdAt")
        if isinstance(created_at, datetime):
            if created_at.tzinfo is None:
                created_at = created_at.replace(tzinfo=timezone.utc)
            created_timestamp = created_at.timestamp()
        elif isinstance(created_at, str):
            try:
                parsed_date = datetime.fromisoformat(
                    created_at.replace("Z", "+00:00")
                )
                if parsed_date.tzinfo is None:
                    parsed_date = parsed_date.replace(tzinfo=timezone.utc)
                created_timestamp = parsed_date.timestamp()
            except ValueError:
                created_timestamp = 0
        else:
            created_timestamp = 0

        return (
            -product["recommendationScore"],
            -product["reviewCount"],
            -created_timestamp,
        )

    rated_products.sort(key=sort_key)
    return [item["product"] for item in rated_products[:limit]]


def rank_personalized_products(
    products,
    user_events,
    peer_seed_events,
    peer_candidate_events,
    user_id,
    limit=12,
    max_neighbors=200,
):
    now = datetime.now(timezone.utc)
    own_seed_weights = {}
    interacted_product_ids = set()
    for event in user_events:
        product_id = str(event.get("productId", ""))
        weight = _interaction_weight(event, now)
        if product_id and weight:
            interacted_product_ids.add(product_id)
            own_seed_weights[product_id] = own_seed_weights.get(product_id, 0) + weight

    if not own_seed_weights:
        return []

    peer_activity_profiles = {}
    for event in peer_candidate_events:
        peer_id = str(event.get("userId", ""))
        product_id = str(event.get("productId", ""))
        weight = _interaction_weight(event, now)
        if peer_id and peer_id != str(user_id) and product_id and weight:
            profile = peer_activity_profiles.setdefault(peer_id, {})
            profile[product_id] = profile.get(product_id, 0) + weight

    peer_seed_weights = {}
    for event in peer_seed_events:
        peer_id = str(event.get("userId", ""))
        product_id = str(event.get("productId", ""))
        weight = _interaction_weight(event, now)
        if peer_id and peer_id != str(user_id) and product_id in own_seed_weights and weight:
            profile = peer_seed_weights.setdefault(peer_id, {})
            profile[product_id] = profile.get(product_id, 0) + weight

    own_norm = math.sqrt(sum(weight ** 2 for weight in own_seed_weights.values()))
    peer_similarities = {}
    for peer_id, profile in peer_seed_weights.items():
        dot_product = sum(
            own_seed_weights[product_id] * weight
            for product_id, weight in profile.items()
        )
        peer_norm = math.sqrt(sum(
            weight ** 2
            for weight in peer_activity_profiles.get(peer_id, {}).values()
        ))
        if own_norm and peer_norm:
            peer_similarities[peer_id] = dot_product / (own_norm * peer_norm)

    top_peers = sorted(
        peer_similarities.items(),
        key=lambda item: item[1],
        reverse=True,
    )[:max_neighbors]
    if not top_peers:
        return []

    peer_similarity_map = dict(top_peers)
    candidate_scores = {}
    candidate_peers = {}
    per_peer_candidate_weight = {}
    for event in peer_candidate_events:
        peer_id = str(event.get("userId", ""))
        product_id = str(event.get("productId", ""))
        if peer_id not in peer_similarity_map or product_id in interacted_product_ids:
            continue
        weight = _interaction_weight(event, now)
        if not weight:
            continue
        peer_products = per_peer_candidate_weight.setdefault(peer_id, {})
        peer_products[product_id] = peer_products.get(product_id, 0) + weight

    for peer_id, peer_products in per_peer_candidate_weight.items():
        similarity = peer_similarity_map[peer_id]
        for product_id, weight in peer_products.items():
            candidate_scores[product_id] = (
                candidate_scores.get(product_id, 0) + similarity * weight
            )
            candidate_peers.setdefault(product_id, set()).add(peer_id)

    if not candidate_scores:
        return []

    max_cf_score = max(candidate_scores.values())
    product_by_id = {str(product.get("_id", "")): product for product in products}
    ranked = []
    for product_id, collaborative_score in candidate_scores.items():
        product = product_by_id.get(product_id)
        if not product:
            continue
        normalized_cf_score = collaborative_score / max_cf_score
        default_score = max(
            0,
            min(1, _as_number(product.get("recommendationScore")) / 5),
        )
        final_score = 0.8 * normalized_cf_score + 0.2 * default_score
        product["recommendationScore"] = round(final_score, 3)
        product["matchedUsers"] = len(candidate_peers[product_id])
        ranked.append(product)

    ranked.sort(
        key=lambda product: (
            -product["recommendationScore"],
            -product["matchedUsers"],
            -_as_number(product.get("rating")),
        )
    )
    return ranked[:limit]


def rank_content_profile_products(
    products,
    profile_products,
    user_events,
    limit=12,
):
    now = datetime.now(timezone.utc)
    product_by_id = {
        str(product.get("_id", "")): product
        for product in profile_products
    }
    interacted_product_ids = set()
    category_profile = {}
    brand_profile = {}

    for event in user_events:
        product_id = str(event.get("productId", ""))
        weight = _interaction_weight(event, now)
        if not product_id or not weight:
            continue
        interacted_product_ids.add(product_id)
        source_product = product_by_id.get(product_id)
        if not source_product:
            continue

        for normalized_category in _product_categories(source_product):
            if normalized_category:
                category_profile[normalized_category] = (
                    category_profile.get(normalized_category, 0) + weight
                )

        brand = str(source_product.get("brand") or "").strip().casefold()
        if brand:
            brand_profile[brand] = brand_profile.get(brand, 0) + weight

    if not category_profile and not brand_profile:
        return []

    category_total = sum(category_profile.values()) or 1
    brand_total = sum(brand_profile.values()) or 1
    content_scores = {}
    for product in products:
        product_id = str(product.get("_id", ""))
        if not product_id or product_id in interacted_product_ids:
            continue

        category_score = sum(
            category_profile.get(category, 0)
            for category in _product_categories(product)
        ) / category_total

        brand = str(product.get("brand") or "").strip().casefold()
        brand_score = brand_profile.get(brand, 0) / brand_total
        score = 0.75 * category_score + 0.25 * brand_score
        if score > 0:
            content_scores[product_id] = score

    if not content_scores:
        return []

    max_content_score = max(content_scores.values())
    product_by_id = {str(product.get("_id", "")): product for product in products}
    ranked = []
    for product_id, content_score in content_scores.items():
        product = product_by_id[product_id]
        default_score = max(
            0,
            min(1, _as_number(product.get("recommendationScore")) / 5),
        )
        final_score = 0.8 * content_score / max_content_score + 0.2 * default_score
        product["recommendationScore"] = round(final_score, 3)
        ranked.append(product)

    ranked.sort(
        key=lambda product: (
            -product["recommendationScore"],
            -_as_number(product.get("rating")),
        )
    )
    return ranked[:limit]
