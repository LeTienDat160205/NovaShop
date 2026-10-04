import axios from 'axios';

const API_URL = 'http://localhost:3001/api/product';

export const getAllProduct = async () => {
    const res = await axios.get(`${API_URL}/get-all`);
    return res.data;
};

export const getDetailsProduct = async (id) => {
  const res = await axios.get(`${API_URL}/get-details/${id}`);
  return res.data;
};