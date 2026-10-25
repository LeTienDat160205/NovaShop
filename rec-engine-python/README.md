# NovaShop recommendation engine

The Python service provides recommendations for the home page and product
detail pages:

- Anonymous visitors and accounts without usable interaction history receive
  default recommendations ranked by a Bayesian average of dataset ratings and
  NovaShop customer reviews.
- Signed-in customers with interaction history receive user-neighborhood
  collaborative filtering over implicit feedback. Views, favorites, cart
  additions, and completed purchases have increasing weights; older events
  decay over time. If there are not yet enough similar users, a content profile
  built from the customer's interacted product categories and brands is used.
  Products already interacted with are excluded, and personalized scores are
  blended with the rating-based score.

The Node.js API verifies an optional login token before passing the customer ID
to this service. It records signed-in product views, favorites, cart additions,
and purchases in the `interactions` collection. Anonymous browsing is not
persisted as a user profile.

## Research references

- P. Resnick, N. Iacovou, M. Suchak, P. Bergstrom, and J. Riedl, “GroupLens:
  An Open Architecture for Collaborative Filtering of Netnews,” *Proceedings
  of the 1994 ACM Conference on Computer Supported Cooperative Work*, pp.
  175–186, 1994. DOI:
  [10.1145/192844.192905](https://doi.org/10.1145/192844.192905). A foundational
  user-neighborhood collaborative-filtering system, closely related to finding
  neighbors from overlapping interaction histories.
- Y. Hu, Y. Koren, and C. Volinsky, “Collaborative Filtering for Implicit
  Feedback Datasets,” *2008 IEEE International Conference on Data Mining*,
  pp. 263–272, 2008. DOI:
  [10.1109/ICDM.2008.22](https://doi.org/10.1109/ICDM.2008.22). This paper
  discusses representing implicit actions as preference signals with different
  confidence. Its weighted implicit-feedback formulation is a related method,
  not the exact user-neighborhood implementation in this service.
- B. Sarwar, G. Karypis, J. Konstan, and J. Riedl, “Item-based collaborative
  filtering recommendation algorithms,” *Proceedings of the 10th International
  Conference on World Wide Web*, pp. 285–295, 2001. DOI:
  [10.1145/371920.372071](https://doi.org/10.1145/371920.372071). This is a
  foundational item-neighborhood approach and a useful comparison/extension
  for deriving recommendations from similar products.

The default weighted rating is
`n / (n + m) * R + m / (n + m) * C`, where `R` is a product's average rating,
`n` is its rating count, `C` is the catalog-wide average, and `m` is the
minimum-review prior (currently 5).

## Run locally

1. Install the dependencies from this directory:

   ```powershell
   python -m pip install -r requirements.txt
   ```

2. Ensure `backend-node/.env` contains `MONGO_DB`, or configure `MONGODB_URI`.
3. Start the service from this directory:

   ```powershell
   python server.py
   ```

The service listens on `http://127.0.0.1:8001` by default. Set
`REC_ENGINE_HOST` or `REC_ENGINE_PORT` to override the binding.

The Node.js API proxies `GET /api/product/recommendations` to this service.
Configure `REC_ENGINE_URL` in the backend environment when the recommendation
service runs at a different address.
