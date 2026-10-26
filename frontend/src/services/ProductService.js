import axios from 'axios';
import { getAuthSession } from '../utils/authSession';

const API_URL = 'http://localhost:3001/api/product';

export const getAllProduct = async (page = 1, limit = 18) => {
    const res = await axios.get(`${API_URL}/get-all`, {
        params: { page, limit }
    });

    return res.data;
};

export const getTopDeals = async (limit = 6, excludeProductId, page = 1) => {
  const res = await axios.get(`${API_URL}/top-deals`, {
    params: {
      limit,
      page,
      ...(excludeProductId ? { excludeProductId } : {}),
    },
  });
  return res.data;
};

export const getDetailsProduct = async (id) => {
  const res = await axios.get(`${API_URL}/get-details/${id}`);
  return res.data;
};

export const getRecommendations = async (
  limit = 12,
  excludeProductId,
  excludeProductIds = [],
  page = 1,
) => {
  const { token } = getAuthSession();
  const endpoint = token ? '/recommendations' : '/recommendations/default';
  const res = await axios.get(`${API_URL}${endpoint}`, {
    params: {
      limit,
      page,
      ...(excludeProductId ? { excludeProductId } : {}),
      ...(excludeProductIds.length
        ? { excludeProductIds: excludeProductIds.join(',') }
        : {}),
    },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
};

export const getDefaultRecommendations = async (limit = 12, excludeProductId) => {
  const res = await axios.get(`${API_URL}/recommendations/default`, {
    params: {
      limit,
      ...(excludeProductId ? { excludeProductId } : {}),
    },
  });
  return res.data;
};

export const getSimilarProducts = async (id) => {
    const res = await axios.get(`${API_URL}/get-similar/${id}`);
    return res.data;
};

export const getProductByCategory = async (category, search = "") => {
  const res = await axios.get(`${API_URL}/get-by-category`, {
    params: { category, search }
  });
  return res.data;
};