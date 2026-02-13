import axios, { AxiosError, AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL?.trim() || 'http://localhost:8080/api';
const AUTH_ROUTES = new Set(['/login', '/register', '/forgot-password']);

type QueryValue = string | number | boolean | undefined | null;

const withTimestamp = (params: Record<string, QueryValue> = {}) => ({
  ...params,
  _ts: Date.now(),
});

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  },
});

const clearAuthState = () => {
  localStorage.removeItem('token');
};

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
      clearAuthState();
      const path = window.location.pathname;
      if (!AUTH_ROUTES.has(path)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const extractApiErrorMessage = (error: unknown, fallback = 'Request failed'): string => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data && typeof error.response.data === 'object'
      ? (error.response.data as { message?: unknown }).message
      : undefined;
    if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) {
      return responseMessage;
    }
    if (typeof error.message === 'string' && error.message.trim().length > 0) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return fallback;
};

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  signup: (username: string, email: string, password: string) =>
    api.post('/auth/signup', { username, email, password }),
  forgotPassword: async (_email: string) =>
    Promise.reject(new Error('Password reset endpoint is not available in backend yet.')),
};

export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard', { params: withTimestamp() }),
};

export const goalsAPI = {
  getGoals: () => api.get('/goals', { params: withTimestamp() }),
  getGoalById: (id: number) => api.get(`/goals/${id}`, { params: withTimestamp() }),
  createGoal: (data: unknown) => api.post('/goals', data),
  updateGoal: (id: number, data: unknown) => api.put(`/goals/${id}`, data),
  deleteGoal: (id: number) => api.delete(`/goals/${id}`),
};

const mapRecentActivitiesToActivityLogs = (
  entries: Array<{
    id: number;
    goalTitle: string;
    minutes: number;
    date: string;
    points?: number;
  }>
) =>
  entries.map((item) => ({
    id: item.id,
    goalId: 0,
    goalTitle: item.goalTitle,
    logDate: item.date,
    minutesSpent: item.minutes,
    pointsEarned: item.points ?? 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPoints: item.points ?? 0,
    suspicious: false,
    message: 'Derived from dashboard recent activity',
  }));

export const activityAPI = {
  logActivity: (data: unknown) => api.post('/activities/log', data),
  getActivities: async (filters?: { goalId?: number; from?: string; to?: string }) => {
    const response = await dashboardAPI.getDashboard();
    const recentActivities = Array.isArray(response.data?.recentActivities) ? response.data.recentActivities : [];
    let transformed = mapRecentActivitiesToActivityLogs(recentActivities);

    if (filters?.goalId) {
      transformed = transformed.filter((entry) => entry.goalId === filters.goalId);
    }
    if (filters?.from) {
      transformed = transformed.filter((entry) => entry.logDate >= filters.from!);
    }
    if (filters?.to) {
      transformed = transformed.filter((entry) => entry.logDate <= filters.to!);
    }

    return { data: transformed };
  },
  updateActivity: async (_id: number, _payload: unknown): Promise<{ data: unknown }> =>
    Promise.reject(new Error('Backend does not expose update activity endpoint.')),
  deleteActivity: async (_id: number): Promise<unknown> =>
    Promise.reject(new Error('Backend does not expose delete activity endpoint.')),
};

export const leaderboardAPI = {
  getOverall: (limit = 20) => api.get('/leaderboard/overall', { params: withTimestamp({ limit }) }),
  getCategory: (category: string, limit = 20) =>
    api.get(`/leaderboard/category/${encodeURIComponent(category)}`, { params: withTimestamp({ limit }) }),
  getMyRank: () => api.get('/leaderboard/my-rank', { params: withTimestamp() }),
};

export const enhancedLeaderboardAPI = {
  getLeaderboard: (category?: string, period?: string) =>
    api.get('/leaderboard/v2', {
      params: withTimestamp({
        ...(category ? { category } : {}),
        ...(period ? { period } : {}),
      }),
    }),
  getMyContext: (category?: string, period?: string) =>
    api.get('/leaderboard/v2/my-context', {
      params: withTimestamp({
        ...(category ? { category } : {}),
        ...(period ? { period } : {}),
      }),
    }),
};

export const badgesAPI = {
  getAvailable: () => api.get('/badges/available', { params: withTimestamp() }),
  getEarned: () => api.get('/badges/my-badges', { params: withTimestamp() }),
  getAllWithProgress: () => api.get('/badges/all', { params: withTimestamp() }),
};

export const analyticsAPI = {
  getMyStats: () => api.get('/analytics/my-stats', { params: withTimestamp() }),
};

export const settingsAPI = {
  getPrivacySettings: () => api.get('/settings/privacy', { params: withTimestamp() }),
  updatePrivacySettings: (data: unknown) => api.put('/settings/privacy', data),
};

export const notificationAPI = {
  getMyNotifications: () => api.get('/notifications/my', { params: withTimestamp() }),
  markAsRead: (id: number) => api.put(`/notifications/${id}/read`),
};

export const adminAPI = {
  getOverview: () => api.get('/admin/overview', { params: withTimestamp() }),
};

export default api;
