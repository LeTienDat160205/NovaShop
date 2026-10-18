const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
        rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger },
        comment: { type: String, trim: true, maxlength: 2000, default: '' }
    },
    {
        timestamps: true
    }
);

reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
reviewSchema.index({ productId: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;