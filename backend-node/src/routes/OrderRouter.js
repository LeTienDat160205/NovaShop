const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const OrderController = require('../controllers/OrderController');

const router = express.Router();
router.post('/zalopay/callback', OrderController.handleZaloPayCallback);
router.use(authMiddleware.requireCustomer);
router.post('/', OrderController.createOrder);
router.get('/mine', OrderController.getMyOrders);
router.get('/:id', OrderController.getMyOrder);
router.post('/:id/cancel', OrderController.cancelMyOrder);

module.exports = router;
