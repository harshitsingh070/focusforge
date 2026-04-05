import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { diagnosticAPI, enhancedLeaderboardAPI, extractApiErrorMessage } from '../services/api';

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
  contextError: string | null;
  activeLeaderboardRequestId: string | null;
  activeContextRequestId: string | null;
}

interface LeaderboardQuery {
  category?: string;
  period?: LeaderboardPeriod;
}

interface DiagnosticUser {
  id: number;
  username: string;
  privacySettings?: unknown;
}

interface DiagnosticGoal {
  id: number;
  category?: unknown;
  isPrivate?: unknown;
  isActive?: unknown;
}

interface DiagnosticPointEntry {
  userId: number;
  goalId: number;
  points: number;
  referenceDate?: unknown;
}

interface DiagnosticLeaderboardData {
  users?: unknown;
  goals?: unknown;
  pointEntries?: unknown;
}

const PERIODS_FOR_TRENDS: LeaderboardPeriod[] = ['WEEKLY', 'MONTHLY', 'ALL_TIME'];

const annotateRankMovement = (previousRankings: LeaderboardEntry[], nextRankings: LeaderboardEntry[]) => {
  if (previousRankings.length === 0) {
    return nextRankings.map((entry) => ({
      ...entry,
      previousRank: entry.rank,
      rankMovement: 0,
      isNew: false,
    }));
  }

  const previousRanksByUser = new Map(previousRankings.map((entry) => [entry.userId, entry.rank]));

  return nextRankings.map((entry) => {
    const previousRank = previousRanksByUser.get(entry.userId);

    return {
      ...entry,
      previousRank: previousRank ?? entry.rank,
      rankMovement: previousRank === undefined ? 0 : previousRank - entry.rank,
      isNew: previousRank === undefined,
    };
  });
};

const getPeriodStartDate = (period: LeaderboardPeriod) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const start = new Date(today);
  if (period === 'WEEKLY') {
    start.setDate(start.getDate() - 7);
  } else if (period === 'MONTHLY') {
    start.setDate(start.getDate() - 30);
  } else {
    start.setFullYear(2020, 0, 1);
    start.setHours(0, 0, 0, 0);
  }

  return { start, end: today };
};

const parseDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || value.trim().length === 0 || value === 'null') {
    return null;
  }
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const isUserVisible = (privacySettings: unknown) => {
  if (privacySettings == null) {
    return true;
  }

  let parsed: unknown = privacySettings;
  if (typeof privacySettings === 'string') {
    if (privacySettings.trim().length === 0 || privacySettings === 'null') {
      return true;
    }
    try {
      parsed = JSON.parse(privacySettings);
    } catch {
      return true;
    }
  }

  if (parsed && typeof parsed === 'object' && 'showLeaderboard' in parsed) {
    const value = (parsed as { showLeaderboard?: unknown }).showLeaderboard;
    if (typeof value === 'boolean') {
      return value;
    }
  }

  return true;
};

const calculateLongestStreak = (dateKeys: Set<string>) => {
  const sorted = Array.from(dateKeys).sort();
  if (sorted.length === 0) {
    return 0;
  }

  let best = 1;
  let current = 1;
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = new Date(`${sorted[index - 1]}T00:00:00`);
    const currentDate = new Date(`${sorted[index]}T00:00:00`);
    const deltaDays = Math.round((currentDate.getTime() - previous.getTime()) / 86400000);

    if (deltaDays === 1) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }

  return best;
};

const toDiagnosticRankings = (
  diagnosticData: DiagnosticLeaderboardData | undefined,
  categoryName: string,
  period: LeaderboardPeriod
) => {
  const safeData = diagnosticData || {};
  const users = Array.isArray(safeData.users) ? (safeData.users as DiagnosticUser[]) : [];
  const goals = Array.isArray(safeData.goals) ? (safeData.goals as DiagnosticGoal[]) : [];
  const pointEntries = Array.isArray(safeData.pointEntries)
    ? (safeData.pointEntries as DiagnosticPointEntry[])
    : [];

  if (users.length === 0 || goals.length === 0 || pointEntries.length === 0) {
    return [] as LeaderboardEntry[];
  }

  const normalizedCategory = categoryName.trim().toLowerCase();
  const goalIds = new Set<string>();
  goals.forEach((goal) => {
    const goalCategory = typeof goal.category === 'string' ? goal.category.trim().toLowerCase() : '';
    const isPrivate = goal.isPrivate === true;
    const isActive = goal.isActive !== false;
    if (goalCategory === normalizedCategory && !isPrivate && isActive) {
      goalIds.add(String(goal.id));
    }
  });

  if (goalIds.size === 0) {
    return [] as LeaderboardEntry[];
  }

  const visibleUsers = new Map<number, string>();
  users.forEach((user) => {
    if (isUserVisible(user.privacySettings)) {
      visibleUsers.set(Number(user.id), user.username);
    }
  });

  const { start, end } = getPeriodStartDate(period);
  const aggregates = new Map<number, { username: string; rawPoints: number; activeDates: Set<string> }>();

  pointEntries.forEach((entry) => {
    if (!goalIds.has(String(entry.goalId))) {
      return;
    }

    const date = parseDate(entry.referenceDate);
    if (!date || date < start || date > end) {
      return;
    }

    const userId = Number(entry.userId);
    if (!Number.isFinite(userId) || !visibleUsers.has(userId)) {
      return;
    }

    const username = visibleUsers.get(userId) || 'User';
    const points = Number(entry.points || 0);
    const key = date.toISOString().slice(0, 10);

    const aggregate = aggregates.get(userId) || { username, rawPoints: 0, activeDates: new Set<string>() };
    aggregate.rawPoints += points;
    aggregate.activeDates.add(key);
    aggregates.set(userId, aggregate);
  });

  const rows = Array.from(aggregates.entries())
    .map(([userId, aggregate]) => {
      const daysActive = aggregate.activeDates.size;
      const streak = calculateLongestStreak(aggregate.activeDates);
      return {
        userId,
        username: aggregate.username,
        rawPoints: aggregate.rawPoints,
        daysActive,
        streak,
      };
    })
    .filter((row) => row.rawPoints > 0);

  if (rows.length === 0) {
    return [] as LeaderboardEntry[];
  }

  const maxPoints = Math.max(...rows.map((row) => row.rawPoints), 1);
  const maxDaysActive = Math.max(...rows.map((row) => row.daysActive), 1);
  const maxStreak = Math.max(...rows.map((row) => row.streak), 1);

  const scored = rows.map((row) => {
    const pointsScore = (row.rawPoints * 100) / maxPoints;
    const daysScore = (row.daysActive * 100) / maxDaysActive;
    const streakScore = (row.streak * 100) / maxStreak;
    const score = Math.round(((pointsScore * 0.4 + streakScore * 0.3 + daysScore * 0.3) * 10)) / 10;

    return {
      ...row,
      score,
    };
  });

  scored.sort((left, right) => {
    if (right.score !== left.score) return right.score - left.score;
    if (right.rawPoints !== left.rawPoints) return right.rawPoints - left.rawPoints;
    return left.username.localeCompare(right.username);
  });

  return scored.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    username: row.username,
    score: row.score,
    rawPoints: row.rawPoints,
    streak: row.streak,
    daysActive: row.daysActive,
  }));
};

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
  contextError: null,
  activeLeaderboardRequestId: null,
  activeContextRequestId: null,
};

export const fetchEnhancedLeaderboard = createAsyncThunk<
  LeaderboardResponse,
  LeaderboardQuery,
  { rejectValue: string }
>('enhancedLeaderboard/fetch', async ({ category, period }, { rejectWithValue }) => {
  try {
    const selectedCategory = category?.trim();
    const selectedPeriod = period || 'MONTHLY';
    const response = await enhancedLeaderboardAPI.getLeaderboard(selectedCategory, selectedPeriod);
    const payload = response.data as LeaderboardResponse;

    // Frontend fallback: some environments still return empty category rows on v2,
    // while the legacy category endpoint has valid ranking data.
    const hasNoV2CategoryRows =
      !!selectedCategory &&
      (!Array.isArray(payload.rankings) || payload.rankings.length === 0);

    if (!hasNoV2CategoryRows) {
      return payload;
    }

    if (!selectedCategory) {
      return payload;
    }

    try {
      const diagnosticResponse = await diagnosticAPI.getLeaderboardData();
      const rankings = toDiagnosticRankings(
        diagnosticResponse.data as DiagnosticLeaderboardData,
        selectedCategory,
        selectedPeriod
      );
      if (rankings.length === 0) {
        console.warn(`No rankings found for category: ${selectedCategory} in period: ${selectedPeriod}`);
        return payload;
      }

      return {
        rankings,
        period: selectedPeriod,
        categoryName: selectedCategory,
      };
    } catch (diagnosticError) {
      console.error(`Diagnostic API fallback failed for category ${selectedCategory}:`, diagnosticError);
      return payload;
    }
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
    const selectedCategory = query?.category?.trim();
    let diagnosticData: DiagnosticLeaderboardData | undefined;

    if (selectedCategory) {
      try {
        const diagnosticResponse = await diagnosticAPI.getLeaderboardData();
        diagnosticData = diagnosticResponse.data as DiagnosticLeaderboardData;
      } catch {
        diagnosticData = undefined;
      }
    }

    const responses = await Promise.allSettled(
      PERIODS_FOR_TRENDS.map((period) => enhancedLeaderboardAPI.getLeaderboard(selectedCategory, period))
    );

    return responses.map((result, index) => {
      const period = PERIODS_FOR_TRENDS[index];
      let rankings: LeaderboardEntry[] = [];

      if (result.status === 'fulfilled' && Array.isArray(result.value.data?.rankings)) {
        rankings = result.value.data.rankings as LeaderboardEntry[];
      }

      if (selectedCategory && rankings.length === 0 && diagnosticData) {
        rankings = toDiagnosticRankings(diagnosticData, selectedCategory, period);
      }

      const topScore = rankings.length > 0 ? Number(rankings[0].score || 0) : 0;
      return {
        period,
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
      .addCase(fetchEnhancedLeaderboard.pending, (state, action) => {
        if (state.rankings.length === 0) {
          state.loading = true;
        }
        state.error = null;
        state.activeLeaderboardRequestId = action.meta.requestId;
      })
      .addCase(fetchEnhancedLeaderboard.fulfilled, (state, action) => {
        if (state.activeLeaderboardRequestId !== action.meta.requestId) {
          return;
        }
        const nextRankings = annotateRankMovement(state.rankings, action.payload.rankings || []);
        state.loading = false;
        state.rankings = nextRankings;
        state.leaderboard = nextRankings;
        state.period = action.payload.period || state.period;
        state.categoryName = action.payload.categoryName;
        state.error = null;
        state.activeLeaderboardRequestId = null;
      })
      .addCase(fetchEnhancedLeaderboard.rejected, (state, action) => {
        if (state.activeLeaderboardRequestId !== action.meta.requestId) {
          return;
        }
        state.loading = false;
        state.error = action.payload || 'Failed to fetch leaderboard';
        state.rankings = [];
        state.leaderboard = [];
        state.activeLeaderboardRequestId = null;
      })
      .addCase(fetchMyRankContext.pending, (state, action) => {
        state.contextError = null;
        state.activeContextRequestId = action.meta.requestId;
      })
      .addCase(fetchMyRankContext.fulfilled, (state, action) => {
        if (state.activeContextRequestId !== action.meta.requestId) {
          return;
        }
        state.myContext = action.payload;
        const friends = [action.payload.aboveMe, action.payload.myRank, action.payload.belowMe].filter(
          Boolean
        ) as LeaderboardEntry[];
        state.friends = friends;
        state.contextError = null;
        state.activeContextRequestId = null;
      })
      .addCase(fetchMyRankContext.rejected, (state, action) => {
        if (state.activeContextRequestId !== action.meta.requestId) {
          return;
        }
        state.myContext = null;
        state.friends = [];
        state.contextError = action.payload || 'Failed to fetch rank context';
        state.activeContextRequestId = null;
      })
      .addCase(fetchTrends.fulfilled, (state, action) => {
        state.trends = action.payload;
      })
      .addCase(fetchTrends.rejected, (state) => {
        state.trends = [];
      });
  },
});

export const { setPeriod, setCategory } = enhancedLeaderboardSlice.actions;
export default enhancedLeaderboardSlice.reducer;
