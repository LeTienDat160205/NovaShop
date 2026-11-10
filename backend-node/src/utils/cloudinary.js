const crypto = require('crypto');

const uploadAvatar = async (dataUrl, userId) => {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) throw new Error('Cloudinary chưa được cấu hình.');
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'novashop/avatars';
    const signature = crypto.createHash('sha1').update(`folder=${folder}&public_id=user_${userId}&timestamp=${timestamp}${CLOUDINARY_API_SECRET}`).digest('hex');
    const body = new URLSearchParams({ file: dataUrl, api_key: CLOUDINARY_API_KEY, timestamp: String(timestamp), folder, public_id: `user_${userId}`, signature });
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: 'POST', body });
    const result = await response.json();
    if (!response.ok || !result.secure_url) throw new Error(result.error?.message || 'Cloudinary upload failed');
    return result.secure_url;
};

module.exports = { uploadAvatar };
