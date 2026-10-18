const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const ReviewController = require('../controllers/ReviewController');

const router = express.Router();
router.get('/:productId', ReviewController.getProductReviews);
router.post('/:productId', authMiddleware.requireCustomer, ReviewController.createOrUpdateReview);

module.exports = router;
