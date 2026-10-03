const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, default: 'Customer', enum: ['Guest', 'Customer', 'Admin'] },
        phone: { type: String },
        address: { type: String },
        avatar: { type: String },
        city: { type: String }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);
module.exports = User;