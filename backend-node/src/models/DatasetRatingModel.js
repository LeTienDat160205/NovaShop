const mongoose = require('mongoose');

const datasetRatingSchema = new mongoose.Schema(
    {
        source: { type: String, required: true },
        customerId: { type: String, required: true },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'products',
            required: true
        },
        productItemId: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger }
    },
    { collection: 'datasetratings' }
);

datasetRatingSchema.index(
    { source: 1, customerId: 1, productItemId: 1 },
    { unique: true }
);
datasetRatingSchema.index({ productId: 1, source: 1 });

module.exports = mongoose.model('DatasetRating', datasetRatingSchema);
