import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { extractApiErrorMessage, settingsAPI } from '../services/api';
import { applyTheme } from '../utils/theme';
import {
  ChangePasswordPayload,
  PrivacySettings,
  ProfileSettingsData,
  SettingsPayload,
  UserPreferences,
} from '../types';
import { setAuthToken, updateAuthUser } from './authSlice';
import { updatePreferences as updateNotificationPreferences } from './notificationsSlice';

interface SettingsState {
  privacy: PrivacySettings;
  preferences: UserPreferences;
  profile: ProfileSettingsData;
  privacySettings: PrivacySettings | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
  passwordLoading: boolean;
  passwordError: string | null;
  passwordUpdateSuccess: boolean;
  passwordMessage: string | null;
}

interface SettingsResponse {
  privacy: PrivacySettings;
  preferences: UserPreferences;
  profile: ProfileSettingsData;
  token?: string;
}

const SETTINGS_PREFERENCES_KEY = 'focusforge.userPreferences';
const SETTINGS_PROFILE_KEY = 'focusforge.profile';

const defaultPrivacySettings: PrivacySettings = {
  showActivity: 'PUBLIC',
  showLeaderboard: true,
  showBadges: true,
  showProgress: true,
};

const defaultPreferences: UserPreferences = {
  theme: 'system',
  emailReminders: true,
  weeklySummary: true,
};

const defaultProfile: ProfileSettingsData = {
  username: '',
  email: '',
  bio: '',
};

const safeJsonParse = <T>(raw: string | null, fallback: T): T => {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

const isEndpointMissingError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

const normalizePrivacySettings = (value: unknown): PrivacySettings => {
  const candidate = (value || {}) as Partial<PrivacySettings>;
  return {
    showActivity:
      candidate.showActivity === 'PUBLIC' ||
      candidate.showActivity === 'FRIENDS' ||
      candidate.showActivity === 'PRIVATE'
        ? candidate.showActivity
        : defaultPrivacySettings.showActivity,
    showLeaderboard:
      typeof candidate.showLeaderboard === 'boolean'
        ? candidate.showLeaderboard
        : defaultPrivacySettings.showLeaderboard,
    showBadges:
      typeof candidate.showBadges === 'boolean' ? candidate.showBadges : defaultPrivacySettings.showBadges,
    showProgress:
      typeof candidate.showProgress === 'boolean' ? candidate.showProgress : defaultPrivacySettings.showProgress,
  };
};

const normalizePreferences = (value: unknown): UserPreferences => {
  const candidate = (value || {}) as Partial<UserPreferences>;
  return {
    theme:
      candidate.theme === 'dark' || candidate.theme === 'light' || candidate.theme === 'system'
        ? candidate.theme
        : defaultPreferences.theme,
    emailReminders:
      typeof candidate.emailReminders === 'boolean'
        ? candidate.emailReminders
        : defaultPreferences.emailReminders,
    weeklySummary:
      typeof candidate.weeklySummary === 'boolean'
        ? candidate.weeklySummary
        : defaultPreferences.weeklySummary,
  };
};

const normalizeProfile = (value: unknown): ProfileSettingsData => {
  const candidate = (value || {}) as Partial<ProfileSettingsData>;
  return {
    username: typeof candidate.username === 'string' ? candidate.username : defaultProfile.username,
    email: typeof candidate.email === 'string' ? candidate.email : defaultProfile.email,
    bio: typeof candidate.bio === 'string' ? candidate.bio : defaultProfile.bio,
  };
};

const hydrateUserFromAuthState = (state: unknown): Pick<ProfileSettingsData, 'username' | 'email'> => {
  const appState = state as {
    auth?: {
      user?: {
        username?: string;
        email?: string;
      };
    };
  };

  return {
    username: appState.auth?.user?.username || '',
    email: appState.auth?.user?.email || '',
  };
};

const initialState: SettingsState = {
  privacy: defaultPrivacySettings,
  preferences: normalizePreferences(safeJsonParse(localStorage.getItem(SETTINGS_PREFERENCES_KEY), {})),
  profile: normalizeProfile(safeJsonParse(localStorage.getItem(SETTINGS_PROFILE_KEY), {})),
  privacySettings: null,
  loading: false,
  error: null,
  updateSuccess: false,
  passwordLoading: false,
  passwordError: null,
  passwordUpdateSuccess: false,
  passwordMessage: null,
};

export const fetchSettings = createAsyncThunk<SettingsResponse, void, { rejectValue: string }>(
  'settings/fetchSettings',
  async (_, { dispatch, getState, rejectWithValue }) => {
    try {
      let data: Record<string, unknown> = {};
      try {
        const response = await settingsAPI.getSettings();
        data = (response.data || {}) as Record<string, unknown>;
      } catch (error) {
        if (!isEndpointMissingError(error)) {
          throw error;
        }

        const privacyResponse = await settingsAPI.getPrivacySettings();
        data = {
          privacySettings: privacyResponse.data?.privacySettings,
        };
      }

      const privacy = normalizePrivacySettings(data.privacy || data.privacySettings);
      const preferences = normalizePreferences(
        data.preferences || safeJsonParse(localStorage.getItem(SETTINGS_PREFERENCES_KEY), defaultPreferences)
      );
      const storedProfile = normalizeProfile(safeJsonParse(localStorage.getItem(SETTINGS_PROFILE_KEY), defaultProfile));
      const responseProfile = normalizeProfile(data.profile || {});
      const authUser = hydrateUserFromAuthState(getState());

      const profile = normalizeProfile({
        ...storedProfile,
        ...responseProfile,
        username: responseProfile.username || storedProfile.username || authUser.username,
        email: responseProfile.email || storedProfile.email || authUser.email,
      });

      localStorage.setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(preferences));
      localStorage.setItem(SETTINGS_PROFILE_KEY, JSON.stringify(profile));
      applyTheme(preferences.theme);

      dispatch(
        updateNotificationPreferences({
          emailReminders: preferences.emailReminders,
          weeklySummary: preferences.weeklySummary,
        })
      );
      dispatch(
        updateAuthUser({
          username: profile.username,
          email: profile.email,
        })
      );

      return { privacy, preferences, profile };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch settings'));
    }
  }
);

export const updateSettings = createAsyncThunk<SettingsResponse, SettingsPayload, { rejectValue: string }>(
  'settings/updateSettings',
  async (payload, { dispatch, getState, rejectWithValue }) => {
    try {
      const current = (getState() as { settings: SettingsState }).settings;

      const mergedPrivacy = normalizePrivacySettings(payload.privacy || current.privacy);
      const mergedPreferences = normalizePreferences(payload.preferences || current.preferences);
      const mergedProfile = normalizeProfile(payload.profile || current.profile);

      let data: Record<string, unknown> = {};
      try {
        const response = await settingsAPI.updateSettings({
          privacy: mergedPrivacy,
          preferences: mergedPreferences,
          profile: mergedProfile,
        });
        data = (response.data || {}) as Record<string, unknown>;
      } catch (error) {
        if (!isEndpointMissingError(error)) {
          throw error;
        }

        const response = await settingsAPI.updatePrivacySettings(mergedPrivacy);
        data = {
          privacySettings: response.data?.privacySettings,
        };
      }

      const privacy = normalizePrivacySettings(data.privacy || data.privacySettings || mergedPrivacy);
      const preferences = normalizePreferences(data.preferences || mergedPreferences);
      const profile = normalizeProfile({
        ...mergedProfile,
        ...(data.profile || {}),
      });

      localStorage.setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(preferences));
      localStorage.setItem(SETTINGS_PROFILE_KEY, JSON.stringify(profile));
      applyTheme(preferences.theme);

      dispatch(
        updateNotificationPreferences({
          emailReminders: preferences.emailReminders,
          weeklySummary: preferences.weeklySummary,
        })
      );
      dispatch(
        updateAuthUser({
          username: profile.username,
          email: profile.email,
        })
      );

      if (typeof data.token === 'string' && data.token.trim().length > 0) {
        dispatch(setAuthToken(data.token));
      }

      return {
        privacy,
        preferences,
        profile,
        token: typeof data.token === 'string' ? data.token : undefined,
      };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to update settings'));
    }
  }
);

export const fetchPrivacySettings = createAsyncThunk<PrivacySettings, void, { rejectValue: string }>(
  'settings/fetchPrivacy',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const settings = await dispatch(fetchSettings()).unwrap();
      return settings.privacy;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch privacy settings'));
    }
  }
);

export const updatePrivacySettings = createAsyncThunk<
  PrivacySettings,
  PrivacySettings,
  { rejectValue: string }
>('settings/updatePrivacy', async (payload, { dispatch, rejectWithValue }) => {
  try {
    const settings = await dispatch(updateSettings({ privacy: payload })).unwrap();
    return settings.privacy;
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to update privacy settings'));
  }
});

export const changePassword = createAsyncThunk<
  { message: string },
  ChangePasswordPayload,
  { rejectValue: string }
>('settings/changePassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await settingsAPI.changePassword(payload);
    const message =
      typeof response.data?.message === 'string' && response.data.message.trim().length > 0
        ? response.data.message
        : 'Password updated successfully';
    return { message };
  } catch (error) {
    return rejectWithValue(extractApiErrorMessage(error, 'Failed to update password'));
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    clearSettingsError: (state) => {
      state.error = null;
    },
    clearPasswordStatus: (state) => {
      state.passwordError = null;
      state.passwordUpdateSuccess = false;
      state.passwordMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.privacy = action.payload.privacy;
        state.preferences = action.payload.preferences;
        state.profile = action.payload.profile;
        state.privacySettings = action.payload.privacy;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch settings';
        state.privacySettings = state.privacy;
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.updateSuccess = true;
        state.privacy = action.payload.privacy;
        state.preferences = action.payload.preferences;
        state.profile = action.payload.profile;
        state.privacySettings = action.payload.privacy;
      })
      .addCase(updateSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update settings';
        state.updateSuccess = false;
      })
      .addCase(fetchPrivacySettings.fulfilled, (state, action) => {
        state.privacy = action.payload;
        state.privacySettings = action.payload;
      })
      .addCase(fetchPrivacySettings.rejected, (state, action) => {
        state.error = action.payload || state.error;
      })
      .addCase(updatePrivacySettings.fulfilled, (state, action) => {
        state.privacy = action.payload;
        state.privacySettings = action.payload;
        state.updateSuccess = true;
      })
      .addCase(updatePrivacySettings.rejected, (state, action) => {
        state.error = action.payload || state.error;
        state.updateSuccess = false;
      })
      .addCase(changePassword.pending, (state) => {
        state.passwordLoading = true;
        state.passwordError = null;
        state.passwordUpdateSuccess = false;
        state.passwordMessage = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = null;
        state.passwordUpdateSuccess = true;
        state.passwordMessage = action.payload.message;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordLoading = false;
        state.passwordError = action.payload || 'Failed to update password';
        state.passwordUpdateSuccess = false;
      });
  },
});

export const { clearUpdateSuccess, clearSettingsError, clearPasswordStatus } = settingsSlice.actions;
export default settingsSlice.reducer;
