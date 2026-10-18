import { clearAuthSession } from '../utils/authSession';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const request = async (path, options = {}) => {
  const token = localStorage.getItem('novashop_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token || ''}`,
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearAuthSession();
    const error = new Error(result.message || `Lỗi HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return result;
};

const jsonOptions = (method, body) => ({
  method,
  body: JSON.stringify(body),
});

export const getAdminDashboard = () => request('/admin/dashboard');
export const getAdminOrders = () => request('/admin/orders');
export const updateAdminOrderStatus = (id, status) =>
  request(`/admin/orders/${id}/status`, jsonOptions('PATCH', { status }));
export const getCustomerCarts = (search = '') =>
  request(`/admin/carts?search=${encodeURIComponent(search)}`);
export const getAdminCartProducts = (search = '') =>
  request(`/admin/carts/products?search=${encodeURIComponent(search)}`);
export const addAdminCartItem = (userId, productId, quantity) =>
  request(`/admin/carts/${userId}/items`, jsonOptions('POST', { productId, quantity }));
export const updateAdminCartItem = (userId, productId, quantity) =>
  request(`/admin/carts/${userId}/items/${productId}`, jsonOptions('PATCH', { quantity }));
export const removeAdminCartItem = (userId, productId) =>
  request(`/admin/carts/${userId}/items/${productId}`, { method: 'DELETE' });

export const createOrder = (payload) =>
  request('/orders', jsonOptions('POST', payload));
export const getMyOrders = () => request('/orders/mine');
export const getAdminReviews = () => request('/admin/reviews');
export const deleteAdminReview = (id) =>
  request(`/admin/reviews/${id}`, { method: 'DELETE' });
