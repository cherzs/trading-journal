import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for session cookies
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

// Trade API
export const tradeAPI = {
  getTrades: async (params = {}) => {
    const response = await api.get('/trades', { params });
    return response.data;
  },

  createTrade: async (tradeData) => {
    const response = await api.post('/trades', tradeData);
    return response.data;
  },

  getTrade: async (tradeId) => {
    const response = await api.get(`/trades/${tradeId}`);
    return response.data;
  },

  updateTrade: async (tradeId, tradeData) => {
    const response = await api.put(`/trades/${tradeId}`, tradeData);
    return response.data;
  },

  deleteTrade: async (tradeId) => {
    const response = await api.delete(`/trades/${tradeId}`);
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/trades/analytics');
    return response.data;
  },
};

// User API
export const userAPI = {
  getPreferences: async () => {
    const response = await api.get('/users/preferences');
    return response.data;
  },

  updatePreferences: async (preferences) => {
    const response = await api.put('/users/preferences', preferences);
    return response.data;
  },
};

export default api; 