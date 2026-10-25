const mongoose = require('mongoose');
const Order = require('../models/OrderModel');

const statuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

const getOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email phone')
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ data: orders });
    } catch (error) {
        console.error('Get admin orders error:', error);
        return res.status(500).json({ message: 'Không thể tải danh sách đơn hàng.' });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body || {};
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID đơn hàng không hợp lệ.' });
        }
        if (!statuses.includes(status)) {
            return res.status(400).json({ message: 'Trạng thái đơn hàng không hợp lệ.' });
        }
        const existingOrder = await Order.findById(req.params.id);
        if (!existingOrder) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        if (
            ['Processing', 'Delivered'].includes(status)
            && existingOrder.paymentMethod === 'MOMO'
            && existingOrder.paymentStatus !== 'Paid'
        ) {
            return res.status(409).json({ message: 'Chỉ có thể xử lý đơn MoMo sau khi thanh toán thành công.' });
        }
        existingOrder.status = status;
        const order = await existingOrder.save();
        await order.populate('userId', 'name email phone');
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        return res.status(200).json({ message: 'Đã cập nhật trạng thái đơn hàng.', data: order });
    } catch (error) {
        console.error('Update admin order status error:', error);
        return res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn hàng.' });
    }
};

module.exports = { getOrders, updateOrderStatus };
