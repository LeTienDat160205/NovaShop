const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

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

		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.' });
		}
		if (!/^\S+@\S+\.\S+$/.test(email)) {
			return res.status(400).json({ message: 'Email không hợp lệ.' });
		}
		if (typeof password !== 'string' || password.length < 8) {
			return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' });
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

const updateProfile = async (req, res) => {
	try {
		const authHeader = req.headers.authorization || '';
		const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

		if (!token || !process.env.JWT_SECRET) {
			return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ.' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const userId = decoded.sub || decoded._id;
		const allowedFields = ['name', 'phone', 'address', 'gender', 'dob'];
		const updateData = {};

		for (const field of allowedFields) {
			if (req.body[field] !== undefined) {
				if (field === 'name') {
					updateData.name = String(req.body.name).trim();
				} else if (field === 'phone') {
					const phone = typeof req.body.phone === 'string' ? req.body.phone.trim() : '';
					if (phone && !/^(0\d{9}|\+84\d{9})$/.test(phone)) {
						return res.status(400).json({ message: 'Số điện thoại phải có 10 chữ số hợp lệ của Việt Nam.' });
					}
					updateData.phone = phone;
				} else if (field === 'address') {
					updateData.address = String(req.body.address).trim();
				} else if (field === 'gender') {
					updateData.gender = String(req.body.gender).trim();
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

		if (!updateData.name && !updateData.phone && !updateData.address && !updateData.gender && !updateData.dob) {
			return res.status(400).json({ message: 'Không có dữ liệu để cập nhật.' });
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
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Token không hợp lệ.' });
		}
		return res.status(500).json({ message: 'Không thể cập nhật tài khoản lúc này.' });
	}
};

module.exports = { register, login, updateProfile };
