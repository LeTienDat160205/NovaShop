const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
        type: {
            type: String,
            enum: ['view', 'favorite', 'cart', 'purchase'],
            required: true
        }
    },
    {
        timestamps: true
    }
);

interactionSchema.index({ userId:  1, createdAt: -1 });
interactionSchema.index({ productId: 1, createdAt: -1 });

const Interaction = mongoose.model("Interaction", interactionSchema);
module.exports = Interaction;