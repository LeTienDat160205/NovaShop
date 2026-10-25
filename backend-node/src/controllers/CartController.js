
const mongoose = require('mongoose');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const { refreshCartPrices, formatCart } = require('../utils/cartUtils');
const recordInteraction = require('../utils/recordInteraction');

// GET /api/cart
const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            return res.status(200).json({
                status: 'OK',
                data: [],
                total: 0
            });
        }

        await refreshCartPrices(cart);
        await cart.save();

        cart = await Cart.findById(cart._id).populate('items.productId');
        const result = formatCart(cart);

        return res.status(200).json({
            status: 'OK',
            data: result.items,
            total: result.total
        });
    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({
            status: 'ERR',
            message: 'Không thể tải giỏ hàng.'
        });
    }
};

// POST /api/cart/items
const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body || {};
        const amount = Number(quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ.' });
        }

        if (!Number.isInteger(amount) || amount < 1 || amount > 99) {
            return res.status(400).json({
                message: 'Số lượng phải là số nguyên từ 1 đến 99.'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({ userId: req.user.id, items: [] });
        }

        const existingItem = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (existingItem) {
            if (existingItem.quantity + amount > 99) {
                return res.status(400).json({
                    message: 'Số lượng tối đa của một sản phẩm là 99.'
                });
            }
            existingItem.quantity += amount;
            existingItem.unitPrice = Number(product.price || 0);
        } else {
            cart.items.push({
                productId,
                quantity: amount,
                unitPrice: Number(product.price || 0),
                totalPrice: Number(product.price || 0) * amount
            });
        }

        await refreshCartPrices(cart);
        await cart.save();
        await recordInteraction(req.user.id, productId, 'cart');

        return res.status(200).json({
            status: 'OK',
            message: 'Đã thêm sản phẩm vào giỏ hàng.',
            total: cart.total
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({
            status: 'ERR',
            message: 'Không thể thêm sản phẩm vào giỏ hàng.'
        });
    }
};

// PATCH /api/cart/items/:productId
const updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const quantity = Number(req.body?.quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ.' });
        }

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            return res.status(400).json({
                message: 'Số lượng phải là số nguyên từ 1 đến 99.'
            });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại.' });
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if (!item) {
            return res.status(404).json({
                message: 'Sản phẩm không có trong giỏ hàng.'
            });
        }

        item.quantity = quantity;
        await refreshCartPrices(cart);
        await cart.save();

        return res.status(200).json({
            status: 'OK',
            message: 'Đã cập nhật số lượng.',
            total: cart.total
        });
    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({
            status: 'ERR',
            message: 'Không thể cập nhật số lượng.'
        });
    }
};

// DELETE /api/cart/items/:productId
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ.' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Giỏ hàng không tồn tại.' });
        }

        cart.items = cart.items.filter(
            item => item.productId.toString() !== productId
        );

        await refreshCartPrices(cart);
        await cart.save();

        return res.status(200).json({
            status: 'OK',
            message: 'Đã xóa sản phẩm khỏi giỏ hàng.',
            total: cart.total
        });
    } catch (error) {
        console.error('Remove cart item error:', error);
        return res.status(500).json({
            status: 'ERR',
            message: 'Không thể xóa sản phẩm.'
        });
    }
};

// DELETE /api/cart
const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (cart) {
            cart.items = [];
            cart.total = 0;
            await cart.save();
        }

        return res.status(200).json({
            status: 'OK',
            message: 'Đã xóa giỏ hàng.',
            total: 0
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({
            status: 'ERR',
            message: 'Không thể xóa giỏ hàng.'
        });
    }
};

module.exports = {
    getCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
};
