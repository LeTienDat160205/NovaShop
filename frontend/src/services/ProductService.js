import axios from 'axios';

const API_URL = 'http://localhost:3001/api/product';

export const getAllProduct = async () => {
    const res = await axios.get(`${API_URL}/get-all`);
    return res.data;
};