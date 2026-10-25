const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
const Interaction = require('../models/InteractionModel');
const recordInteraction = require('../utils/recordInteraction');

const recordProductView = async (req, res) => {
    try {
        const { productId, type } = req.body || {};
        if (type !== 'view') {
            return res.status(400).json({ message: 'Loại tương tác không hợp lệ.' });
        }
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }
        const productExists = await Product.exists({ _id: productId });
        if (!productExists) {
            return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
        }

        const recentView = await Interaction.exists({
            userId: req.user.id,
            productId,
            type: 'view',
            createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }
        });
        if (!recentView) {
            await recordInteraction(req.user.id, productId, 'view');
        }
        return res.status(200).json({ status: 'OK' });
    } catch (error) {
        console.error('Record product view error:', error);
        return res.status(500).json({ message: 'Không thể ghi nhận lượt xem sản phẩm.' });
    }
};

module.exports = { recordProductView };
