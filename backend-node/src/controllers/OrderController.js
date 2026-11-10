const mongoose = require('mongoose');
const Cart = require('../models/CartModel');
const Order = require('../models/OrderModel');
const { refreshCartPrices } = require('../utils/cartUtils');
const { createZaloPayPayment, verifyCallback, getConfig } = require('../utils/zalopayPayment');
const recordInteraction = require('../utils/recordInteraction');

const formatOrder = (order) => ({
    id: order._id.toString(),
    status: order.status,
    totalPrice: order.totalPrice,
    createdAt: order.createdAt,
    payment: order.paymentMethod === 'COD' ? 'cod' : 'zalopay',
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentTransactionId: order.paymentTransactionId,
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

const removeOrderedItemsFromCart = async (userId, items) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) return;

    const quantities = new Map(
        items.map(item => [item.productId.toString(), Number(item.quantity)])
    );
    cart.items = cart.items.flatMap(item => {
        const productId = item.productId.toString();
        const orderedQuantity = quantities.get(productId) || 0;
        const remainingQuantity = Number(item.quantity) - orderedQuantity;
        return remainingQuantity > 0
            ? [{ ...item.toObject(), quantity: remainingQuantity }]
            : [];
    });
    await refreshCartPrices(cart);
    await cart.save();
};

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
        if (!['COD', 'ZALOPAY'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Phương thức thanh toán không hợp lệ.' });
        }
        if (paymentMethod === 'ZALOPAY') {
            try {
                getConfig();
            } catch (error) {
                console.error('ZaloPay configuration error:', error);
                return res.status(503).json({ message: 'Thanh toán ZaloPay chưa được cấu hình.' });
            }
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
            paymentStatus: paymentMethod === 'ZALOPAY' ? 'Pending' : 'NotRequired',
            status: 'Pending'
        });
        if (paymentMethod === 'COD') {
            await Promise.all(orderItems.map(item =>
                recordInteraction(req.user.id, item.productId, 'purchase')
            ));
        }

        if (paymentMethod === 'ZALOPAY') {
            try {
                const { payUrl, transactionId } = await createZaloPayPayment(order);
                order.paymentTransactionId = transactionId;
                await order.save();
                return res.status(201).json({
                    message: 'Đã tạo yêu cầu thanh toán ZaloPay.',
                    data: { id: order._id, payUrl, paymentStatus: order.paymentStatus }
                });
            } catch (error) {
                await Order.findByIdAndUpdate(order._id, { paymentStatus: 'Failed' });
                console.error('Create ZaloPay payment error:', error);
                return res.status(502).json({ message: 'Không thể khởi tạo thanh toán ZaloPay. Vui lòng thử lại.', detail: error.message });
            }
        }

        await removeOrderedItemsFromCart(req.user.id, order.items);
        return res.status(201).json({
            message: 'Đặt hàng thành công.',
            data: { id: order._id, paymentStatus: order.paymentStatus }
        });
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

const getMyOrder = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID đơn hàng không hợp lệ.' });
        }
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id })
            .populate('items.productId', 'name images')
            .lean();
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        return res.status(200).json({ data: formatOrder(order) });
    } catch (error) {
        console.error('Get customer order error:', error);
        return res.status(500).json({ message: 'Không thể tải chi tiết đơn hàng.' });
    }
};

const cancelMyOrder = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID đơn hàng không hợp lệ.' });
        }
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
        if (order.status !== 'Pending') {
            return res.status(409).json({ message: 'Chỉ có thể hủy đơn hàng đang chờ xác nhận.' });
        }
        if (order.paymentStatus === 'Paid') {
            return res.status(409).json({ message: 'Đơn hàng đã thanh toán; vui lòng liên hệ hỗ trợ để được xử lý.' });
        }
        if (order.paymentMethod === 'ZALOPAY' && order.paymentStatus === 'Pending') {
            return res.status(409).json({ message: 'Thanh toán ZaloPay đang chờ xác nhận; chưa thể hủy đơn này.' });
        }

        const cancelledOrder = await Order.findOneAndUpdate(
            {
                _id: order._id,
                userId: req.user.id,
                status: 'Pending',
                paymentStatus: order.paymentStatus
            },
            { $set: { status: 'Cancelled' } },
            { new: true }
        ).populate('items.productId', 'name images');
        if (!cancelledOrder) {
            return res.status(409).json({ message: 'Trạng thái đơn hàng vừa thay đổi. Vui lòng tải lại.' });
        }
        return res.status(200).json({ message: 'Đã hủy đơn hàng.', data: formatOrder(cancelledOrder) });
    } catch (error) {
        console.error('Cancel customer order error:', error);
        return res.status(500).json({ message: 'Không thể hủy đơn hàng lúc này.' });
    }
};

const handleZaloPayCallback = async (req, res) => {
    try {
        const payload = req.body || {}; const data = JSON.parse(payload.data || '{}');
        const c = getConfig();
        if (!verifyCallback(payload, c.key2) || !mongoose.isValidObjectId(data.app_trans_id?.split('_').slice(1).join('_'))) return res.status(400).json({ return_code: -1, return_message: 'Callback không hợp lệ.' });
        const order = await Order.findOne({ _id: data.app_trans_id.split('_').slice(1).join('_'), paymentMethod: 'ZALOPAY' });
        if (!order || Number(data.amount) !== Math.round(order.totalPrice)) return res.status(400).json({ return_code: -1, return_message: 'Đơn hàng hoặc số tiền không khớp.' });
        if (order.paymentStatus === 'Paid') return res.json({ return_code: 1, return_message: 'Giao dịch đã được xác nhận.' });
        if (Number(data.status) === 1) {
            const updatedOrder = await Order.findOneAndUpdate({ _id: order._id, paymentStatus: 'Pending', status: 'Pending' }, { $set: { paymentStatus: 'Paid', paymentTransactionId: data.zp_trans_id ? String(data.zp_trans_id) : order.paymentTransactionId } }, { new: true });
            if (!updatedOrder) {
                return res.json({ return_code: 1, return_message: 'Đã xử lý.' });
            }
            await Promise.all(updatedOrder.items.map(item =>
                recordInteraction(updatedOrder.userId, item.productId, 'purchase')
            ));
            await removeOrderedItemsFromCart(updatedOrder.userId, updatedOrder.items);
        } else if (order.paymentStatus === 'Pending') {
            order.paymentStatus = 'Failed';
            await order.save();
        }
        return res.json({ return_code: 1, return_message: 'Đã nhận callback.' });
    } catch (error) {
        console.error('ZaloPay callback error:', error);
        return res.status(500).json({ return_code: -1, return_message: 'Không thể xử lý callback.' });
    }
};

module.exports = { createOrder, getMyOrders, getMyOrder, cancelMyOrder, handleZaloPayCallback };
