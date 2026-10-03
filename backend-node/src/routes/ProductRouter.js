const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

router.get('/get-all', ProductController.getAllProduct);
router.get('/get-details/:id', ProductController.getDetailsProduct);

module.exports = router;