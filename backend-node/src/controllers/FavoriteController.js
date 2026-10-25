const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');

const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'favorites',
                select: 'name brand price listPrice rating images'
            })
            .lean();
        if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });
        return res.status(200).json({ data: user.favorites || [] });
    } catch (error) {
        console.error('Get favorites error:', error);
        return res.status(500).json({ message: 'Không thể tải danh sách yêu thích.' });
    }
};

const checkFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }
        const user = await User.exists({
            _id: req.user.id,
            favorites: productId
        });
        return res.status(200).json({ isFavorite: Boolean(user) });
    } catch (error) {
        console.error('Check favorite error:', error);
        return res.status(500).json({ message: 'Không thể kiểm tra sản phẩm yêu thích.' });
    }
};

const addFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }
        const product = await Product.exists({ _id: productId });
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });

        await User.findByIdAndUpdate(req.user.id, { $addToSet: { favorites: productId } });
        return res.status(200).json({ message: 'Đã thêm vào danh sách yêu thích.' });
    } catch (error) {
        console.error('Add favorite error:', error);
        return res.status(500).json({ message: 'Không thể lưu sản phẩm yêu thích.' });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }
        await User.findByIdAndUpdate(req.user.id, { $pull: { favorites: productId } });
        return res.status(200).json({ message: 'Đã xóa khỏi danh sách yêu thích.' });
    } catch (error) {
        console.error('Remove favorite error:', error);
        return res.status(500).json({ message: 'Không thể xóa sản phẩm yêu thích.' });
    }
};

module.exports = { getFavorites, checkFavorite, addFavorite, removeFavorite };
