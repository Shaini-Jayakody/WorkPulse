const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const request = async (method, path, body) => {
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const token = localStorage.getItem('token');

  const headers = isFormData
    ? {}
    : {
        'Content-Type': 'application/json',
      };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body == null ? undefined : isFormData ? body : JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = Array.isArray(data.errors) && data.errors.length > 0
      ? data.errors.map((item) => item.message).join(' ')
      : null;
    const error = new Error(validationMessage || data.message || 'Request failed');
    error.response = { data, status: response.status };
    throw error;
  }

  return { data };
};

const api = {
  post: (path, body) => request('POST', path, body),
  get: (path) => request('GET', path),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export default api;