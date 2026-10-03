const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        brand: { type: String },
        categoryPath: { type: Array, default: [] },
        specifications: { type: Object, default: {} }, 
        description: { type: String },
        price: { type: Number, required: true },
        listPrice: { type: Number },
        rating: { type: Number, default: 0 },
        images: { type: Array, default: [] },
        sourceUrl: { type: String }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("products", productSchema);
module.exports = Product;