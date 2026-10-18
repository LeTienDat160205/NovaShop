const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const OrderController = require('../controllers/OrderController');

const router = express.Router();
router.use(authMiddleware.requireCustomer);
router.post('/', OrderController.createOrder);
router.get('/mine', OrderController.getMyOrders);

module.exports = router;
