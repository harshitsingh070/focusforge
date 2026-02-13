import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiErrorMessage, leaderboardAPI } from '../services/api';
import { LeaderboardRanking, UserRankPosition } from '../types';

interface LeaderboardState {
  rankings: LeaderboardRanking[];
  userPosition: UserRankPosition | null;
  selectedCategory: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeaderboardState = {
  rankings: [],
  userPosition: null,
  selectedCategory: null,
  loading: false,
  error: null,
};

export const fetchLeaderboard = createAsyncThunk<
  LeaderboardRanking[],
  { category?: string | null; limit?: number } | void,
  { rejectValue: string }
>('leaderboard/fetchLeaderboard', async (query, { rejectWithValue }) => {
  try {
    const category = query?.category ?? null;
    const limit = query?.limit ?? 20;
    const response = category
      ? await leaderboardAPI.getCategory(category, limit)
      : await leaderboardAPI.getOverall(limit);

    const rankings = Array.isArray(response.data?.rankings) ? response.data.rankings : [];
    return rankings as LeaderboardRanking[];
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch leaderboard'));
  }
});

export const fetchUserPosition = createAsyncThunk<UserRankPosition, void, { rejectValue: string }>(
  'leaderboard/fetchUserPosition',
  async (_, { rejectWithValue }) => {
    try {
      const response = await leaderboardAPI.getMyRank();
      return response.data as UserRankPosition;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch user rank'));
    }
  }
);

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload as string | null;
    },
    clearLeaderboardError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.rankings = action.payload;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch leaderboard';
      })
      .addCase(fetchUserPosition.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUserPosition.fulfilled, (state, action) => {
        state.userPosition = action.payload;
      })
      .addCase(fetchUserPosition.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch user rank';
      });
  },
});

export const { setSelectedCategory, clearLeaderboardError } = leaderboardSlice.actions;
export default leaderboardSlice.reducer;
