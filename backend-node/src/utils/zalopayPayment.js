const crypto = require('crypto');

const getConfig = () => {
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const config = { appId: process.env.ZALOPAY_APP_ID, key1: process.env.ZALOPAY_KEY1, key2: process.env.ZALOPAY_KEY2, endpoint: process.env.ZALOPAY_ENDPOINT || 'https://sb-openapi.zalopay.vn/v2/create', redirectUrl: process.env.ZALOPAY_REDIRECT_URL || `${frontendUrl}/payment-result`, callbackUrl: process.env.ZALOPAY_CALLBACK_URL || `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/orders/zalopay/callback` };
    if (Object.values(config).some(value => !value)) throw new Error('ZaloPay chưa được cấu hình đầy đủ.');
    return config;
};
const mac = (value, key) => crypto.createHmac('sha256', key).update(value).digest('hex');
const createZaloPayPayment = async order => {
    const c = getConfig();
    const vietnamDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: '2-digit', month: '2-digit', day: '2-digit' }).format(new Date()).replace(/-/g, '');
    const appTransId = `${vietnamDate}_${order._id}`;
    const embedData = JSON.stringify({ redirecturl: `${c.redirectUrl}?orderId=${order._id}` });
    const items = JSON.stringify(order.items.map(item => ({ itemid: item.productId.toString(), itemname: 'NovaShop product', itemprice: item.price, itemquantity: item.quantity })));
    const params = { app_id: Number(c.appId), app_user: order.userId.toString(), app_trans_id: appTransId, app_time: Date.now(), expire_duration_seconds: 900, item: items, embed_data: embedData, amount: Math.round(order.totalPrice), description: `NovaShop thanh toan ${order._id}`, bank_code: '', callback_url: c.callbackUrl };
    params.mac = mac(`${params.app_id}|${params.app_trans_id}|${params.app_user}|${params.amount}|${params.app_time}|${params.embed_data}|${params.item}`, c.key1);
    const response = await fetch(c.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(params) });
    const result = await response.json();
    if (!response.ok || result.return_code !== 1 || !result.order_url) throw new Error(`ZaloPay ${result.return_code ?? response.status} (sub ${result.sub_return_code ?? 'n/a'}): ${result.return_message || 'Giao dịch thất bại'}${result.sub_return_message ? ` - ${result.sub_return_message}` : ''}`);
    return { payUrl: result.order_url, transactionId: appTransId };
};
const verifyCallback = (payload, key2) => typeof payload?.mac === 'string' && mac(payload.data, key2) === payload.mac;
module.exports = { getConfig, createZaloPayPayment, verifyCallback };
