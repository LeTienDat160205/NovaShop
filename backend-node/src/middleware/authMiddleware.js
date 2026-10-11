const jwt = require('jsonwebtoken');

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

module.exports = authMiddleware;