const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/UserModel');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token || !process.env.JWT_SECRET) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập để sử dụng giỏ hàng.' });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res.status(401).json({ message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
    }

    const userId = decoded.sub || decoded._id;
    if (!mongoose.isValidObjectId(userId)) {
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }

    try {
        const user = await User.findById(userId).select('role');
        if (!user) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại trên hệ thống.' });
        }
        req.user = { id: user._id.toString(), role: user.role };
        return next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Không thể xác minh tài khoản.' });
    }
};

const requireRole = (role, message) => (req, res, next) => authMiddleware(req, res, () => {
    if (req.user.role !== role) {
        return res.status(403).json({ message });
    }
    req.currentUser = req.user;
    return next();
});

const requireAdmin = requireRole(
    'Admin',
    'Bạn không có quyền quản trị viên (Admin) để thực hiện thao tác này.'
);
const requireCustomer = requireRole(
    'Customer',
    'Tài khoản khách hàng mới được phép thực hiện thao tác này.'
);

authMiddleware.verifyToken = authMiddleware;
authMiddleware.optional = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
        return next();
    }
    return authMiddleware(req, res, next);
};
authMiddleware.requireAdmin = requireAdmin;
authMiddleware.requireCustomer = requireCustomer;

module.exports = authMiddleware;