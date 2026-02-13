import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = 'http://localhost:8080/api';

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  signup: (username: string, email: string, password: string) =>
    api.post('/auth/signup', { username, email, password }),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard', { params: { _ts: Date.now() } }),
};

export const goalsAPI = {
  getGoals: () => api.get('/goals', { params: { _ts: Date.now() } }),
  createGoal: (data: any) => api.post('/goals', data),
  updateGoal: (id: number, data: any) => api.put(`/goals/${id}`, data),
  deleteGoal: (id: number) => api.delete(`/goals/${id}`),
};

export const activityAPI = {
  logActivity: (data: any) => api.post('/activities/log', data),
};

export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/my', { params: { _ts: Date.now() } }),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview', { params: { _ts: Date.now() } }),
};

export default api;
