const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        type: { type: String, required: true } // Ví dụ: 'view', 'cart', 'buy', 'like'
    },
    {
        timestamps: true // Tự động tạo createdAt lưu thời điểm tương tác
    }
);

const Interaction = mongoose.model("Interaction", interactionSchema);
module.exports = Interaction;