import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authAPI } from '../services/api';

interface AuthUser {
  id?: number;
  username?: string;
  email?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const decodeJwtPayload = (token: string | null): Record<string, any> | null => {
  if (!token) {
    return null;
  }

  const segments = token.split('.');
  if (segments.length < 2) {
    return null;
  }

  try {
    const base64 = segments[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const storedToken = localStorage.getItem('token');
const storedPayload = decodeJwtPayload(storedToken);
const storedId = storedPayload?.sub ? Number(storedPayload.sub) : undefined;
const storedUsername =
  typeof storedPayload?.username === 'string' &&
  typeof storedPayload?.email === 'string' &&
  storedPayload.username !== storedPayload.email
    ? storedPayload.username
    : undefined;

const initialState: AuthState = {
  user:
    typeof storedPayload?.email === 'string'
      ? {
          id: Number.isFinite(storedId) ? storedId : undefined,
          username: storedUsername,
          email: storedPayload.email,
        }
      : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials.email, credentials.password);
      const { token, userId, username, email } = response.data;
      localStorage.setItem('token', token);
      return { token, user: { id: userId, username, email } };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: { username: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      await authAPI.signup(data.username, data.email, data.password);
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Signup failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
