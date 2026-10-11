const mongoose = require('mongoose');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');

const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');

        const items = (cart?.items || [])
            .filter(item => item.productId)
            .map(item => ({
                productId: item.productId._id.toString(),
                name: item.productId.name,
                price: item.productId.price,
                listPrice: item.productId.listPrice || item.productId.price,
                image: item.productId.images?.[0] || '',
                images: item.productId.images || [],
                quantity: item.quantity,
                addedAt: item.addedAt
            }));

        return res.status(200).json({ status: 'OK', data: items });
    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ message: 'Không thể tải giỏ hàng.' });
    }
};

const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body || {};
        const amount = Number(quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ.' });
        }
        if (!Number.isInteger(amount) || amount < 1 || amount > 99) {
            return res.status(400).json({ message: 'Số lượng phải từ 1 đến 99.' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

        const existingItem = cart.items.find(item => item.productId.toString() === productId);

        if (existingItem) {
            if (existingItem.quantity + amount > 99) {
                return res.status(400).json({ message: 'Số lượng tối đa của một sản phẩm là 99.' });
            }
            existingItem.quantity += amount;
        } else {
            cart.items.push({ productId, quantity: amount });
        }

        await cart.save();
        return res.status(200).json({ status: 'OK', message: 'Đã thêm sản phẩm vào giỏ hàng.' });
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ message: 'Không thể thêm sản phẩm vào giỏ hàng.' });
    }
};

const updateQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const quantity = Number(req.body?.quantity);

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ.' });
        }
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            return res.status(400).json({ message: 'Số lượng phải từ 1 đến 99.' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại.' });

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng.' });

        item.quantity = quantity;
        await cart.save();

        return res.status(200).json({ status: 'OK', message: 'Đã cập nhật số lượng.' });
    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({ message: 'Không thể cập nhật số lượng.' });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Mã sản phẩm không hợp lệ.' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) return res.status(404).json({ message: 'Giỏ hàng không tồn tại.' });

        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await cart.save();

        return res.status(200).json({ status: 'OK', message: 'Đã xóa sản phẩm khỏi giỏ hàng.' });
    } catch (error) {
        console.error('Remove cart item error:', error);
        return res.status(500).json({ message: 'Không thể xóa sản phẩm.' });
    }
};

const clearCart = async (req, res) => {
    try {
        await Cart.findOneAndUpdate(
            { userId: req.user.id },
            { $set: { items: [] } }
        );
        return res.status(200).json({ status: 'OK', message: 'Đã xóa giỏ hàng.' });
    } catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({ message: 'Không thể xóa giỏ hàng.' });
    }
};

module.exports = { getCart, addToCart, updateQuantity, removeFromCart, clearCart };