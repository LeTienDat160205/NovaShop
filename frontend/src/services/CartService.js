import axios from 'axios';

const API_URL = 'http://localhost:3001/api/cart';

const getConfig = () => {
    const token = localStorage.getItem('novashop_token');
    if (!token) throw new Error('Vui lòng đăng nhập để sử dụng giỏ hàng.');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getCart = async () => {
    const res = await axios.get(API_URL, getConfig());
    return res.data;
};

export const addToCart = async (productId, quantity = 1) => {
    const res = await axios.post(`${API_URL}/items`, { productId, quantity }, getConfig());
    return res.data;
};

export const updateCartQuantity = async (productId, quantity) => {
    const res = await axios.patch(`${API_URL}/items/${productId}`, { quantity }, getConfig());
    return res.data;
};

export const removeCartItem = async (productId) => {
    const res = await axios.delete(`${API_URL}/items/${productId}`, getConfig());
    return res.data;
};

export const clearCart = async () => {
    const res = await axios.delete(API_URL, getConfig());
    return res.data;
};