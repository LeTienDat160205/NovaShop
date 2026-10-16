const express = require('express');
const AdminUserController = require('../controllers/AdminUserController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get(
    '/',
    authMiddleware.requireAdmin,
    AdminUserController.getAllUsers
);

router.patch(
    '/:id/role',
    authMiddleware.requireAdmin,
    AdminUserController.updateUserRole
);

router.delete(
    '/:id',
    authMiddleware.requireAdmin,
    AdminUserController.deleteUser
);

module.exports = router;