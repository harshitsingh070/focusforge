import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { badgesAPI, extractApiErrorMessage } from '../services/api';
import { Badge } from '../types';

interface BadgeProgressSummary {
  earnedCount: number;
  totalCount: number;
  completionRate: number;
}

interface BadgesState {
  badges: Badge[];
  earnedBadges: Badge[];
  progress: BadgeProgressSummary;
  loading: boolean;
  error: string | null;
}

const initialState: BadgesState = {
  badges: [],
  earnedBadges: [],
  progress: {
    earnedCount: 0,
    totalCount: 0,
    completionRate: 0,
  },
  loading: false,
  error: null,
};

const buildProgress = (badges: Badge[], earnedBadges: Badge[]): BadgeProgressSummary => {
  const totalCount = badges.length;
  const earnedCount = earnedBadges.length;
  const completionRate = totalCount > 0 ? Math.round((earnedCount * 100) / totalCount) : 0;

  return { earnedCount, totalCount, completionRate };
};

export const fetchBadges = createAsyncThunk<Badge[], void, { rejectValue: string }>(
  'badges/fetchBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await badgesAPI.getAvailable();
      return (Array.isArray(response.data?.badges) ? response.data.badges : []) as Badge[];
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch badges'));
    }
  }
);

export const fetchEarnedBadges = createAsyncThunk<Badge[], void, { rejectValue: string }>(
  'badges/fetchEarnedBadges',
  async (_, { rejectWithValue }) => {
    try {
      const response = await badgesAPI.getEarned();
      return (Array.isArray(response.data?.badges) ? response.data.badges : []) as Badge[];
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch earned badges'));
    }
  }
);

export const fetchProgress = createAsyncThunk<
  { badges: Badge[]; earnedBadges: Badge[] },
  void,
  { rejectValue: string }
>('badges/fetchProgress', async (_, { rejectWithValue }) => {
  try {
    const response = await badgesAPI.getAllWithProgress();
    const badges = (Array.isArray(response.data?.badges) ? response.data.badges : []) as Badge[];
    const earnedBadges = badges.filter((badge) => badge.earned);
    return { badges, earnedBadges };
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch badge progress'));
  }
});

const badgesSlice = createSlice({
  name: 'badges',
  initialState,
  reducers: {
    clearBadgesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = action.payload;
        state.progress = buildProgress(state.badges, state.earnedBadges);
      })
      .addCase(fetchBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch badges';
      })
      .addCase(fetchEarnedBadges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEarnedBadges.fulfilled, (state, action) => {
        state.loading = false;
        state.earnedBadges = action.payload;
        state.progress = buildProgress(state.badges, state.earnedBadges);
      })
      .addCase(fetchEarnedBadges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch earned badges';
      })
      .addCase(fetchProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.badges = action.payload.badges;
        state.earnedBadges = action.payload.earnedBadges;
        state.progress = buildProgress(state.badges, state.earnedBadges);
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch badge progress';
      });
  },
});

export const { clearBadgesError } = badgesSlice.actions;
export default badgesSlice.reducer;
