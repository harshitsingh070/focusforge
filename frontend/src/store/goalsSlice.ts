import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiErrorMessage, goalsAPI } from '../services/api';
import { Goal, GoalRequest } from '../types';

interface GoalsState {
  goals: Goal[];
  selectedGoal: Goal | null;
  loading: boolean;
  error: string | null;
}

const initialState: GoalsState = {
  goals: [],
  selectedGoal: null,
  loading: false,
  error: null,
};

export const fetchGoals = createAsyncThunk<Goal[], void, { rejectValue: string }>(
  'goals/fetchGoals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.getGoals();
      return (Array.isArray(response.data) ? response.data : []) as Goal[];
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch goals'));
    }
  }
);

export const fetchGoalById = createAsyncThunk<Goal, number, { rejectValue: string }>(
  'goals/fetchGoalById',
  async (goalId, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.getGoalById(goalId);
      return response.data as Goal;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch goal details'));
    }
  }
);

export const createGoal = createAsyncThunk<Goal, GoalRequest, { rejectValue: string }>(
  'goals/createGoal',
  async (goalRequest, { rejectWithValue }) => {
    try {
      const response = await goalsAPI.createGoal(goalRequest);
      return response.data as Goal;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to create goal'));
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
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to update goal'));
  }
});

export const deleteGoal = createAsyncThunk<number, number, { rejectValue: string }>(
  'goals/deleteGoal',
  async (goalId, { rejectWithValue }) => {
    try {
      await goalsAPI.deleteGoal(goalId);
      return goalId;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to delete goal'));
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
    setSelectedGoal: (state, action) => {
      state.selectedGoal = action.payload as Goal | null;
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
        if (state.selectedGoal) {
          state.selectedGoal = action.payload.find((goal) => goal.id === state.selectedGoal?.id) || null;
        }
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch goals';
      })
      .addCase(fetchGoalById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoalById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedGoal = action.payload;

        const existingIndex = state.goals.findIndex((goal) => goal.id === action.payload.id);
        if (existingIndex >= 0) {
          state.goals[existingIndex] = action.payload;
        } else {
          state.goals.unshift(action.payload);
        }
      })
      .addCase(fetchGoalById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch goal details';
      })
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.unshift(action.payload);
        state.selectedGoal = action.payload;
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
        if (state.selectedGoal?.id === action.payload.id) {
          state.selectedGoal = action.payload;
        }
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
        if (state.selectedGoal?.id === action.payload) {
          state.selectedGoal = null;
        }
      })
      .addCase(deleteGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete goal';
      });
  },
});

export const { clearGoalsError, setSelectedGoal } = goalsSlice.actions;
export default goalsSlice.reducer;
