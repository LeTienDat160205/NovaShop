const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: 'Customer', enum: ['Guest', 'Customer', 'Admin'] },
        phone: { type: String },
        address: { type: String },
        favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }],
        gender: { type: String, enum: ['Nam', 'Nữ', 'Khác', ''], default: '' },
        dob: { type: Date },
        avatar: { type: String },
        resetPasswordTokenHash: { type: String, select: false },
        resetPasswordExpires: { type: Date, select: false }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;