import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { authAPI, extractApiErrorMessage } from '../services/api';

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

interface DecodedJwtPayload {
  sub?: string | number;
  email?: string;
  username?: string;
  exp?: number;
  [key: string]: unknown;
}

const decodeJwtPayload = (token: string | null): DecodedJwtPayload | null => {
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return JSON.parse(atob(padded)) as DecodedJwtPayload;
  } catch {
    return null;
  }
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

const buildUserFromPayload = (payload: DecodedJwtPayload | null): AuthUser | null => {
  if (!payload) {
    return null;
  }

  const email = typeof payload.email === 'string' ? payload.email : undefined;
  const username = typeof payload.username === 'string' ? payload.username : undefined;
  const id = toNumber(payload.sub);

  if (!email && !username && id === undefined) {
    return null;
  }

  return { id, username, email };
};

const isTokenExpired = (payload: DecodedJwtPayload | null): boolean => {
  if (!payload?.exp || typeof payload.exp !== 'number') {
    return false;
  }
  return payload.exp * 1000 <= Date.now();
};

const bootstrapToken = localStorage.getItem('token');
const bootstrapPayload = decodeJwtPayload(bootstrapToken);
const bootstrapExpired = isTokenExpired(bootstrapPayload);
if (bootstrapExpired) {
  localStorage.removeItem('token');
}

const initialState: AuthState = {
  user: bootstrapExpired ? null : buildUserFromPayload(bootstrapPayload),
  token: bootstrapExpired ? null : bootstrapToken,
  isAuthenticated: !bootstrapExpired && !!bootstrapToken,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  { token: string; user: AuthUser },
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(credentials.email, credentials.password);
    const data = response.data as {
      token: string;
      userId?: number;
      username?: string;
      email?: string;
    };

    if (!data?.token) {
      return rejectWithValue('Login response does not contain token');
    }

    const decoded = decodeJwtPayload(data.token);
    const user: AuthUser = {
      id: data.userId ?? toNumber(decoded?.sub),
      username: data.username ?? (typeof decoded?.username === 'string' ? decoded.username : undefined),
      email: data.email ?? (typeof decoded?.email === 'string' ? decoded.email : undefined),
    };

    localStorage.setItem('token', data.token);
    return { token: data.token, user };
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Login failed'));
  }
});

export const signup = createAsyncThunk<
  { success: true },
  { username: string; email: string; password: string },
  { rejectValue: string }
>('auth/signup', async (payload, { rejectWithValue }) => {
  try {
    await authAPI.signup(payload.username, payload.email, payload.password);
    return { success: true };
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Signup failed'));
  }
});

export const refreshToken = createAsyncThunk<
  { token: string; user: AuthUser },
  void,
  { rejectValue: string }
>('auth/refreshToken', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token');
  const decoded = decodeJwtPayload(token);

  if (!token || !decoded) {
    localStorage.removeItem('token');
    return rejectWithValue('No valid session found. Please login again.');
  }

  if (isTokenExpired(decoded)) {
    localStorage.removeItem('token');
    return rejectWithValue('Session expired. Please login again.');
  }

  const user = buildUserFromPayload(decoded);
  if (!user) {
    localStorage.removeItem('token');
    return rejectWithValue('Session is invalid. Please login again.');
  }

  return { token, user };
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAuthUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (!state.user) {
        state.user = {};
      }

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload);
    },
    logout: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
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
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Signup failed';
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || 'Session invalid';
      });
  },
});

export const { updateAuthUser, setAuthToken, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
