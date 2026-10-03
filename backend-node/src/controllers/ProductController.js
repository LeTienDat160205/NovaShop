const Product = require('../models/ProductModel');

// 1. API Lấy tất cả sản phẩm
const getAllProduct = async (req, res) => {
    try {
        const products = await Product.find();
        return res.status(200).json({
            status: 'OK',
            message: 'Lấy danh sách sản phẩm thành công',
            data: products
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

// 2. API Lấy chi tiết 1 sản phẩm theo ID
const getDetailsProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: 'ERR',
                message: 'Không tìm thấy sản phẩm'
            });
        }
        return res.status(200).json({
            status: 'OK',
            data: product
        });
    } catch (e) {
        return res.status(500).json({
            status: 'ERR',
            message: e.message
        });
    }
};

module.exports = {
    getAllProduct,
    getDetailsProduct
};