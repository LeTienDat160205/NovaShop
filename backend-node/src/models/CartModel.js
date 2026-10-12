
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        max: 99
    },
    unitPrice: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: {
        type: [cartItemSchema],
        default: []
    },
    total: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
}, { timestamps: true });

// Tính lại giá từng món và tổng giá giỏ hàng trước khi lưu.
cartSchema.pre('save', function () {
    this.items.forEach(item => {
        item.totalPrice = Number(item.unitPrice || 0) * Number(item.quantity || 0);
    });

    this.total = this.items.reduce(
        (sum, item) => sum + Number(item.totalPrice || 0), 0
    );
});

module.exports = mongoose.model('Cart', cartSchema);
