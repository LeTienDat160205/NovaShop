import axios from 'axios';

const API_URL = 'http://localhost:3001/api/product';

export const getAllProduct = async (page = 1, limit = 18) => {
    const res = await axios.get(`${API_URL}/get-all`, {
        params: { page, limit }
    });

    return res.data;
};

export const getDetailsProduct = async (id) => {
  const res = await axios.get(`${API_URL}/get-details/${id}`);
  return res.data;
};

export const getSimilarProducts = async (id) => {
    const res = await axios.get(`${API_URL}/get-similar/${id}`);
    return res.data;
};

export const getProductByCategory = async (category) => {
  const res = await axios.get(`${API_URL}/get-by-category`, {
    params: { category } // axios sẽ tự động mã hóa chuỗi tiếng Việt chuẩn UTF-8
  });
  return res.data;
};