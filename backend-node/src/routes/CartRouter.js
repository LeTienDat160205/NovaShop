const express = require('express');
const CartController = require('../controllers/CartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.get('/', CartController.getCart);
router.post('/items', CartController.addToCart);
router.patch('/items/:productId', CartController.updateQuantity);
router.delete('/items/:productId', CartController.removeFromCart);
router.delete('/', CartController.clearCart);

module.exports = router;