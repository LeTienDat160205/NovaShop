const mongoose = require('mongoose');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');
const { refreshCartPrices, formatCart } = require('../utils/cartUtils');

const getCustomerCarts = async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const filter = { role: 'Customer' };
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedSearch, 'i');
            filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
        }

        const users = await User.find(filter)
            .select('name email phone role')
            .sort({ name: 1 })
            .lean();
        const carts = await Cart.find({ userId: { $in: users.map(user => user._id) } })
            .populate('items.productId', 'name price listPrice images')
            .lean();
        const cartByUser = new Map(carts.map(cart => [cart.userId.toString(), cart]));
        const data = users.map(user => {
            const cart = cartByUser.get(user._id.toString());
            const formatted = formatCart(cart);
            return {
                user: { id: user._id, name: user.name, email: user.email, phone: user.phone || '' },
                items: formatted.items,
                total: formatted.total
            };
        });

        return res.status(200).json({ data });
    } catch (error) {
        console.error('Get customer carts error:', error);
        return res.status(500).json({ message: 'Không thể tải danh sách giỏ hàng.' });
    }
};

const getProducts = async (req, res) => {
    try {
        const search = String(req.query.search || '').trim();
        const filter = search
            ? { name: new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
            : {};
        const products = await Product.find(filter)
            .select('name price images')
            .sort({ name: 1 })
            .limit(100)
            .lean();
        return res.status(200).json({ data: products });
    } catch (error) {
        console.error('Get admin cart products error:', error);
        return res.status(500).json({ message: 'Không thể tải danh sách sản phẩm.' });
    }
};

const getCustomerCart = async (userId) => {
    if (!mongoose.isValidObjectId(userId)) return { error: 'invalid' };
    const user = await User.findOne({ _id: userId, role: 'Customer' }).select('_id');
    if (!user) return { error: 'user' };
    return { user };
};

const addItem = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productId, quantity = 1 } = req.body || {};
        const amount = Number(quantity);
        const customer = await getCustomerCart(userId);
        if (customer.error === 'invalid') return res.status(400).json({ message: 'ID tài khoản không hợp lệ.' });
        if (customer.error) return res.status(404).json({ message: 'Không tìm thấy tài khoản khách hàng.' });
        if (!mongoose.isValidObjectId(productId)) return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        if (!Number.isInteger(amount) || amount < 1 || amount > 99) {
            return res.status(400).json({ message: 'Số lượng phải từ 1 đến 99.' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        let cart = await Cart.findOne({ userId });
        if (!cart) cart = new Cart({ userId, items: [] });
        const item = cart.items.find(entry => entry.productId.toString() === productId);
        if (item) {
            if (item.quantity + amount > 99) {
                return res.status(400).json({ message: 'Số lượng tối đa của sản phẩm là 99.' });
            }
            item.quantity += amount;
        } else {
            cart.items.push({ productId, quantity: amount, unitPrice: Number(product.price || 0) });
        }
        await refreshCartPrices(cart);
        await cart.save();
        return res.status(200).json({ message: 'Đã thêm sản phẩm vào giỏ hàng.' });
    } catch (error) {
        console.error('Add customer cart item error:', error);
        return res.status(500).json({ message: 'Không thể thêm sản phẩm vào giỏ hàng.' });
    }
};

const updateItem = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const quantity = Number(req.body?.quantity);
        const customer = await getCustomerCart(userId);
        if (customer.error === 'invalid' || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID tài khoản hoặc sản phẩm không hợp lệ.' });
        }
        if (customer.error) return res.status(404).json({ message: 'Không tìm thấy tài khoản khách hàng.' });
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
            return res.status(400).json({ message: 'Số lượng phải từ 1 đến 99.' });
        }
        const cart = await Cart.findOne({ userId });
        const item = cart?.items.find(entry => entry.productId.toString() === productId);
        if (!item) return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng.' });
        item.quantity = quantity;
        await refreshCartPrices(cart);
        await cart.save();
        return res.status(200).json({ message: 'Đã cập nhật số lượng.' });
    } catch (error) {
        console.error('Update customer cart item error:', error);
        return res.status(500).json({ message: 'Không thể cập nhật giỏ hàng.' });
    }
};

const removeItem = async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const customer = await getCustomerCart(userId);
        if (customer.error === 'invalid' || !mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID tài khoản hoặc sản phẩm không hợp lệ.' });
        }
        if (customer.error) return res.status(404).json({ message: 'Không tìm thấy tài khoản khách hàng.' });
        const cart = await Cart.findOne({ userId });
        if (!cart || !cart.items.some(item => item.productId.toString() === productId)) {
            return res.status(404).json({ message: 'Sản phẩm không có trong giỏ hàng.' });
        }
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);
        await refreshCartPrices(cart);
        await cart.save();
        return res.status(200).json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng.' });
    } catch (error) {
        console.error('Remove customer cart item error:', error);
        return res.status(500).json({ message: 'Không thể xóa sản phẩm khỏi giỏ hàng.' });
    }
};

module.exports = { getCustomerCarts, getProducts, addItem, updateItem, removeItem };
