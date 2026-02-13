import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { enhancedLeaderboardAPI, extractApiErrorMessage } from '../services/api';

export type LeaderboardPeriod = 'WEEKLY' | 'MONTHLY' | 'ALL_TIME';

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  score: number;
  rawPoints: number;
  streak: number;
  daysActive: number;
  rankMovement?: number;
  previousRank?: number;
  isNew?: boolean;
}

export interface RankContext {
  myRank?: LeaderboardEntry;
  aboveMe?: LeaderboardEntry;
  belowMe?: LeaderboardEntry;
  totalParticipants?: number;
  notRanked?: boolean;
  reason?: string;
}

export interface LeaderboardTrendPoint {
  period: LeaderboardPeriod;
  participants: number;
  topScore: number;
}

interface LeaderboardResponse {
  rankings: LeaderboardEntry[];
  period: LeaderboardPeriod;
  categoryName: string | null;
}

interface EnhancedLeaderboardState {
  leaderboard: LeaderboardEntry[];
  rankings: LeaderboardEntry[];
  myContext: RankContext | null;
  period: LeaderboardPeriod;
  categoryName: string | null;
  trends: LeaderboardTrendPoint[];
  friends: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
}

interface LeaderboardQuery {
  category?: string;
  period?: LeaderboardPeriod;
}

const PERIODS_FOR_TRENDS: LeaderboardPeriod[] = ['WEEKLY', 'MONTHLY', 'ALL_TIME'];

const initialState: EnhancedLeaderboardState = {
  leaderboard: [],
  rankings: [],
  myContext: null,
  period: 'MONTHLY',
  categoryName: null,
  trends: [],
  friends: [],
  loading: false,
  error: null,
};

export const fetchEnhancedLeaderboard = createAsyncThunk<
  LeaderboardResponse,
  LeaderboardQuery,
  { rejectValue: string }
>('enhancedLeaderboard/fetch', async ({ category, period }, { rejectWithValue }) => {
  try {
    const response = await enhancedLeaderboardAPI.getLeaderboard(category, period);
    return response.data as LeaderboardResponse;
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch leaderboard'));
  }
});

export const fetchMyRankContext = createAsyncThunk<RankContext, LeaderboardQuery, { rejectValue: string }>(
  'enhancedLeaderboard/fetchContext',
  async ({ category, period }, { rejectWithValue }) => {
    try {
      const response = await enhancedLeaderboardAPI.getMyContext(category, period);
      return response.data as RankContext;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch rank context'));
    }
  }
);

export const fetchTrends = createAsyncThunk<
  LeaderboardTrendPoint[],
  { category?: string } | void,
  { rejectValue: string }
>('enhancedLeaderboard/fetchTrends', async (query, { rejectWithValue }) => {
  try {
    const category = query?.category;
    const responses = await Promise.all(
      PERIODS_FOR_TRENDS.map((period) => enhancedLeaderboardAPI.getLeaderboard(category, period))
    );

    return responses.map((response, index) => {
      const rankings = Array.isArray(response.data?.rankings) ? (response.data.rankings as LeaderboardEntry[]) : [];
      const topScore = rankings.length > 0 ? Number(rankings[0].score || 0) : 0;
      return {
        period: PERIODS_FOR_TRENDS[index],
        participants: rankings.length,
        topScore,
      };
    });
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch leaderboard trends'));
  }
});

const enhancedLeaderboardSlice = createSlice({
  name: 'enhancedLeaderboard',
  initialState,
  reducers: {
    setPeriod: (state, action) => {
      state.period = action.payload as LeaderboardPeriod;
    },
    setCategory: (state, action) => {
      state.categoryName = action.payload as string | null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnhancedLeaderboard.pending, (state) => {
        if (state.rankings.length === 0) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchEnhancedLeaderboard.fulfilled, (state, action) => {
        state.loading = false;
        state.rankings = action.payload.rankings || [];
        state.leaderboard = action.payload.rankings || [];
        state.period = action.payload.period || state.period;
        state.categoryName = action.payload.categoryName;
        state.error = null;
      })
      .addCase(fetchEnhancedLeaderboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch leaderboard';
        state.rankings = [];
        state.leaderboard = [];
      })
      .addCase(fetchMyRankContext.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchMyRankContext.fulfilled, (state, action) => {
        state.myContext = action.payload;
        const friends = [action.payload.aboveMe, action.payload.myRank, action.payload.belowMe].filter(
          Boolean
        ) as LeaderboardEntry[];
        state.friends = friends;
      })
      .addCase(fetchMyRankContext.rejected, (state, action) => {
        state.myContext = null;
        state.friends = [];
        state.error = action.payload || state.error;
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.trends = action.payload;
      })
      .addCase(fetchTrends.rejected, (state, action) => {
        state.error = action.payload || state.error;
      });
  },
});

export const { setPeriod, setCategory } = enhancedLeaderboardSlice.actions;
export default enhancedLeaderboardSlice.reducer;
