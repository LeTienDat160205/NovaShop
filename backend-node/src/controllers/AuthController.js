const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const { sendPasswordResetEmail } = require('../utils/emailService');

const publicUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	role: user.role,
	phone: user.phone || '',
	address: user.address || '',
	gender: user.gender || '',
	dob: user.dob ? (user.dob instanceof Date ? user.dob.toISOString() : user.dob) : null,
});

const createToken = (user) => jwt.sign(
	{ sub: user._id.toString(), role: user.role },
	process.env.JWT_SECRET,
	{ expiresIn: '1d' },
);

const register = async (req, res) => {
	try {
		const { name: rawName, email: rawEmail, password } = req.body || {};
		const name = typeof rawName === 'string' ? rawName.trim() : '';
		const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

		if (!name || !email || typeof password !== 'string' || !password) {
			return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' });
		}
		if (name.length > 100 || email.length > 254) {
			return res.status(400).json({ message: 'Họ tên hoặc email vượt quá độ dài cho phép.' });
		}
		if (!/^\S+@\S+\.\S+$/.test(email)) {
			return res.status(400).json({ message: 'Email không hợp lệ.' });
		}
		if (password.length < 8 || password.length > 128) {
			return res.status(400).json({ message: 'Mật khẩu phải từ 8 đến 128 ký tự.' });
		}

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(409).json({ message: 'Email này đã được đăng ký.' });
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await User.create({ name, email, password: hashedPassword, role: 'Customer' });

		return res.status(201).json({
			message: 'Tạo tài khoản thành công.',
			user: publicUser(user),
		});
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: 'Email này đã được đăng ký.' });
		}
		console.error('Register error:', error);
		return res.status(500).json({ message: 'Không thể tạo tài khoản lúc này.' });
	}
};

const login = async (req, res) => {
	try {
		const { email: rawEmail, password } = req.body || {};
		const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

		if (!email || typeof password !== 'string' || !password) {
			return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu.' });
		}
		if (!process.env.JWT_SECRET) {
			console.error('JWT_SECRET is not configured.');
			return res.status(500).json({ message: 'Máy chủ chưa được cấu hình đăng nhập.' });
		}

		const user = await User.findOne({ email });
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({ message: 'Email hoặc mật khẩu không chính xác.' });
		}

		return res.status(200).json({
			message: 'Đăng nhập thành công.',
			token: createToken(user),
			user: publicUser(user),
		});
	} catch (error) {
		console.error('Login error:', error);
		return res.status(500).json({ message: 'Không thể đăng nhập lúc này.' });
	}
};

const requestPasswordReset = async (req, res) => {
	try {
		const email = typeof req.body?.email === 'string'
			? req.body.email.trim().toLowerCase()
			: '';
		if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
			return res.status(400).json({ message: 'Email không hợp lệ.' });
		}

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(200).json({
				message: 'Nếu email thuộc một tài khoản, hướng dẫn đặt lại mật khẩu sẽ được gửi.'
			});
		}

		const token = crypto.randomBytes(32).toString('hex');
		const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
		user.resetPasswordTokenHash = tokenHash;
		user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
		await user.save();

		const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
		const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
		try {
			await sendPasswordResetEmail(email, resetUrl);
		} catch (error) {
			await User.updateOne(
				{ _id: user._id, resetPasswordTokenHash: tokenHash },
				{ $unset: { resetPasswordTokenHash: 1, resetPasswordExpires: 1 } }
			);
			console.error('Password reset email error:', error);
			return res.status(503).json({ message: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.' });
		}

		return res.status(200).json({
			message: 'Nếu email thuộc một tài khoản, hướng dẫn đặt lại mật khẩu sẽ được gửi.'
		});
	} catch (error) {
		console.error('Request password reset error:', error);
		return res.status(500).json({ message: 'Không thể xử lý yêu cầu lúc này.' });
	}
};

const resetPassword = async (req, res) => {
	try {
		const { token, password } = req.body || {};
		if (
			typeof token !== 'string'
			|| !/^[a-f\d]{64}$/i.test(token)
			|| typeof password !== 'string'
			|| password.length < 8
			|| password.length > 128
		) {
			return res.status(400).json({ message: 'Liên kết hoặc mật khẩu không hợp lệ.' });
		}

		const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
		const hashedPassword = await bcrypt.hash(password, 12);
		const user = await User.findOneAndUpdate(
			{
				resetPasswordTokenHash: tokenHash,
				resetPasswordExpires: { $gt: new Date() }
			},
			{
				$set: { password: hashedPassword },
				$unset: { resetPasswordTokenHash: 1, resetPasswordExpires: 1 }
			},
			{ new: true }
		);

		if (!user) {
			return res.status(400).json({ message: 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.' });
		}
		return res.status(200).json({ message: 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.' });
	} catch (error) {
		console.error('Reset password error:', error);
		return res.status(500).json({ message: 'Không thể đặt lại mật khẩu lúc này.' });
	}
};

const updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const allowedFields = ['name', 'phone', 'address', 'gender', 'dob'];
		const updateData = {};

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				if (field === 'name') {
					if (typeof req.body.name !== 'string') {
						return res.status(400).json({ message: 'Họ tên không hợp lệ.' });
					}
					updateData.name = req.body.name.trim();
				} else if (field === 'phone') {
					const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
					if (phone && !/^(0\d{9}|\+84\d{9})$/.test(phone)) {
						return res.status(400).json({ message: 'Số điện thoại phải có 10 chữ số hợp lệ của Việt Nam.' });
					}
					updateData.phone = phone;
				} else if (field === 'address') {
					if (typeof req.body.address !== 'string') {
						return res.status(400).json({ message: 'Địa chỉ không hợp lệ.' });
					}
					updateData.address = req.body.address.trim();
				} else if (field === 'gender') {
					if (typeof req.body.gender !== 'string') {
						return res.status(400).json({ message: 'Giới tính không hợp lệ.' });
					}
					updateData.gender = req.body.gender.trim();
				} else if (field === 'dob') {
					if (req.body.dob === null || req.body.dob === '') {
						updateData.dob = null;
					} else {
						const match = typeof req.body.dob === 'string'
							? /^(\d{4})-(\d{2})-(\d{2})$/.exec(req.body.dob)
							: null;
						if (!match) {
							return res.status(400).json({ message: 'Ngày sinh không hợp lệ.' });
						}

						const [, year, month, day] = match;
						const dob = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
						if (
							dob.getUTCFullYear() !== Number(year)
							|| dob.getUTCMonth() !== Number(month) - 1
							|| dob.getUTCDate() !== Number(day)
						) {
							return res.status(400).json({ message: 'Ngày sinh không tồn tại.' });
						}

						const today = new Date();
						today.setUTCHours(0, 0, 0, 0);
						if (dob > today) {
							return res.status(400).json({ message: 'Ngày sinh không được ở tương lai.' });
						}
						updateData.dob = dob;
					}
				}
			}
		}

		if (!Object.keys(updateData).length) {
			return res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
		}

		if (updateData.name !== undefined && (!updateData.name || updateData.name.length > 100)) {
			return res.status(400).json({ message: 'Họ tên không hợp lệ.' });
		}
		if (updateData.address !== undefined && updateData.address.length > 300) {
			return res.status(400).json({ message: 'Địa chỉ không được vượt quá 300 ký tự.' });
		}
		if (updateData.gender !== undefined && !['Nam', 'Nữ', 'Khác', ''].includes(updateData.gender)) {
			return res.status(400).json({ message: 'Giới tính không hợp lệ.' });
		}

		const user = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });
		if (!user) {
			return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
		}

		return res.status(200).json({
			message: 'Cập nhật thông tin thành công.',
			user: publicUser(user),
		});
	} catch (error) {
		console.error('Update profile error:', error);
		return res.status(500).json({ message: 'Không thể cập nhật tài khoản lúc này.' });
	}
};

module.exports = { register, login, requestPasswordReset, resetPassword, updateProfile };
