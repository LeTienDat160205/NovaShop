import axios from 'axios';
import { getAuthSession } from '../utils/authSession';

const API_URL = 'http://localhost:3001/api/product';

export const recordProductView = async (productId) => {
  const { token } = getAuthSession();
  if (!token) return;

  await axios.post(
    `${API_URL}/interactions`,
    { productId, type: 'view' },
    { headers: { Authorization: `Bearer ${token}` } },
  );
};
