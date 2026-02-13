import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

interface AnalyticsData {
  weeklyProgress: Array<{ date: string; points: number; minutes: number }>;
  categoryBreakdown: Array<{ category: string; points: number; minutes: number; percentage: number }>;
  streakHistory: Array<{ date: string; streak: number }>;
  weeklyHeatmap: Array<{ date: string; label: string; minutes: number; points: number; level: number }>;
  trustMetrics: {
    score: number;
    band: string;
    signalsLast30Days: number;
    signalBreakdown: Record<string, number>;
  };
  insights: string[];
  consistencyMetrics: {
    totalDays: number;
    activeDays: number;
    consistencyRate: number;
    longestStreak: number;
    currentStreak: number;
  };
  monthlyTrends: Array<{ month: string; points: number; goals: number; minutes: number; activeDays: number }>;
}

interface AnalyticsState {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  loading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk('analytics/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/analytics/my-stats');
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch analytics');
  }
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.error = action.payload as string;
      });
  },
});

export default analyticsSlice.reducer;
