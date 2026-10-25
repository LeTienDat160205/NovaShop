const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
router.put('/profile', authMiddleware, AuthController.updateProfile);

module.exports = router;
