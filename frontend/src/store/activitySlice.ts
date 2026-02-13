import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { activityAPI, extractApiErrorMessage } from '../services/api';
import { ActivityFilters, ActivityLog, ActivityRequest } from '../types';

interface ActivityState {
  activities: ActivityLog[];
  entries: ActivityLog[];
  filters: ActivityFilters;
  lastLogged: ActivityLog | null;
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [],
  entries: [],
  filters: {},
  lastLogged: null,
  loading: false,
  error: null,
};

export const fetchActivities = createAsyncThunk<ActivityLog[], ActivityFilters | void, { rejectValue: string }>(
  'activity/fetchActivities',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await activityAPI.getActivities(filters || {});
      return (Array.isArray(response.data) ? response.data : []) as ActivityLog[];
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch activities'));
    }
  }
);

export const logActivity = createAsyncThunk<ActivityLog, ActivityRequest, { rejectValue: string }>(
  'activity/logActivity',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await activityAPI.logActivity(payload);
      return response.data as ActivityLog;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to log activity'));
    }
  }
);

export const updateActivity = createAsyncThunk<
  ActivityLog,
  { id: number; payload: Partial<ActivityRequest> },
  { rejectValue: string }
>('activity/updateActivity', async ({ id, payload }, { rejectWithValue }) => {
  try {
    const response = await activityAPI.updateActivity(id, payload);
    return response.data as ActivityLog;
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to update activity'));
  }
});

export const deleteActivity = createAsyncThunk<number, number, { rejectValue: string }>(
  'activity/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      await activityAPI.deleteActivity(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to delete activity'));
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearActivityError: (state) => {
      state.error = null;
    },
    setActivityFilters: (state, action) => {
      state.filters = { ...state.filters, ...(action.payload as ActivityFilters) };
    },
    resetActivityFilters: (state) => {
      state.filters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.activities = action.payload;
        state.entries = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch activities';
      })
      .addCase(logActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.lastLogged = action.payload;
        state.activities.unshift(action.payload);
        state.entries.unshift(action.payload);
      })
      .addCase(logActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to log activity';
      })
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.activities = state.activities.map((entry) =>
          entry.id === action.payload.id ? action.payload : entry
        );
        state.entries = state.entries.map((entry) => (entry.id === action.payload.id ? action.payload : entry));
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update activity';
      })
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.activities = state.activities.filter((entry) => entry.id !== action.payload);
        state.entries = state.entries.filter((entry) => entry.id !== action.payload);
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete activity';
      });
  },
});

export const { clearActivityError, setActivityFilters, resetActivityFilters } = activitySlice.actions;
export default activitySlice.reducer;
