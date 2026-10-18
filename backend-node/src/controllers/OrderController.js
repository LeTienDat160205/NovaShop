const mongoose = require('mongoose');
const Cart = require('../models/CartModel');
const Order = require('../models/OrderModel');
const { refreshCartPrices } = require('../utils/cartUtils');

const formatOrder = (order) => ({
    id: order._id,
    status: order.status,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    payment: order.paymentMethod === 'COD' ? 'cod' : 'card',
    shippingInfo: {
        name: order.shippingName,
        phone: order.shippingPhone,
        address: order.shippingAddress
    },
    items: (order.items || []).filter(item => item.productId).map(item => ({
        productId: item.productId._id,
        name: item.productId.name,
        image: item.productId.images?.[0] || '',
        price: item.price,
        quantity: item.quantity
    }))
});

const createOrder = async (req, res) => {
    try {
        const {
            checkoutUserId,
            items,
            shippingName,
            shippingPhone,
            shippingAddress,
            paymentMethod
        } = req.body || {};
        if (typeof checkoutUserId !== 'string' || checkoutUserId !== req.user.id) {
            return res.status(403).json({
                message: 'Phiên thanh toán không còn thuộc tài khoản đang đăng nhập. Vui lòng bắt đầu lại.'
            });
        }
        if (!Array.isArray(items) || !items.length) {
            return res.status(400).json({ message: 'Đơn hàng cần có ít nhất một sản phẩm.' });
        }
        if (items.length > 100) {
            return res.status(400).json({ message: 'Đơn hàng có quá nhiều sản phẩm.' });
        }
        if (![shippingName, shippingPhone, shippingAddress].every(value => typeof value === 'string' && value.trim())) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin giao hàng.' });
        }
        if (shippingName.trim().length > 100 || shippingAddress.trim().length > 300) {
            return res.status(400).json({ message: 'Tên người nhận hoặc địa chỉ vượt quá độ dài cho phép.' });
        }
        if (!/^(0\d{9}|\+84\d{9})$/.test(shippingPhone.trim())) {
            return res.status(400).json({ message: 'Số điện thoại giao hàng không hợp lệ.' });
        }
        if (!['COD', 'CARD'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
        }

        const requested = new Map();
        for (const item of items) {
            if (
                !mongoose.isValidObjectId(item?.productId)
                || !Number.isInteger(Number(item?.quantity))
                || Number(item.quantity) < 1
                || Number(item.quantity) > 99
            ) {
                return res.status(400).json({ message: 'Sản phẩm hoặc số lượng không hợp lệ.' });
            }
            const productId = String(item.productId).toLowerCase();
            const quantity = (requested.get(productId) || 0) + Number(item.quantity);
            if (quantity > 99) {
                return res.status(400).json({ message: 'Số lượng một sản phẩm không được vượt quá 99.' });
            }
            requested.set(productId, quantity);
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(400).json({ message: 'Giỏ hàng không tồn tại.' });
        await refreshCartPrices(cart);

        const orderItems = [];
        for (const [productId, quantity] of requested) {
            const cartItem = cart.items.find(item => item.productId.toString() === productId);
            if (!cartItem || quantity > cartItem.quantity) {
                return res.status(400).json({ message: 'Sản phẩm hoặc số lượng trong giỏ hàng đã thay đổi. Vui lòng tải lại giỏ hàng.' });
            }
            orderItems.push({
                productId: cartItem.productId,
                quantity,
                price: Number(cartItem.unitPrice)
            });
        }

        const totalPrice = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
        const order = await Order.create({
            userId: req.user.id,
            items: orderItems,
            totalPrice,
            shippingName: shippingName.trim(),
            shippingPhone: shippingPhone.trim(),
            shippingAddress: shippingAddress.trim(),
            paymentMethod,
            status: 'Pending'
        });

        const purchasedIds = new Set(requested.keys());
        cart.items = cart.items.filter(item => !purchasedIds.has(item.productId.toString()));
        await refreshCartPrices(cart);
        await cart.save();

        return res.status(201).json({ message: 'Đặt hàng thành công.', data: { id: order._id } });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ message: 'Không thể tạo đơn hàng.' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .populate('items.productId', 'name images')
            .sort({ createdAt: -1 })
            .lean();
        return res.status(200).json({ data: orders.map(formatOrder) });
    } catch (error) {
        console.error('Get customer orders error:', error);
        return res.status(500).json({ message: 'Không thể tải đơn hàng.' });
    }
};

module.exports = { createOrder, getMyOrders };
