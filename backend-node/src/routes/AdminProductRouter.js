const express = require('express');
const router = express.Router();
const AdminProductController = require('../controllers/AdminProductController');
const authMiddleware = require('../middleware/authMiddleware');


router.use(authMiddleware.requireAdmin);


router.get('/categories', AdminProductController.getAdminCategories);


router.get('/', AdminProductController.getAdminProducts);


router.get('/:id', AdminProductController.getAdminProductDetails);


router.post('/', AdminProductController.createAdminProduct);


router.put('/:id', AdminProductController.updateAdminProduct);


router.delete('/:id', AdminProductController.deleteAdminProduct);

module.exports = router;
