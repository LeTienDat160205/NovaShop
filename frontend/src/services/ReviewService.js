const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.message || `Lỗi HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return result;
};

export const getProductReviews = productId =>
  request(`/product/reviews/${productId}`);

export const saveProductReview = (productId, payload, authToken) =>
  request(`/product/reviews/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(payload),
  });
