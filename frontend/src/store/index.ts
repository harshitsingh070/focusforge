import { configureStore } from '@reduxjs/toolkit';
import activityReducer from './activitySlice';
import analyticsReducer from './analyticsSlice';
import authReducer from './authSlice';
import badgesReducer from './badgesSlice';
import dashboardReducer from './dashboardSlice';
import enhancedLeaderboardReducer from './enhancedLeaderboardSlice';
import goalsReducer from './goalsSlice';
import leaderboardReducer from './leaderboardSlice';
import notificationsReducer from './notificationsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    goals: goalsReducer,
    dashboard: dashboardReducer,
    activity: activityReducer,
    leaderboard: leaderboardReducer,
    badges: badgesReducer,
    analytics: analyticsReducer,
    settings: settingsReducer,
    notifications: notificationsReducer,
    enhancedLeaderboard: enhancedLeaderboardReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/signup/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
