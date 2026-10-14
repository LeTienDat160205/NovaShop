const express = require('express');
const router = express.Router();
const AdminProductController = require('../controllers/AdminProductController');
const authMiddleware = require('../middleware/authMiddleware');

// Áp dụng middleware kiểm tra quyền Admin cho toàn bộ route
router.use(authMiddleware.requireAdmin);

// LƯU Ý: Khai báo /categories TRƯỚC /:id để tránh Express nhầm 'categories' là tham số :id
router.get('/categories', AdminProductController.getAdminCategories);

// Danh sách sản phẩm (phân trang, tìm kiếm)
router.get('/', AdminProductController.getAdminProducts);

// Chi tiết 1 sản phẩm
router.get('/:id', AdminProductController.getAdminProductDetails);

// Tạo sản phẩm mới
router.post('/', AdminProductController.createAdminProduct);

// Cập nhật sản phẩm
router.put('/:id', AdminProductController.updateAdminProduct);

// Xóa cứng sản phẩm
router.delete('/:id', AdminProductController.deleteAdminProduct);

module.exports = router;
