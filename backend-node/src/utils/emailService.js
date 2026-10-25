const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, resetUrl) => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_FROM) {
        throw new Error('SMTP chưa được cấu hình đầy đủ.');
    }

    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        ...(SMTP_USER && SMTP_PASS ? { auth: { user: SMTP_USER, pass: SMTP_PASS } } : {})
    });

    await transporter.sendMail({
        from: SMTP_FROM,
        to: email,
        subject: 'Đặt lại mật khẩu NovaShop',
        text: `Để đặt lại mật khẩu NovaShop, hãy mở liên kết sau trong vòng 15 phút: ${resetUrl}`,
        html: `<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu tài khoản NovaShop.</p><p><a href="${resetUrl}">Đặt lại mật khẩu</a></p><p>Liên kết hết hạn sau 15 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`
    });
};

module.exports = { sendPasswordResetEmail };
