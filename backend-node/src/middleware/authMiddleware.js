const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token || !process.env.JWT_SECRET) {
        return res.status(401).json({ message: 'Vui lòng đăng nhập để sử dụng giỏ hàng.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.sub || decoded._id, role: decoded.role };
        if (!req.user.id) return res.status(401).json({ message: 'Token không hợp lệ.' });
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' });
    }
};

const requireAdmin = (req, res, next) => {
    authMiddleware(req, res, async () => {
        try {
            const user = await User.findById(req.user.id).select('role');
            if (!user) {
                return res.status(401).json({ message: 'Tài khoản không tồn tại trên hệ thống.' });
            }
            if (user.role !== 'Admin') {
                return res.status(403).json({ message: 'Bạn không có quyền quản trị viên (Admin) để thực hiện thao tác này.' });
            }
            req.currentUser = user;
            next();
        } catch (error) {
            return res.status(500).json({ message: 'Lỗi máy chủ khi kiểm tra quyền quản trị: ' + error.message });
        }
    });
};

authMiddleware.verifyToken = authMiddleware;
authMiddleware.requireAdmin = requireAdmin;

module.exports = authMiddleware;