const express = require('express');
const AuthController = require('../controllers/AuthController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);
router.put('/profile', authMiddleware, AuthController.updateProfile);
router.put('/avatar', authMiddleware, AuthController.updateAvatar);
router.get('/me', async (req, res, next) => {
    const authMiddleware = require('../middleware/authMiddleware');
    return authMiddleware(req, res, async () => {
        const User = require('../models/UserModel');
        const user = await User.findById(req.user.id).select('-password -resetPasswordTokenHash -resetPasswordExpires');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        return res.json({ user });
    });
});

module.exports = router;
