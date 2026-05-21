import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://psicologo-api-0h0p.onrender.com';

const axiosClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor — attach JWT
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor — handle 401/429
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default axiosClient;
