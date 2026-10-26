const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/products`;

const getToken = () => localStorage.getItem('novashop_token') || '';

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`,
});


async function handleResponse(res) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(json.message || `Lỗi HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return json;
}


export async function getAdminProducts({ page = 1, limit = 10, search = '' } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const res = await fetch(`${BASE_URL}?${params}`, { headers: authHeaders() });
  return handleResponse(res);
}


export async function getAdminCategories() {
  const res = await fetch(`${BASE_URL}/categories`, { headers: authHeaders() });
  return handleResponse(res);
}


export async function getAdminProduct(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { headers: authHeaders() });
  return handleResponse(res);
}


export async function createAdminProduct(data) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}


export async function updateAdminProduct(id, data) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}


export async function deleteAdminProduct(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}
