const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const FavoriteController = require('../controllers/FavoriteController');

const router = express.Router();
router.use(authMiddleware.requireCustomer);
router.get('/', FavoriteController.getFavorites);
router.get('/contains/:productId', FavoriteController.checkFavorite);
router.put('/:productId', FavoriteController.addFavorite);
router.delete('/:productId', FavoriteController.removeFavorite);

module.exports = router;
