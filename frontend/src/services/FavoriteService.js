const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/favorites`;

const request = async (path = '', options = {}) => {
  const token = localStorage.getItem('novashop_token');
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token || ''}`,
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `Lỗi HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return result;
};

export const getFavorites = () => request();
export const checkFavorite = productId =>
  request(`/contains/${encodeURIComponent(productId)}`);
export const addFavorite = productId =>
  request(`/${encodeURIComponent(productId)}`, { method: 'PUT' });
export const removeFavorite = productId =>
  request(`/${encodeURIComponent(productId)}`, { method: 'DELETE' });
