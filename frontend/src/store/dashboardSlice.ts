import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dashboardAPI } from '../services/api';
import { DashboardData } from '../types';

interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
}

const initialState: DashboardState = {
  data: null,
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
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load dashboard');
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
        state.lastFetchedAt = new Date().toISOString();
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load dashboard';
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
