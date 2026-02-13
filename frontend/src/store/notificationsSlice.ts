import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { extractApiErrorMessage, notificationAPI } from '../services/api';
import { NotificationItem, NotificationPreferences } from '../types';

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  preferences: NotificationPreferences;
  loading: boolean;
  error: string | null;
}

interface NotificationsResponse {
  notifications: NotificationItem[];
  unreadCount: number;
}

const NOTIFICATION_PREFERENCES_KEY = 'focusforge.notificationPreferences';

const defaultPreferences: NotificationPreferences = {
  emailReminders: true,
  weeklySummary: true,
  pushEnabled: true,
};

const loadNotificationPreferences = (): NotificationPreferences => {
  const raw = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
  if (!raw) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      emailReminders:
        typeof parsed.emailReminders === 'boolean'
          ? parsed.emailReminders
          : defaultPreferences.emailReminders,
      weeklySummary:
        typeof parsed.weeklySummary === 'boolean' ? parsed.weeklySummary : defaultPreferences.weeklySummary,
      pushEnabled:
        typeof parsed.pushEnabled === 'boolean' ? parsed.pushEnabled : defaultPreferences.pushEnabled,
    };
  } catch {
    return defaultPreferences;
  }
};

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  preferences: loadNotificationPreferences(),
  loading: false,
  error: null,
};

export const fetchNotifications = createAsyncThunk<NotificationsResponse, void, { rejectValue: string }>(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationAPI.getMyNotifications();
      const notifications = Array.isArray(response.data?.notifications) ? response.data.notifications : [];
      const unreadCount = Number(response.data?.unreadCount || 0);
      return { notifications, unreadCount };
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to load notifications'));
    }
  }
);

export const markAsRead = createAsyncThunk<number, number, { rejectValue: string }>(
  'notifications/markAsRead',
  async (id, { rejectWithValue }) => {
    try {
      await notificationAPI.markAsRead(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractApiErrorMessage(error, 'Failed to mark notification as read'));
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    updatePreferences: (state, action) => {
      const merged = {
        ...state.preferences,
        ...(action.payload as Partial<NotificationPreferences>),
      };
      state.preferences = merged;
      localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(merged));
    },
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = Number(action.payload.unreadCount || 0);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load notifications';
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((item) => item.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.error = action.payload || state.error;
      });
  },
});

export const { updatePreferences, clearNotificationsError } = notificationsSlice.actions;
export const markNotificationRead = markAsRead;
export default notificationsSlice.reducer;
