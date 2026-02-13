import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { goalsAPI } from '../services/api';
import { Goal, GoalRequest } from '../types';

interface GoalsState {
  goals: Goal[];
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  loading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk<Goal[], void, { rejectValue: string }>('goals/fetchGoals', async (_, { rejectWithValue }) => {
  try {
    const response = await goalsAPI.getGoals();
    return response.data as Goal[];
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch goals');
  }
});

export const createGoal = createAsyncThunk<Goal, GoalRequest, { rejectValue: string }>(
  'goals/createGoal',
  async (goalRequest, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.createGoal(goalRequest);
      return response.data as Goal;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create goal');
    }
  }
);

export const updateGoal = createAsyncThunk<
  Goal,
  { id: number; goalRequest: GoalRequest },
  { rejectValue: string }
>('goals/updateGoal', async ({ id, goalRequest }, { rejectWithValue }) => {
  try {
    const response = await goalsAPI.updateGoal(id, goalRequest);
    return response.data as Goal;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update goal');
  }
});

export const deleteGoal = createAsyncThunk<number, number, { rejectValue: string }>(
  'goals/deleteGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      await goalsAPI.deleteGoal(goalId);
      return goalId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete goal');
    }
  }
);

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    clearGoalsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch goals';
      })

      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.unshift(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create goal';
      })

      .addCase(updateGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.map((goal) => (goal.id === action.payload.id ? action.payload : goal));
      })
      .addCase(updateGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update goal';
      })

      .addCase(deleteGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = state.goals.filter((goal) => goal.id !== action.payload);
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete goal';
      });
  },
});

export const { clearGoalsError } = goalsSlice.actions;
export default goalsSlice.reducer;
