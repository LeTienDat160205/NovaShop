const mongoose = require('mongoose');

const User = require('../models/UserModel');


const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Lấy danh sách tài khoản thành công.',
            data: users
        });
    } catch (error) {
        console.error('Get users error:', error);

        return res.status(500).json({
            message: 'Không thể lấy danh sách tài khoản.'
        });
    }
};

const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID tài khoản không hợp lệ.'
            });
        }
        if (!['Admin', 'Customer'].includes(role)) {
            return res.status(400).json({
                message: 'Quyền không hợp lệ.'
            });
        }

        if (id.toLowerCase() === req.user.id.toLowerCase()) {
            return res.status(403).json({
                message: 'Không thể tự thay đổi quyền của mình.'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản.'
            });
        }

        return res.status(200).json({
            message: 'Cập nhật quyền thành công.',
            data: user
        });
    } catch (error) {
        console.error('Update role error:', error);
        return res.status(500).json({
            message: 'Không thể cập nhật quyền.'
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: 'ID tài khoản không hợp lệ.'
            });
        }

        if (id.toLowerCase() === req.user.id.toLowerCase()) {
            return res.status(403).json({
                message: 'Không thể tự xóa tài khoản của mình.'
            });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({
                message: 'Không tìm thấy tài khoản.'
            });
        }

        if (user.role === 'Admin') {
            return res.status(403).json({
                message: 'Không thể xóa tài khoản ADMIN.'
            });
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            message: 'Xóa tài khoản thành công.'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        return res.status(500).json({
            message: 'Không thể xóa tài khoản.'
        });
    }
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser
};