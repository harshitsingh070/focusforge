import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface LeaderboardEntry {
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

interface RankContext {
    myRank?: LeaderboardEntry;
    aboveMe?: LeaderboardEntry;
    belowMe?: LeaderboardEntry;
    totalParticipants?: number;
    notRanked?: boolean;
    reason?: string;
}

interface EnhancedLeaderboardState {
    rankings: LeaderboardEntry[];
    myContext: RankContext | null;
    period: string;
    categoryName: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: EnhancedLeaderboardState = {
    rankings: [],
    myContext: null,
    period: 'MONTHLY',
    categoryName: null,
    loading: false,
    error: null,
};

export const fetchEnhancedLeaderboard = createAsyncThunk(
    'enhancedLeaderboard/fetch',
    async ({ category, period }: { category?: string; period?: string }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (period) params.append('period', period || 'MONTHLY');

            const response = await api.get(`/leaderboard/v2?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch leaderboard');
        }
    }
);

export const fetchMyRankContext = createAsyncThunk(
    'enhancedLeaderboard/fetchContext',
    async ({ category, period }: { category?: string; period?: string }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (category) params.append('category', category);
            if (period) params.append('period', period || 'MONTHLY');

            const response = await api.get(`/leaderboard/v2/my-context?${params.toString()}`);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch rank context');
        }
    }
);

const enhancedLeaderboardSlice = createSlice({
    name: 'enhancedLeaderboard',
    initialState,
    reducers: {
        setPeriod: (state, action) => {
            state.period = action.payload;
        },
        setCategory: (state, action) => {
            state.categoryName = action.payload;
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
                state.rankings = action.payload.rankings;
                state.period = action.payload.period;
                state.categoryName = action.payload.categoryName;
                state.error = null;
            })
            .addCase(fetchEnhancedLeaderboard.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.rankings = [];
            })
            .addCase(fetchMyRankContext.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchMyRankContext.fulfilled, (state, action) => {
                state.myContext = action.payload;
            })
            .addCase(fetchMyRankContext.rejected, (state, action) => {
                state.myContext = null;
                state.error = (action.payload as string) || state.error;
            });
    },
});

export const { setPeriod, setCategory } = enhancedLeaderboardSlice.actions;
export default enhancedLeaderboardSlice.reducer;
