const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const AdminOrderController = require('../controllers/AdminOrderController');

const router = express.Router();
router.use(authMiddleware.requireAdmin);
router.get('/', AdminOrderController.getOrders);
router.patch('/:id/status', AdminOrderController.updateOrderStatus);

module.exports = router;
