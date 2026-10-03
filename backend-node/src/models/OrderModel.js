const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                quantity: { type: Number, required: true },
                price: { type: Number, required: true }
            }
        ],
        totalPrice: { type: Number, required: true },
        shippingAddress: { type: String, required: true },
        paymentMethod: { type: String, required: true }, // 'COD', 'MOMO', 'VNPAY', ...
        status: { type: String, default: 'Pending' } // 'Pending', 'Processing', 'Delivered', 'Cancelled'
    },
    {
        timestamps: true
    }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;