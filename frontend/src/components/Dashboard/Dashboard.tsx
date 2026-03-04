import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboard } from '../../store/dashboardSlice';
import { fetchNotifications, markNotificationRead } from '../../store/notificationsSlice';
import { fetchSettings } from '../../store/settingsSlice';
import { BadgeAward, GoalProgress, NotificationItem } from '../../types';
import LogActivityModal from '../Activity/LogActivityModal';

const DASHBOARD_REFRESH_INTERVAL_MS = 30000;
const RING_CIRCUMFERENCE = 175.9;

type WeeklyEntry = {
  id: string;
  label: string;
  minutes: number;
};

type ActiveGoalCardData = {
  goal: GoalProgress;
  progressPercent: number;
  orderIndex: number;
};

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/goals', label: 'Goals', icon: 'track_changes' },
  { to: '/analytics', label: 'Statistics', icon: 'bar_chart' },
  { to: '/badges', label: 'Badges', icon: 'workspace_premium' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayLabel = (typeof dayOrder)[number];
const accentPalette = ['#3B82F6', '#22C55E', '#F97316', '#895AF6'];

const activityTone = [
  { icon: 'check_circle', iconBg: 'bg-blue-100 text-blue-600' },
  { icon: 'military_tech', iconBg: 'bg-[rgba(var(--ff-primary-rgb),0.12)] text-[var(--ff-primary)]' },
  { icon: 'add_task', iconBg: 'bg-emerald-100 text-emerald-600' },
] as const;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const formatDisplayDate = (value: string) => {
  try {
    return format(new Date(value), 'MMM d, yyyy');
  } catch {
    return value;
  }
};

const formatDisplayTime = (value: string) => {
  try {
    return format(new Date(value), 'h:mm a');
  } catch {
    return value;
  }
};

const getInitials = (value?: string | null) => {
  if (!value) {
    return 'FF';
  }

  const parts = value.split(/[\s@._-]+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) {
    return 'FF';
  }

  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
};

const weekdayAliases: Record<string, DayLabel> = {
  mon: 'Mon',
  monday: 'Mon',
  tue: 'Tue',
  tues: 'Tue',
  tuesday: 'Tue',
  wed: 'Wed',
  weds: 'Wed',
  wednesday: 'Wed',
  thu: 'Thu',
  thur: 'Thu',
  thurs: 'Thu',
  thursday: 'Thu',
  fri: 'Fri',
  friday: 'Fri',
  sat: 'Sat',
  saturday: 'Sat',
  sun: 'Sun',
  sunday: 'Sun',
};

const toMinutes = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.round(parsed));
};

const getTodayWeekdayLabel = (): DayLabel => dayOrder[(new Date().getDay() + 6) % 7];

const normalizeWeekdayLabel = (label: string): DayLabel | null => {
  const trimmed = (label || '').trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.toLowerCase();
  const direct = weekdayAliases[normalized];
  if (direct) {
    return direct;
  }

  const alphaOnly = normalized.replace(/[^a-z]/g, '');
  if (alphaOnly.length >= 3) {
    const shortened = weekdayAliases[alphaOnly.slice(0, 3)];
    if (shortened) {
      return shortened;
    }
  }

  const parsedDate = new Date(trimmed);
  if (!Number.isNaN(parsedDate.getTime())) {
    return dayOrder[(parsedDate.getDay() + 6) % 7];
  }

  return null;
};

const normalizeWeeklySeries = (input: unknown): WeeklyEntry[] => {
  if (Array.isArray(input)) {
    return input.map((entry, index) => {
      const safe = typeof entry === 'object' && entry !== null ? (entry as Record<string, unknown>) : {};
      const labelCandidate = String(safe.label ?? safe.day ?? safe.date ?? `Day ${index + 1}`);
      const minutesCandidate = safe.minutes ?? safe.value ?? safe.total ?? safe.totalMinutes ?? 0;
      return {
        id: `${labelCandidate}-${index}`,
        label: labelCandidate,
        minutes: toMinutes(minutesCandidate),
      };
    });
  }

  if (!input || typeof input !== 'object') {
    return [];
  }

  return Object.entries(input as Record<string, unknown>).map(([label, minutes], index) => ({
    id: `${label}-${index}`,
    label,
    minutes: toMinutes(minutes),
  }));
};

const buildWeeklyBars = (entries: WeeklyEntry[]): WeeklyEntry[] => {
  const minutesByDay = new Map<DayLabel, number>(dayOrder.map((day) => [day, 0]));

  entries.forEach((entry) => {
    const day = normalizeWeekdayLabel(entry.label);
    if (!day) {
      return;
    }
    minutesByDay.set(day, toMinutes(entry.minutes));
  });

  return dayOrder.map((day) => ({
    id: day,
    label: day,
    minutes: minutesByDay.get(day) ?? 0,
  }));
};

const withAlpha = (color: string, alpha: number) => {
  const normalized = (color || '').trim();
  const hexMatch = normalized.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

  if (hexMatch) {
    const hex = hexMatch[1];
    const expanded = hex.length === 3 ? hex.split('').map((char) => `${char}${char}`).join('') : hex;
    const r = Number.parseInt(expanded.slice(0, 2), 16);
    const g = Number.parseInt(expanded.slice(2, 4), 16);
    const b = Number.parseInt(expanded.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return normalized || `rgba(137, 90, 246, ${alpha})`;
};

const getGoalProgressPercent = (goal: GoalProgress) =>
  Math.max(0, Math.min(100, Math.round((goal.todayProgress / Math.max(goal.dailyTarget, 1)) * 100)));

const getGoalActivityScore = (goal: GoalProgress, progressPercent: number) => {
  const streakScore = (Math.min(goal.currentStreak, 14) / 14) * 30;
  const trackScore = goal.atRisk ? -8 : 8;
  const completionBonus = goal.completedToday ? 12 : 0;
  const blended = progressPercent * 0.58 + streakScore + trackScore + completionBonus;
  return Math.max(0, Math.min(100, Math.round(blended)));
};

const getGoalRingColor = (goal: GoalProgress, progressPercent: number, activityScore: number) => {
  if (goal.completedToday || progressPercent >= 100) return '#22c55e';
  if (progressPercent <= 0) return '#ef4444';
  if (activityScore >= 75) return '#3b82f6';
  if (activityScore >= 55) return '#0ea5e9';
  if (activityScore >= 35) return '#14b8a6';
  return '#f59e0b';
};

const getGoalGlyph = (category: string) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('code') || normalized.includes('program')) return 'code';
  if (normalized.includes('study') || normalized.includes('learn')) return 'school';
  if (normalized.includes('fit') || normalized.includes('health')) return 'fitness_center';
  return 'track_changes';
};

const isActiveNav = (pathname: string, to: string) =>
  pathname === to || (to !== '/dashboard' && pathname.startsWith(to));

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state: RootState) => state.auth);
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  const { notifications, unreadCount, loading: notificationsLoading, error: notificationsError } = useSelector(
    (state: RootState) => state.notifications
  );

  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalProgress | null>(null);
  const [selectedWeeklyId, setSelectedWeeklyId] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<number | null>(null);

  const refreshDashboard = useCallback(
    async (silent = false) => {
      if (!silent) {
        setRefreshing(true);
      }

      const results = await Promise.allSettled([
        dispatch(fetchDashboard()).unwrap(),
        dispatch(fetchNotifications()).unwrap(),
      ]);

      const hasFailure = results.some((result) => result.status === 'rejected');
      if (hasFailure) {
        setStatusMessage('Some dashboard sections failed to refresh.');
      } else if (!silent) {
        setStatusMessage('Dashboard synced successfully.');
      }

      if (!silent) {
        setRefreshing(false);
      }
    },
    [dispatch]
  );

  const openAlerts = useCallback(() => {
    setAlertsOpen(true);
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkNotificationRead = useCallback(
    async (notificationId: number) => {
      setMarkingNotificationId(notificationId);
      try {
        await dispatch(markNotificationRead(notificationId)).unwrap();
        setStatusMessage('Alert marked as read.');
      } catch {
        setStatusMessage('Unable to mark alert as read right now.');
      } finally {
        setMarkingNotificationId(null);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    refreshDashboard(true);

    const timerId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshDashboard(true);
      }
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [refreshDashboard]);

  useEffect(() => {
    if (!statusMessage) {
      return;
    }

    const timer = window.setTimeout(() => setStatusMessage(null), 3400);
    return () => window.clearTimeout(timer);
  }, [statusMessage]);

  const weeklySeries = useMemo(() => normalizeWeeklySeries(data?.weeklyProgress || {}), [data?.weeklyProgress]);
  const weeklyBars = useMemo(() => buildWeeklyBars(weeklySeries), [weeklySeries]);
  const maxWeeklyMinutes = useMemo(
    () => (weeklyBars.length ? Math.max(...weeklyBars.map((entry) => entry.minutes), 1) : 1),
    [weeklyBars]
  );

  const selectedWeekPoint = useMemo(() => {
    if (weeklyBars.length === 0) {
      return null;
    }

    if (selectedWeeklyId) {
      const selectedPoint = weeklyBars.find((point) => point.id === selectedWeeklyId);
      if (selectedPoint) {
        return selectedPoint;
      }
    }

    const todayLabel = getTodayWeekdayLabel();
    return weeklyBars.find((point) => point.id === todayLabel) || weeklyBars[weeklyBars.length - 1];
  }, [weeklyBars, selectedWeeklyId]);

  const activeGoalCards = useMemo<ActiveGoalCardData[]>(
    () =>
      (data?.activeGoals || []).map((goal, orderIndex) => {
        const progressPercent = getGoalProgressPercent(goal);
        return { goal, progressPercent, orderIndex };
      }),
    [data?.activeGoals]
  );

  const prioritizedGoals = useMemo(
    () =>
      [...activeGoalCards].sort((a, b) => {
        const atRiskDiff = Number(b.goal.atRisk) - Number(a.goal.atRisk);
        if (atRiskDiff !== 0) return atRiskDiff;

        const completionDiff = Number(a.goal.completedToday) - Number(b.goal.completedToday);
        if (completionDiff !== 0) return completionDiff;

        return a.progressPercent - b.progressPercent;
      }),
    [activeGoalCards]
  );

  const prioritizedNotifications = useMemo<NotificationItem[]>(
    () => [...notifications].sort((a, b) => Number(a.isRead) - Number(b.isRead)).slice(0, 8),
    [notifications]
  );

  useEffect(() => {
    if (weeklyBars.length === 0) {
      if (selectedWeeklyId !== null) {
        setSelectedWeeklyId(null);
      }
      return;
    }

    if (!selectedWeeklyId || !weeklyBars.some((point) => point.id === selectedWeeklyId)) {
      const todayLabel = getTodayWeekdayLabel();
      const fallbackId = weeklyBars.some((point) => point.id === todayLabel)
        ? todayLabel
        : weeklyBars[weeklyBars.length - 1].id;
      setSelectedWeeklyId(fallbackId);
    }
  }, [weeklyBars, selectedWeeklyId]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileNavOpen(false);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[var(--ff-bg)] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--ff-primary)]" />
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Loading your dashboard</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Preparing goals, streaks, and activity insights.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[var(--ff-bg)] px-4 py-10">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-red-600">{error || 'Unable to fetch dashboard data right now.'}</p>
          <button type="button" className="btn-primary mt-5" onClick={() => refreshDashboard(false)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalTodayProgress = (data.activeGoals || []).reduce((sum, goal) => sum + Math.max(goal.todayProgress || 0, 0), 0);
  const totalDailyTarget = (data.activeGoals || []).reduce((sum, goal) => sum + Math.max(goal.dailyTarget || 0, 0), 0);
  const dailyGoalPercent =
    totalDailyTarget > 0 ? Math.max(0, Math.min(100, Math.round((totalTodayProgress / totalDailyTarget) * 100))) : 0;
  const displayName = user?.username || data.username || 'Alex';
  const latestBadge = data.recentBadges[0];
  const primaryGoals = prioritizedGoals.slice(0, 2);
  const todayLabel = getTodayWeekdayLabel();
  const todayIndex = weeklyBars.findIndex((bar) => bar.id === todayLabel);
  const currentDayMinutes = todayIndex >= 0 ? weeklyBars[todayIndex].minutes : 0;
  const previousDayMinutes = todayIndex > 0 ? weeklyBars[todayIndex - 1].minutes : 0;
  const trendPercent =
    todayIndex > 0 ? Math.round(((currentDayMinutes - previousDayMinutes) / Math.max(previousDayMinutes, 1)) * 100) : 0;
  const trendLabel = `${trendPercent >= 0 ? '+' : ''}${trendPercent}% this week`;
  const completingSoon = prioritizedGoals.filter((entry) => entry.progressPercent >= 80 && !entry.goal.completedToday).length;

  return (
    <div className="min-h-screen bg-[var(--ff-bg)] text-slate-900 dark:text-slate-100 [font-family:'Plus_Jakarta_Sans',sans-serif]">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:flex dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 p-6">
            <div className="rounded-lg bg-[var(--ff-primary)] p-2">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path
                  clipRule="evenodd"
                  d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                  fill="currentColor"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--ff-primary)]">FocusForge</h2>
          </div>

          <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-4 pb-4">
            {navItems.map((item) => {
              const active = isActiveNav(location.pathname, item.to);

              return (
                <button
                  key={item.to}
                  type="button"
                  onClick={() => navigate(item.to)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                    active
                      ? 'bg-[rgba(var(--ff-primary-rgb),0.1)] font-semibold text-[var(--ff-primary)]'
                      : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-6">
            <div className="rounded-xl bg-slate-100 p-4 dark:bg-slate-800">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(var(--ff-primary-rgb),0.2)]">
                  <span className="material-symbols-outlined text-[var(--ff-primary)]">notifications</span>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Alerts</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{unreadCount} Unread</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openAlerts}
                className="w-full rounded-lg bg-white py-2 text-xs font-bold text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100"
              >
                View All
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-[var(--ff-bg)]/95 px-4 py-3 backdrop-blur lg:hidden dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <button type="button" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--ff-primary)] text-white">
                  <span className="material-symbols-outlined text-lg">diamond</span>
                </span>
                <span className="text-lg font-bold tracking-tight text-[var(--ff-primary)]">FocusForge</span>
              </button>

              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                aria-label="Toggle navigation"
                onClick={() => setMobileNavOpen((open) => !open)}
              >
                <span className="material-symbols-outlined">{mobileNavOpen ? 'close' : 'menu'}</span>
              </button>
            </div>
          </header>

          {mobileNavOpen && (
            <div className="border-b border-slate-200 bg-white px-4 pb-4 pt-2 lg:hidden dark:border-slate-800 dark:bg-slate-900">
              <nav className="grid gap-1.5">
                {navItems.map((item) => {
                  const active = isActiveNav(location.pathname, item.to);

                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => handleNavigate(item.to)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-[rgba(var(--ff-primary-rgb),0.1)] text-[var(--ff-primary)]'
                          : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="material-symbols-outlined">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>

              <button
                type="button"
                onClick={() => {
                  setMobileNavOpen(false);
                  openAlerts();
                }}
                className="mt-3 w-full rounded-xl bg-[rgba(var(--ff-primary-rgb),0.12)] px-3 py-2 text-sm font-bold text-[var(--ff-primary)]"
              >
                Alerts - {unreadCount} unread
              </button>
            </div>
          )}

          <main className="flex-1 overflow-y-auto bg-[var(--ff-bg)] p-4 sm:p-6 lg:p-8">
            {statusMessage && (
              <div className="mb-4 rounded-xl border border-[rgba(var(--ff-primary-rgb),0.2)] bg-[rgba(var(--ff-primary-rgb),0.12)] px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {statusMessage}
              </div>
            )}

            <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{getGreeting()}, {displayName}</h1>
                <p className="text-slate-500 font-medium dark:text-slate-400">
                  Keep up the momentum! You&apos;re {dailyGoalPercent}% through your daily goal.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => refreshDashboard(false)}
                  disabled={refreshing}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-900 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-xl">refresh</span>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </button>
                <div className="h-12 w-12 rounded-full border-2 border-[var(--ff-primary)] p-0.5">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                    {getInitials(user?.username || user?.email || data.username)}
                  </div>
                </div>
              </div>
            </header>

            <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--ff-primary)] to-[#a885f8] p-6 text-white shadow-lg shadow-[rgba(var(--ff-primary-rgb),0.2)]">
                <div className="relative z-10">
                  <p className="mb-1 font-medium text-white/85">Total Points</p>
                  <h3 className="mb-4 text-3xl font-extrabold">{data.totalPoints.toLocaleString()}</h3>
                  <div className="flex w-fit items-center gap-2 rounded-lg bg-white/20 px-2 py-1 text-sm">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    <span>{trendLabel}</span>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-white/10">stars</span>
              </article>

              <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 font-medium text-slate-500 dark:text-slate-400">Global Streak</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.globalStreak} Days</h3>
                    <p className="mt-2 text-sm font-bold text-orange-500">
                      {data.globalStreak > 0 ? 'Personal Record! ??' : 'Build your streak'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-orange-100 p-3 dark:bg-orange-900/30">
                    <span className="material-symbols-outlined text-orange-600">local_fire_department</span>
                  </div>
                </div>
              </article>

              <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="mb-1 font-medium text-slate-500 dark:text-slate-400">Active Goals</p>
                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">{data.activeGoals.length} Active</h3>
                    <p className="mt-2 text-sm font-bold text-[var(--ff-primary)]">{completingSoon} completing soon</p>
                  </div>
                  <div className="rounded-xl bg-[rgba(var(--ff-primary-rgb),0.12)] p-3">
                    <span className="material-symbols-outlined text-[var(--ff-primary)]">target</span>
                  </div>
                </div>
              </article>
            </section>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <section className="space-y-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Goals</h2>
                  <button type="button" onClick={() => navigate('/goals')} className="text-sm font-bold text-[var(--ff-primary)] hover:underline">
                    See all goals
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {primaryGoals.map((entry) => {
                    const { goal, progressPercent, orderIndex } = entry;
                    const categoryColor = goal.categoryColor || accentPalette[orderIndex % accentPalette.length];
                    const activityScore = getGoalActivityScore(goal, progressPercent);
                    const ringColor = getGoalRingColor(goal, progressPercent, activityScore);
                    const dashOffset = RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * progressPercent) / 100;
                    const score = Math.round(progressPercent * 9 + goal.currentStreak * 13);

                    return (
                      <article
                        key={goal.goalId}
                        className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                      >
                        <div className="mb-6 flex items-start justify-between">
                          <div
                            className="rounded-xl p-3"
                            style={{
                              background: withAlpha(categoryColor, 0.16),
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ color: categoryColor }}>
                              {getGoalGlyph(goal.category)}
                            </span>
                          </div>

                          <div className="relative h-16 w-16">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
                              <circle className="text-slate-200 dark:text-slate-700" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="6" />
                              <circle
                                cx="32"
                                cy="32"
                                fill="transparent"
                                r="28"
                                stroke={ringColor}
                                strokeDasharray={RING_CIRCUMFERENCE}
                                strokeDashoffset={dashOffset}
                                strokeWidth="6"
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{progressPercent}%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                          <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">Current Score: {score}xp</p>
                          <button
                            type="button"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ff-primary)] py-3 font-bold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={goal.completedToday}
                            onClick={() => setSelectedGoal(goal)}
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            {goal.completedToday ? 'Completed Today' : 'Log Activity'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Progress</h2>
                    <div className="flex gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-[var(--ff-primary)]" />
                        Minutes Logged
                      </span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="flex min-w-[520px] items-end justify-between px-4 pb-8">
                      {weeklyBars.map((bar) => {
                        const heightPercent = Math.max(12, Math.round((bar.minutes / maxWeeklyMinutes) * 100));
                        const isSelected = bar.id === selectedWeekPoint?.id;

                        return (
                          <button
                            key={bar.id}
                            type="button"
                            onClick={() => setSelectedWeeklyId(bar.id)}
                            className="group relative w-10"
                          >
                            <div
                              className={`relative h-48 rounded-t-lg ${
                                isSelected
                                  ? 'bg-[var(--ff-primary)]'
                                  : 'bg-slate-100 dark:bg-slate-800'
                              }`}
                              style={{ height: `${Math.max(20, Math.round((heightPercent / 100) * 192))}px` }}
                            >
                              {!isSelected && (
                                <div className="absolute inset-0 h-full rounded-t-lg bg-[var(--ff-primary)] opacity-20 transition-all group-hover:opacity-40" />
                              )}
                              <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white group-hover:block">
                                {bar.minutes}m
                              </div>
                            </div>
                            <p
                              className={`absolute top-full left-1/2 mt-2 -translate-x-1/2 text-xs ${
                                isSelected
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'font-medium text-slate-400'
                              }`}
                            >
                              {bar.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedWeekPoint && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {selectedWeekPoint.label}: {selectedWeekPoint.minutes} minutes logged.
                    </p>
                  )}
                </article>
              </section>

              <aside className="space-y-6">
                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Badge Momentum</h2>

                  {latestBadge ? (
                    <div className="flex items-center gap-4 rounded-xl border border-[rgba(var(--ff-primary-rgb),0.1)] bg-[rgba(var(--ff-primary-rgb),0.05)] p-4">
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-lg shadow-orange-500/20">
                        <span className="material-symbols-outlined text-3xl text-white">emoji_events</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{latestBadge.name}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Earned 2 hours ago</p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                          <div className="h-full w-2/3 bg-[var(--ff-primary)]" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No badges earned yet.</p>
                  )}

                  <button type="button" onClick={() => navigate('/badges')} className="mt-4 w-full text-xs font-bold text-[var(--ff-primary)] hover:underline">
                    View Badge Collection
                  </button>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="mb-6 text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>

                  <div className="space-y-6">
                    {data.recentActivities.slice(0, 3).map((activity, index) => {
                      const tone = activityTone[index] || activityTone[activityTone.length - 1];
                      const title = index === 0 ? 'Coding session logged' : index === 1 ? 'Milestone Reached' : 'Goal Created';
                      const subtitle =
                        index === 0
                          ? `${activity.minutes} mins in ${activity.goalTitle}`
                          : index === 1
                            ? `${Math.max(1, Math.round(activity.minutes / 60))} hours total focus time`
                            : `"${activity.goalTitle}" started`;

                      const dateText =
                        index === 0
                          ? formatDisplayTime(activity.date)
                          : index === 1
                            ? 'Yesterday'
                            : formatDisplayDate(activity.date);

                      return (
                        <div key={activity.id} className="flex gap-4">
                          <div className="relative">
                            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.iconBg}`}>
                              <span className="material-symbols-outlined text-sm">{tone.icon}</span>
                            </div>
                            {index < 2 && (
                              <div className="absolute left-1/2 top-8 h-10 w-0.5 -translate-x-1/2 bg-slate-100 dark:bg-slate-800" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{dateText}</p>
                          </div>
                        </div>
                      );
                    })}

                    {data.recentActivities.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No activity logged yet.</p>}
                  </div>
                </article>
              </aside>
            </div>
          </main>
        </div>
      </div>

      {alertsOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/45 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alerts</h2>
              <button type="button" className="btn-ghost" onClick={() => setAlertsOpen(false)}>
                Close
              </button>
            </div>

            {notificationsLoading && notifications.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading alerts...</p>
            ) : notificationsError ? (
              <p className="text-sm text-red-600">{notificationsError}</p>
            ) : prioritizedNotifications.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">You have no alerts right now.</p>
            ) : (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                {prioritizedNotifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`rounded-xl border p-3 ${
                      notification.isRead
                        ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800'
                        : 'border-[rgba(var(--ff-primary-rgb),0.45)] bg-[rgba(var(--ff-primary-rgb),0.08)]'
                    }`}
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{notification.title || 'Alert'}</p>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{notification.message}</p>
                    <p className="mt-2 text-[11px] text-slate-400">{formatDisplayDate(notification.createdAt)}</p>

                    {!notification.isRead && (
                      <button
                        type="button"
                        className="btn-secondary mt-3"
                        disabled={markingNotificationId === notification.id}
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        {markingNotificationId === notification.id ? '...' : 'Mark read'}
                      </button>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedGoal && (
        <LogActivityModal
          goalId={selectedGoal.goalId}
          goalTitle={selectedGoal.title}
          dailyTarget={selectedGoal.dailyTarget}
          onBadgesEarned={(badges: BadgeAward[]) => {
            if (badges.length > 0) {
              setStatusMessage(`Unlocked ${badges.length} new badge${badges.length > 1 ? 's' : ''}.`);
            }
            refreshDashboard(true);
          }}
          onClose={() => {
            setSelectedGoal(null);
            refreshDashboard(true);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
