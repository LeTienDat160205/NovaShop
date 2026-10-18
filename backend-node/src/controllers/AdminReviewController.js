const mongoose = require('mongoose');
const Review = require('../models/ReviewModel');

const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate('userId', 'name email')
            .populate('productId', 'name')
            .sort({ createdAt: -1 })
            .limit(500)
            .lean();

        return res.status(200).json({
            data: reviews.map(review => ({
                _id: review._id,
                userName: review.userId?.name || 'Tài khoản đã xóa',
                userEmail: review.userId?.email || '',
                productName: review.productId?.name || 'Sản phẩm đã xóa',
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }))
        });
    } catch (error) {
        console.error('Get admin reviews error:', error);
        return res.status(500).json({ message: 'Không thể tải danh sách đánh giá.' });
    }
};

const deleteReview = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ message: 'ID đánh giá không hợp lệ.' });
        }
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá.' });
        return res.status(200).json({ message: 'Đã xóa đánh giá.' });
    } catch (error) {
        console.error('Delete admin review error:', error);
        return res.status(500).json({ message: 'Không thể xóa đánh giá.' });
    }
};

module.exports = { getReviews, deleteReview };
