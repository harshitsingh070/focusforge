import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardAPI, extractApiErrorMessage } from '../services/api';
import { Badge, DashboardData, RecentActivity } from '../types';

interface DashboardState {
  data: DashboardData | null;
  dashboardData: DashboardData | null;
  recentActivities: RecentActivity[];
  nextBadges: Badge[];
  loading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

const initialState: DashboardState = {
  data: null,
  dashboardData: null,
  recentActivities: [],
  nextBadges: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
};

export const fetchDashboard = createAsyncThunk<DashboardData, void, { rejectValue: string }>(
  'dashboard/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardAPI.getDashboard();
      return response.data as DashboardData;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to load dashboard'));
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardError: (state) => {
      state.error = null;
    },
    updateDashboard: (state, action) => {
      if (!state.data) {
        return;
      }

      const patch = action.payload as Partial<DashboardData>;
      const merged = {
        ...state.data,
        ...patch,
      };

      state.data = merged;
      state.dashboardData = merged;
      state.recentActivities = merged.recentActivities || [];
      state.nextBadges = merged.recentBadges || [];
      state.lastFetchedAt = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.data = action.payload;
        state.dashboardData = action.payload;
        state.recentActivities = action.payload.recentActivities || [];
        state.nextBadges = action.payload.recentBadges || [];
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load dashboard';
      });
  },
});

export const { clearDashboardError, updateDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
