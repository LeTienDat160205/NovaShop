const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');

const getDashboard = async (req, res) => {
    try {
        const [productCount, customerCount, totalOrders, statusCounts, recentOrders] = await Promise.all([
            Product.countDocuments(),
            User.countDocuments({ role: 'Customer' }),
            Order.countDocuments(),
            Order.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Order.find()
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(5)
                .lean()
        ]);

        const ordersByStatus = statusCounts.reduce((result, item) => {
            result[item._id] = item.count;
            return result;
        }, {});

        return res.status(200).json({
            data: {
                productCount,
                customerCount,
                totalOrders,
                ordersByStatus,
                recentOrders
            }
        });
    } catch (error) {
        console.error('Get admin dashboard error:', error);
        return res.status(500).json({ message: 'Không thể tải dữ liệu tổng quan.' });
    }
};

module.exports = { getDashboard };
