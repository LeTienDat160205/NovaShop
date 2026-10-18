const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const ReviewRouter = require('./ReviewRouter');

router.use('/reviews', ReviewRouter);
router.get('/get-all', ProductController.getAllProduct);
router.get('/get-details/:id', ProductController.getDetailsProduct);
router.get('/get-similar/:id',ProductController.getSimilarProducts);
router.get('/get-by-category', ProductController.getProductsByCategory);

module.exports = router;