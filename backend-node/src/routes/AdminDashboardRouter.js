const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const AdminDashboardController = require('../controllers/AdminDashboardController');

const router = express.Router();
router.use(authMiddleware.requireAdmin);
router.get('/', AdminDashboardController.getDashboard);

module.exports = router;
