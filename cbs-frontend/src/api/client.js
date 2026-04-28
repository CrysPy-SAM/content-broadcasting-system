import axios from 'axios';

// In dev, Vite proxies /auth, /content, /approval to localhost:3000.
// In prod, set VITE_API_URL to your backend's origin.
const baseURL = import.meta.env.VITE_API_URL || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cbs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && localStorage.getItem('cbs_token')) {
      localStorage.removeItem('cbs_token');
      localStorage.removeItem('cbs_user');
      // Hard reload to /login so route guards re-evaluate
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/live')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// Helper to extract a clean error message from API errors
export const errMsg = (err, fallback = 'Something went wrong') =>
  err?.response?.data?.message || err?.message || fallback;

// Resolve an upload's relative URL (`/uploads/foo.jpg`) to an absolute URL when needed
export const resolveAsset = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return baseURL ? `${baseURL}${url}` : url;
};
