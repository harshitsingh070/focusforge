import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { analyticsAPI, extractApiErrorMessage } from '../services/api';
import {
  AnalyticsCategoryStat,
  AnalyticsData,
  AnalyticsHeatmapPoint,
  AnalyticsWeeklyStat,
} from '../types';

interface AnalyticsState {
  data: AnalyticsData | null;
  dailyStats: AnalyticsHeatmapPoint[];
  weeklyStats: AnalyticsWeeklyStat[];
  categoryStats: AnalyticsCategoryStat[];
  loading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  data: null,
  dailyStats: [],
  weeklyStats: [],
  categoryStats: [],
  loading: false,
  error: null,
};

export const fetchAnalytics = createAsyncThunk<AnalyticsData, void, { rejectValue: string }>(
  'analytics/fetchAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getMyStats();
      return response.data as AnalyticsData;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch analytics'));
    }
  }
);

export const fetchCategoryStats = createAsyncThunk<AnalyticsCategoryStat[], void, { rejectValue: string }>(
  'analytics/fetchCategoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await analyticsAPI.getMyStats();
      const categoryStats = Array.isArray(response.data?.categoryBreakdown) ? response.data.categoryBreakdown : [];
      return categoryStats as AnalyticsCategoryStat[];
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch category stats'));
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.weeklyStats = action.payload.weeklyProgress || [];
        state.dailyStats = action.payload.weeklyHeatmap || [];
        state.categoryStats = action.payload.categoryBreakdown || [];
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.data = null;
        state.weeklyStats = [];
        state.dailyStats = [];
        state.categoryStats = [];
        state.error = action.payload || 'Failed to fetch analytics';
      })
      .addCase(fetchCategoryStats.fulfilled, (state, action) => {
        state.categoryStats = action.payload;
      })
      .addCase(fetchCategoryStats.rejected, (state, action) => {
        state.error = action.payload || state.error;
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
