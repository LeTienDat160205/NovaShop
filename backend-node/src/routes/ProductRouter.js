const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const ReviewRouter = require('./ReviewRouter');
const InteractionController = require('../controllers/InteractionController');
const authMiddleware = require('../middleware/authMiddleware');

router.use('/reviews', ReviewRouter);
router.post('/interactions', authMiddleware.requireCustomer, InteractionController.recordProductView);
router.get('/top-deals', ProductController.getTopDeals);
router.get('/get-all', ProductController.getAllProduct);
router.get('/get-details/:id', ProductController.getDetailsProduct);
router.get('/recommendations', authMiddleware.optional, ProductController.getRecommendations);
router.get('/recommendations/default', ProductController.getDefaultRecommendations);
router.get('/get-similar/:id',ProductController.getSimilarProducts);
router.get('/get-by-category', ProductController.getProductsByCategory);

module.exports = router;