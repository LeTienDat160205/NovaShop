# NovaShop recommendation system

> Living implementation note. Update this document in the same change whenever
> interaction collection, ranking weights, scoring formulas, API behavior, or
> recommendation placement changes.

Last updated: 2026-10-25

## Where recommendations appear

- The home page shows three separate sections after the banner: **Top deal**
  (up to six products with the largest actual discount, sorted server-side),
  **Đề xuất** (up to twelve products), and
  **Các sản phẩm khác**. Deals are orange/red, recommendations are blue, and
  products in the first two sections are excluded from the general list.
- The homepage sections use a white Tiki-like panel and provide **Xem tất cả**
  links to paginated lists at `/recommendations/deals` and
  `/recommendations/recommended`. Each destination loads 24 products per page
  and offers **Xem thêm sản phẩm** while more results are available.
- The product detail page uses the same recommendation component and excludes
  the product currently being viewed.
- The component displays whether results are personalized or based on ratings.
- Product cards display the original price and calculate the discount
  percentage from `listPrice` / `list_price` and `price` when the original
  price exceeds the sale price.
- Top deals come from `GET /api/product/top-deals`, which sorts catalog
  discounts rather than selecting deals from a random product sample. It
  supports `page` and `limit` for the all-deals page.

Frontend entry points:

- `frontend/src/components/RecommendedProducts/RecommendedProducts.jsx`
- `frontend/src/pages/HomePage/HomePage.jsx`
- `frontend/src/components/ProductDetailsComponent/ProductDetailsComponent.jsx`

## Interaction collection

Signed-in customer interactions are stored as documents in MongoDB's
`interactions` collection using `InteractionModel`:

| Type | Collected when | Relative weight |
| --- | --- | ---: |
| `view` | A signed-in customer opens a product detail page. Repeated views of the same product within 30 minutes are deduplicated. | 1 |
| `favorite` | A customer adds a product to favorites. | 3 |
| `cart` | A customer adds a product to the cart. | 4 |
| `purchase` | A COD order is created, or a MoMo payment is confirmed by its IPN callback. | 6 |

Every interaction has `userId`, `productId`, `type`, `createdAt`, and
`updatedAt`. Anonymous browsing is not added to a user profile. Removing a
favorite or cart item does not currently create a negative event.

Collection code:

- `backend-node/src/models/InteractionModel.js`
- `backend-node/src/controllers/InteractionController.js`
- `backend-node/src/utils/recordInteraction.js`
- `backend-node/src/controllers/FavoriteController.js`
- `backend-node/src/controllers/CartController.js`
- `backend-node/src/controllers/OrderController.js`
- `frontend/src/pages/ProductDetailsPage/ProductDetailsPage.jsx`

## Recommendation selection

The frontend calls `GET /api/product/recommendations`. The Node API validates
an optional bearer token and passes a verified customer ID to the Python
engine; the browser cannot choose another user's ID.

1. **Anonymous visitor:** return the default rating-based ranking.
2. **Signed-in customer without usable events:** return the same default
   ranking.
3. **Signed-in customer with events and similar users:** use user-neighborhood
   collaborative filtering over implicit feedback.
4. **Signed-in customer with events but no useful neighbors/candidates:** build
   a content profile from the leaf categories and brands of interacted
   products.
5. **No personalized candidates:** fall back to the default ranking.

The request may include `limit` (1-24), `page` (starting at 1),
`excludeProductId`, and `excludeProductIds`. The response contains `mode`
(`default` or `personalized`), the ranked `data`, and `hasMore` for pagination.
Default rankings provide an exact total; personalized rankings keep the same
ranking mode across pages and indicate more results when a full page is
returned.

## Scoring

### Default ranking by ratings

Dataset ratings from `datasetratings` (`source: ReviewClean`) and NovaShop
reviews are combined. When there are no imported dataset ratings, an existing
catalog rating is treated as one rating alongside NovaShop reviews.

The Bayesian score is:

```text
score = n / (n + m) * R + m / (n + m) * C
```

- `R`: product average rating
- `n`: number of rating observations used for the product
- `C`: catalog-wide weighted average rating
- `m`: minimum-review prior, currently `5`

Products are sorted by this score, then review count, then newest creation
date. With no rating evidence, newer products appear first.

### Interaction strength and recency

Action weights are defined in `rec-engine-python/recommendation_engine.py`.
Each event's weight is reduced with a 60-day half-life:

```text
event_weight = action_weight * 0.5 ** (age_in_days / 60)
```

### Collaborative filtering

The engine forms weighted product-interaction vectors for the customer and
other customers. It calculates cosine similarity on shared interacted
products, using each neighbor's full recent interaction profile for
normalization. Up to 200 closest neighbors contribute their weighted
interactions to candidate products. Products the customer has already
interacted with are excluded.

The combined score is:

```text
final_score = 0.8 * normalized_neighbor_score + 0.2 * normalized_default_score
```

### Content-profile fallback for a signed-in customer

When collaborative filtering cannot produce candidates, the engine compares
candidate products with the categories and brands of the customer's
interactions. The leaf category profile contributes 75%, brand profile 25%;
the result is blended with the default score using the same 80% personalized,
20% default proportions. Already-interacted products are excluded.

## Engine operation and performance

- Python service: `rec-engine-python/server.py`
- Ranking functions: `rec-engine-python/recommendation_engine.py`
- Node proxy: `backend-node/src/controllers/ProductController.js`
- Route: `GET /api/product/recommendations`
- All-deals route: `GET /api/product/top-deals`
- Default engine URL: `http://localhost:8001`
- Override with backend environment variable `REC_ENGINE_URL`.
- Product catalog and rating aggregates are cached in-process for five
  minutes. Interaction histories are queried for each personalized request.
- Personalized retrieval currently limits the customer's history to 500
  events, seed matches to 20,000 events, and neighbor candidate events to
  25,000 events. The interaction lookback for neighbors is one year.

Run the engine from `rec-engine-python`:

```powershell
python -m pip install -r requirements.txt
python server.py
```

## Research informing the design

- P. Resnick et al., “GroupLens: An Open Architecture for Collaborative
  Filtering of Netnews,” CSCW 1994.
  [DOI: 10.1145/192844.192905](https://doi.org/10.1145/192844.192905).
- Y. Hu, Y. Koren, and C. Volinsky, “Collaborative Filtering for Implicit
  Feedback Datasets,” ICDM 2008.
  [DOI: 10.1109/ICDM.2008.22](https://doi.org/10.1109/ICDM.2008.22).
- B. Sarwar et al., “Item-based collaborative filtering recommendation
  algorithms,” WWW 2001.
  [DOI: 10.1145/371920.372071](https://doi.org/10.1145/371920.372071).

## Change log

| Date | Change |
| --- | --- |
| 2026-10-25 | Initial behavior collection, default Bayesian rating rank, implicit user-neighborhood filtering, content-profile fallback, and UI placement documented. |
| 2026-10-25 | Homepage organized into Top deal, 12-item recommendations, and remaining products; white panels link to paginated all-items pages; top deals sorted by actual discount; cards calculate discount display from original and sale price. |
| 2026-10-25 | All-deals and recommendation pages request 24-item pages and expose `hasMore` for consistent pagination. |
