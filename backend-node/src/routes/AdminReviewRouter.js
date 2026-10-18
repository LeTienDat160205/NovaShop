const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const AdminReviewController = require('../controllers/AdminReviewController');

const router = express.Router();
router.use(authMiddleware.requireAdmin);
router.get('/', AdminReviewController.getReviews);
router.delete('/:id', AdminReviewController.deleteReview);

module.exports = router;
