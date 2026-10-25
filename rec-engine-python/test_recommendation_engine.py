import unittest

from recommendation_engine import (
    rank_content_profile_products,
    rank_personalized_products,
    rank_products,
)


class RankProductsTests(unittest.TestCase):
    def test_bayesian_score_uses_review_count_and_rating(self):
        products = [
            {"_id": "well-reviewed", "rating": 0},
            {"_id": "few-reviews", "rating": 0},
        ]
        summaries = {
            "well-reviewed": {"count": 100, "ratingSum": 450},
            "few-reviews": {"count": 1, "ratingSum": 1},
        }

        ranked = rank_products(products, summaries)

        self.assertEqual(ranked[0]["_id"], "well-reviewed")
        self.assertGreater(
            ranked[0]["recommendationScore"],
            ranked[1]["recommendationScore"],
        )

    def test_dataset_ratings_are_combined_with_customer_reviews(self):
        ranked = rank_products(
            [{"_id": "product"}],
            {
                "product": {
                    "count": 4,
                    "ratingSum": 17,
                    "datasetCount": 3,
                }
            },
        )

        self.assertEqual(ranked[0]["rating"], 4.3)
        self.assertEqual(ranked[0]["reviewCount"], 4)

    def test_legacy_rating_is_combined_with_customer_reviews(self):
        ranked = rank_products(
            [{"_id": "product", "rating": 4}],
            {
                "product": {
                    "count": 1,
                    "ratingSum": 2,
                    "datasetCount": 0,
                }
            },
        )

        self.assertEqual(ranked[0]["rating"], 3)

    def test_excludes_current_product_and_caps_result_count(self):
        products = [{"_id": str(index), "rating": 4.5} for index in range(5)]

        ranked = rank_products(
            products,
            {},
            limit=2,
            exclude_product_id="0",
        )

        self.assertEqual(len(ranked), 2)
        self.assertNotIn("0", [product["_id"] for product in ranked])

    def test_excludes_multiple_products_from_recommendations(self):
        products = [{"_id": str(index), "rating": 4.5} for index in range(5)]

        ranked = rank_products(
            products,
            {},
            limit=5,
            exclude_product_ids=["0", "1"],
        )

        self.assertEqual(len(ranked), 3)
        self.assertNotIn("0", [product["_id"] for product in ranked])
        self.assertNotIn("1", [product["_id"] for product in ranked])

    def test_products_without_rating_sort_newest_first(self):
        products = [
            {"_id": "older", "createdAt": "2025-01-01"},
            {"_id": "newer", "createdAt": "2025-02-01"},
        ]

        ranked = rank_products(products, {})

        self.assertEqual([product["_id"] for product in ranked], ["newer", "older"])

    def test_personalized_ranking_uses_implicit_action_strength(self):
        products = [
            {"_id": "purchased", "rating": 3, "recommendationScore": 3},
            {"_id": "viewed", "rating": 5, "recommendationScore": 5},
            {"_id": "already-seen", "rating": 5, "recommendationScore": 5},
        ]
        user_events = [
            {"userId": "customer", "productId": "already-seen", "type": "cart"}
        ]
        peer_seed_events = [
            {"userId": "neighbor", "productId": "already-seen", "type": "view"}
        ]
        peer_candidate_events = [
            {"userId": "neighbor", "productId": "purchased", "type": "purchase"},
            {"userId": "neighbor", "productId": "viewed", "type": "view"},
        ]

        ranked = rank_personalized_products(
            products,
            user_events,
            peer_seed_events,
            peer_candidate_events,
            "customer",
        )

        self.assertEqual([product["_id"] for product in ranked], ["purchased", "viewed"])
        self.assertNotIn("already-seen", [product["_id"] for product in ranked])

    def test_personalized_recommendations_need_neighbor_interactions(self):
        ranked = rank_personalized_products(
            [{"_id": "candidate", "recommendationScore": 4}],
            [{"productId": "seen", "type": "view"}],
            [],
            [],
            "customer",
        )

        self.assertEqual(ranked, [])

    def test_content_profile_uses_user_history_when_no_neighbors_exist(self):
        profile_products = [
            {
                "_id": "seen-audio",
                "categoryPath": ["Electronics", "Audio"],
                "brand": "Acme",
            },
            {
                "_id": "related-audio",
                "categoryPath": ["Electronics", "Audio"],
                "brand": "Other",
                "recommendationScore": 3,
            },
            {
                "_id": "unrelated-phone",
                "categoryPath": ["Electronics", "Phones"],
                "brand": "Other",
                "recommendationScore": 5,
            },
        ]

        ranked = rank_content_profile_products(
            profile_products[1:],
            profile_products,
            [{"productId": "seen-audio", "type": "view"}],
        )

        self.assertEqual([product["_id"] for product in ranked], ["related-audio"])


if __name__ == "__main__":
    unittest.main()
