const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const AdminCartController = require('../controllers/AdminCartController');

const router = express.Router();
router.use(authMiddleware.requireAdmin);
router.get('/products', AdminCartController.getProducts);
router.get('/', AdminCartController.getCustomerCarts);
router.post('/:userId/items', AdminCartController.addItem);
router.patch('/:userId/items/:productId', AdminCartController.updateItem);
router.delete('/:userId/items/:productId', AdminCartController.removeItem);

module.exports = router;
