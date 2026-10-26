const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }
            }
        ],
        totalPrice: { type: Number, required: true },
        shippingName: { type: String, required: true },
        shippingPhone: { type: String, required: true },
        shippingAddress: { type: String, required: true },
        paymentMethod: { type: String, required: true },
        paymentStatus: {
            type: String,
            enum: ['NotRequired', 'Pending', 'Paid', 'Failed'],
            default: 'NotRequired'
        },
        paymentTransactionId: { type: String, default: '' },
        status: {
            type: String,
            default: 'Pending',
            enum: ['Pending', 'Processing', 'Delivered', 'Cancelled']
        }
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;