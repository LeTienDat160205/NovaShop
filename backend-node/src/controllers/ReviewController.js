const mongoose = require('mongoose');
const Product = require('../models/ProductModel');
const Review = require('../models/ReviewModel');
const calculateCombinedRating = require('../utils/calculateCombinedRating');

const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }

        const product = await Product.findById(productId).select('rating').lean();
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });

        const [reviews, summary] = await Promise.all([
            Review.find({ productId })
                .populate('userId', 'name')
                .sort({ createdAt: -1 })
                .lean(),
            Review.aggregate([
                { $match: { productId: new mongoose.Types.ObjectId(productId) } },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        ratingSum: { $sum: '$rating' },
                        ratings: { $push: '$rating' }
                    }
                }
            ])
        ]);

        const ratingCounts = [1, 2, 3, 4, 5].reduce((counts, rating) => {
            counts[rating] = 0;
            return counts;
        }, {});
        for (const rating of summary[0]?.ratings || []) ratingCounts[rating] += 1;

        return res.status(200).json({
            data: {
                reviews: reviews.map(review => ({
                    id: review._id,
                    name: review.userId?.name || 'Khách hàng',
                    rating: review.rating,
                    content: review.comment,
                    date: review.createdAt
                })),
                summary: {
                    count: summary[0]?.count || 0,
                    average: calculateCombinedRating(
                        product.rating,
                        summary[0]?.count,
                        summary[0]?.ratingSum
                    ),
                    ratingCounts
                }
            }
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        return res.status(500).json({ message: 'Không thể tải đánh giá sản phẩm.' });
    }
};

const createOrUpdateReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body || {};
        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: 'ID sản phẩm không hợp lệ.' });
        }
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Vui lòng chọn số sao từ 1 đến 5.' });
        }
        if (comment !== undefined && comment !== null && typeof comment !== 'string') {
            return res.status(400).json({ message: 'Nội dung đánh giá không hợp lệ.' });
        }
        if (typeof comment === 'string' && comment.trim().length > 2000) {
            return res.status(400).json({ message: 'Nội dung đánh giá không được vượt quá 2000 ký tự.' });
        }
        const product = await Product.exists({ _id: productId });
        if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });

        const review = await Review.findOneAndUpdate(
            { userId: req.user.id, productId },
            {
                $set: { rating, comment: typeof comment === 'string' ? comment.trim() : '' },
                $setOnInsert: { userId: req.user.id, productId }
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );

        return res.status(200).json({
            message: 'Đã lưu đánh giá sản phẩm.',
            data: { id: review._id, rating: review.rating, comment: review.comment }
        });
    } catch (error) {
        console.error('Save product review error:', error);
        return res.status(500).json({ message: 'Không thể lưu đánh giá sản phẩm.' });
    }
};

module.exports = { getProductReviews, createOrUpdateReview };
