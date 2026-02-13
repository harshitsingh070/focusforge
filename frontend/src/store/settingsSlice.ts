import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiErrorMessage, settingsAPI } from '../services/api';
import {
  PrivacySettings,
  ProfileSettingsData,
  SettingsPayload,
  UserPreferences,
} from '../types';

interface SettingsState {
  privacy: PrivacySettings;
  preferences: UserPreferences;
  profile: ProfileSettingsData;
  privacySettings: PrivacySettings | null;
  loading: boolean;
  error: string | null;
  updateSuccess: boolean;
}

interface SettingsResponse {
  privacy: PrivacySettings;
  preferences: UserPreferences;
  profile: ProfileSettingsData;
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
};

export const fetchSettings = createAsyncThunk<SettingsResponse, void, { rejectValue: string }>(
  'settings/fetchSettings',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await settingsAPI.getPrivacySettings();
      const privacy = normalizePrivacySettings(response.data?.privacySettings);
      const preferences = normalizePreferences(
        safeJsonParse(localStorage.getItem(SETTINGS_PREFERENCES_KEY), defaultPreferences)
      );
      const storedProfile = normalizeProfile(safeJsonParse(localStorage.getItem(SETTINGS_PROFILE_KEY), defaultProfile));
      const authUser = hydrateUserFromAuthState(getState());

      const profile = normalizeProfile({
        ...storedProfile,
        username: storedProfile.username || authUser.username,
        email: storedProfile.email || authUser.email,
      });

      return { privacy, preferences, profile };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to fetch settings'));
    }
  }
);

export const updateSettings = createAsyncThunk<SettingsResponse, SettingsPayload, { rejectValue: string }>(
  'settings/updateSettings',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const current = (getState() as { settings: SettingsState }).settings;

      const mergedPrivacy = normalizePrivacySettings(payload.privacy || current.privacy);
      const mergedPreferences = normalizePreferences(payload.preferences || current.preferences);
      const mergedProfile = normalizeProfile(payload.profile || current.profile);

      await settingsAPI.updatePrivacySettings(mergedPrivacy);

      localStorage.setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(mergedPreferences));
      localStorage.setItem(SETTINGS_PROFILE_KEY, JSON.stringify(mergedProfile));

      return {
        privacy: mergedPrivacy,
        preferences: mergedPreferences,
        profile: mergedProfile,
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
      });
  },
});

export const { clearUpdateSuccess, clearSettingsError } = settingsSlice.actions;
export default settingsSlice.reducer;
