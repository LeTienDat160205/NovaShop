const crypto = require('crypto');

const getMomoConfig = () => {
    const config = {
        partnerCode: process.env.MOMO_PARTNER_CODE,
        accessKey: process.env.MOMO_ACCESS_KEY,
        secretKey: process.env.MOMO_SECRET_KEY,
        redirectUrl: process.env.MOMO_REDIRECT_URL,
        ipnUrl: process.env.MOMO_IPN_URL,
        endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create'
    };

    if (Object.values(config).some(value => !value)) {
        throw new Error('MoMo chưa được cấu hình đầy đủ.');
    }
    return config;
};

const sign = (value, secretKey) =>
    crypto.createHmac('sha256', secretKey).update(value).digest('hex');

const createMomoPayment = async (order) => {
    const config = getMomoConfig();
    const requestId = crypto.randomUUID();
    const orderId = order._id.toString();
    const amount = String(Math.round(order.totalPrice));
    const orderInfo = `Thanh toan don hang NovaShop ${orderId}`;
    const requestType = 'captureWallet';
    const extraData = '';
    const redirectUrl = new URL(config.redirectUrl);
    redirectUrl.searchParams.set('orderId', orderId);
    const rawSignature = [
        `accessKey=${config.accessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `ipnUrl=${config.ipnUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${config.partnerCode}`,
        `redirectUrl=${redirectUrl.toString()}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`
    ].join('&');

    const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            partnerCode: config.partnerCode,
            accessKey: config.accessKey,
            requestId,
            amount: Number(amount),
            orderId,
            orderInfo,
            redirectUrl: redirectUrl.toString(),
            ipnUrl: config.ipnUrl,
            extraData,
            requestType,
            signature: sign(rawSignature, config.secretKey),
            lang: 'vi'
        })
    });
    const result = await response.json();

    if (!response.ok || result.resultCode !== 0 || !result.payUrl) {
        throw new Error(result.message || 'MoMo không thể tạo yêu cầu thanh toán.');
    }
    return result.payUrl;
};

const verifyMomoIpn = (payload) => {
    const config = getMomoConfig();
    if (typeof payload?.signature !== 'string') return false;

    const fields = [
        'accessKey', 'amount', 'extraData', 'message', 'orderId', 'orderInfo',
        'orderType', 'partnerCode', 'payType', 'requestId', 'responseTime',
        'resultCode', 'transId'
    ];
    const rawSignature = fields
        .map(field => `${field}=${payload[field] ?? ''}`)
        .join('&');
    const expected = Buffer.from(sign(rawSignature, config.secretKey), 'hex');
    let received;

    try {
        received = Buffer.from(payload.signature, 'hex');
    } catch {
        return false;
    }

    return expected.length === received.length
        && crypto.timingSafeEqual(expected, received);
};

module.exports = { createMomoPayment, verifyMomoIpn, getMomoConfig };
