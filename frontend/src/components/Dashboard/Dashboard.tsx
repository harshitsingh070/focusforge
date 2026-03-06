import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboard } from '../../store/dashboardSlice';
import { fetchNotifications, markNotificationRead } from '../../store/notificationsSlice';
import { fetchSettings } from '../../store/settingsSlice';
import { Badge, GoalProgress, NotificationItem } from '../../types';
import LogActivityModal from '../Activity/LogActivityModal';

const DASHBOARD_REFRESH_INTERVAL_MS = 30000;
const MAX_DASHBOARD_GOALS = 3;

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/goals', label: 'Goals', icon: 'track_changes' },
  { to: '/analytics', label: 'Statistics', icon: 'monitoring' },
  { to: '/badges', label: 'Badges', icon: 'military_tech' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayLabel = (typeof dayOrder)[number];
type WeeklyBar = { id: DayLabel; label: DayLabel; minutes: number };
type DayVisitSummary = { visits: number; lastVisitedAt: string | null };

const fallbackGoalColors = ['#8B5CF6', '#7C3AED', '#3B82F6', '#22C55E'];

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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toMinutes = (value: unknown) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }
  return Math.max(0, Math.round(parsed));
};

const normalizeWeekdayLabel = (value: string): DayLabel | null => {
  const normalized = (value || '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  if (weekdayAliases[normalized]) {
    return weekdayAliases[normalized];
  }

  const lettersOnly = normalized.replace(/[^a-z]/g, '');
  if (lettersOnly.length >= 3 && weekdayAliases[lettersOnly.slice(0, 3)]) {
    return weekdayAliases[lettersOnly.slice(0, 3)];
  }

  const parsedDate = new Date(value);
  if (!Number.isNaN(parsedDate.getTime())) {
    return dayOrder[(parsedDate.getDay() + 6) % 7];
  }

  return null;
};

const buildWeeklyBars = (weeklyProgress: Record<string, number> | undefined): WeeklyBar[] => {
  const minutesByDay = new Map<DayLabel, number>(dayOrder.map((day) => [day, 0]));

  Object.entries(weeklyProgress || {}).forEach(([rawDay, rawMinutes]) => {
    const day = normalizeWeekdayLabel(rawDay);
    if (!day) {
      return;
    }
    minutesByDay.set(day, toMinutes(rawMinutes));
  });

  return dayOrder.map((day) => ({
    id: day,
    label: day,
    minutes: minutesByDay.get(day) ?? 0,
  }));
};

const getTodayLabel = (): DayLabel => dayOrder[(new Date().getDay() + 6) % 7];

const getInitials = (value: string) => {
  const tokens = (value || '')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (tokens.length === 0) {
    return 'FF';
  }

  return tokens.map((token) => token[0]?.toUpperCase() || '').join('');
};

const getRelativeTime = (value?: string) => {
  if (!value) {
    return 'Recently';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recently';
  }

  return formatDistanceToNowStrict(parsed, { addSuffix: true });
};

const formatVisitTime = (value: string | null) => {
  if (!value) {
    return 'No visit recorded';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'No visit recorded';
  }

  return format(parsed, 'h:mm a');
};

const formatDateTime = (value?: string) => {
  if (!value) {
    return 'Unknown time';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown time';
  }

  return format(parsed, 'MMM d, yyyy h:mm a');
};

const toSortTime = (value?: string) => {
  const parsed = Date.parse(value || '');
  return Number.isFinite(parsed) ? parsed : 0;
};

const getProgressPercent = (goal: GoalProgress) => {
  const safeTarget = Math.max(Number(goal.dailyTarget) || 0, 0);
  const safeProgress = Math.max(Number(goal.todayProgress) || 0, 0);

  if (safeTarget <= 0) {
    return goal.completedToday ? 100 : 0;
  }

  return clamp(Math.round((safeProgress / safeTarget) * 100), 0, 100);
};

const getBadgeProgressPercent = (badge?: Badge) => {
  if (!badge) {
    return 70;
  }

  if (Number.isFinite(badge.progressPercentage)) {
    return clamp(Math.round(Number(badge.progressPercentage)), 0, 100);
  }

  if (Number.isFinite(badge.requiredValue) && Number(badge.requiredValue) > 0) {
    const current = Number.isFinite(badge.currentValue) ? Number(badge.currentValue) : 0;
    return clamp(Math.round((current / Number(badge.requiredValue)) * 100), 0, 100);
  }

  return 70;
};

const getBadgeUnlockLabel = (badge: Badge | undefined, totalPoints: number) => {
  if (!badge) {
    return 'Unlock in 2,550 points';
  }

  const earnedAt = badge.awardedAt || badge.earnedAt;
  if (earnedAt) {
    return `Earned ${getRelativeTime(earnedAt)}`;
  }

  if (Number.isFinite(badge.requiredValue) && Number(badge.requiredValue) > 0) {
    const current = Number.isFinite(badge.currentValue) ? Number(badge.currentValue) : totalPoints;
    const remaining = Math.max(0, Math.round(Number(badge.requiredValue) - current));
    return `Unlock in ${remaining.toLocaleString()} points`;
  }

  return 'Unlock in 2,550 points';
};

const isActiveNav = (pathname: string, route: string) =>
  pathname === route || (route !== '/dashboard' && pathname.startsWith(route));

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state: RootState) => state.auth);
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  const { notifications, unreadCount, loading: notificationsLoading, error: notificationsError } = useSelector(
    (state: RootState) => state.notifications
  );

  const [selectedGoal, setSelectedGoal] = useState<GoalProgress | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hoveredWeeklyId, setHoveredWeeklyId] = useState<DayLabel | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<number | null>(null);

  const refreshDashboard = useCallback(() => {
    dispatch(fetchDashboard());
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    refreshDashboard();
    const timerId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshDashboard();
      }
    }, DASHBOARD_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(timerId);
  }, [refreshDashboard]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const weeklyBars = useMemo(() => buildWeeklyBars(data?.weeklyProgress), [data?.weeklyProgress]);
  const visitSummaryByDay = useMemo<Record<DayLabel, DayVisitSummary>>(() => {
    const summary = dayOrder.reduce<Record<DayLabel, DayVisitSummary>>((acc, day) => {
      acc[day] = { visits: 0, lastVisitedAt: null };
      return acc;
    }, {} as Record<DayLabel, DayVisitSummary>);

    (data?.recentActivities || []).forEach((activity) => {
      const parsed = new Date(activity.date);
      if (Number.isNaN(parsed.getTime())) {
        return;
      }

      const day = dayOrder[(parsed.getDay() + 6) % 7];
      const current = summary[day];
      const currentTimestamp = current.lastVisitedAt ? Date.parse(current.lastVisitedAt) : 0;
      const parsedTimestamp = parsed.getTime();

      summary[day] = {
        visits: current.visits + 1,
        lastVisitedAt: parsedTimestamp > currentTimestamp ? parsed.toISOString() : current.lastVisitedAt,
      };
    });

    return summary;
  }, [data?.recentActivities]);
  const prioritizedGoals = useMemo(
    () =>
      [...(data?.activeGoals || [])].sort((a, b) => {
        const completionDiff = Number(a.completedToday) - Number(b.completedToday);
        if (completionDiff !== 0) {
          return completionDiff;
        }

        return getProgressPercent(b) - getProgressPercent(a);
      }),
    [data?.activeGoals]
  );
  const prioritizedNotifications = useMemo<NotificationItem[]>(
    () =>
      [...notifications]
        .sort((a, b) => {
          const readDiff = Number(a.isRead) - Number(b.isRead);
          if (readDiff !== 0) {
            return readDiff;
          }
          return toSortTime(b.createdAt) - toSortTime(a.createdAt);
        })
        .slice(0, 12),
    [notifications]
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
      } finally {
        setMarkingNotificationId(null);
      }
    },
    [dispatch]
  );

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ff-bg)] px-4 text-[var(--ff-text-900)]">
        <div className="w-full max-w-md rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-8 text-center shadow-e2">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[var(--ff-border)] border-t-[var(--ff-primary)]" />
          <h1 className="mt-4 text-2xl font-bold">Loading dashboard</h1>
          <p className="mt-1 text-sm text-[var(--ff-text-700)]">Preparing your productivity overview.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--ff-bg)] px-4 text-[var(--ff-text-900)]">
        <div className="w-full max-w-md rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-8 text-center shadow-e2">
          <h1 className="text-2xl font-bold">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-rose-500">{error || 'Unable to load dashboard data right now.'}</p>
          <button
            type="button"
            className="mt-5 rounded-[10px] bg-[var(--ff-primary)] px-[18px] py-[10px] text-sm font-semibold text-white transition-[transform,background-color,filter,box-shadow] duration-normal ease-premium hover:bg-[var(--ff-primary-hover)] hover:brightness-105 hover:shadow-hover"
            onClick={refreshDashboard}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayName = [user?.username, data.username, 'FocusForge User'].find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length > 0
  ) as string;
  const firstName = displayName.split(/[\s@._-]+/).filter(Boolean)[0] || 'there';
  const initials = getInitials(displayName);
  const latestBadge = data.recentBadges[0];

  const maxWeeklyMinutes = Math.max(...weeklyBars.map((bar) => bar.minutes), 0);
  const todayLabel = getTodayLabel();
  const todayIndex = weeklyBars.findIndex((bar) => bar.id === todayLabel);
  const todayMinutes = todayIndex >= 0 ? weeklyBars[todayIndex].minutes : 0;
  const yesterdayMinutes = todayIndex > 0 ? weeklyBars[todayIndex - 1].minutes : 0;
  const minuteDelta = todayMinutes - yesterdayMinutes;
  const recentPointDelta = data.recentActivities
    .slice(0, 6)
    .reduce((sum, activity) => sum + (Number.isFinite(activity.points) ? Number(activity.points) : 0), 0);
  const statDelta = recentPointDelta !== 0 ? recentPointDelta : minuteDelta;
  const statDeltaIcon = statDelta >= 0 ? 'arrow_upward' : 'arrow_downward';
  const statDeltaClass = statDelta >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const streakStatus = data.globalStreak > 0 ? 'Active streak' : 'Start your streak';

  const visibleGoals = prioritizedGoals.slice(0, MAX_DASHBOARD_GOALS);

  const badgeProgress = getBadgeProgressPercent(latestBadge);
  const badgeTitle = latestBadge?.name || 'Productivity Master';
  const badgeUnlockLabel = getBadgeUnlockLabel(latestBadge, data.totalPoints);

  return (
    <div className="min-h-screen bg-[var(--ff-bg)] [background-image:var(--ff-gradient-bg-light),var(--ff-gradient-highlight)] text-[var(--ff-text-900)] [font-family:'Inter',sans-serif] dark:[background-image:var(--ff-gradient-bg-dark)]">
      <div className="flex h-screen overflow-hidden">
        <aside className="hidden w-[260px] flex-shrink-0 flex-col justify-between border-r border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-4 shadow-e1 md:flex">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <div className="rounded-[10px] bg-[var(--ff-primary-100)] p-2 dark:bg-[var(--ff-primary-900)]/40">
                <span className="material-symbols-outlined text-2xl text-[var(--ff-primary)]">auto_awesome</span>
              </div>
              <div className="overflow-hidden">
                <h1 className="truncate text-lg font-bold tracking-tight text-[var(--ff-text-900)]">FocusForge</h1>
                <p className="text-xs font-medium text-[var(--ff-text-700)]">Dashboard</p>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActiveNav(location.pathname, item.to);

                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${active
                      ? 'border border-[var(--ff-primary)] bg-[var(--ff-primary)] text-white'
                      : 'text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)] hover:text-[var(--ff-text-900)]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ff-surface-hover)] text-xs font-bold text-[var(--ff-text-900)]">
              {initials}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--ff-surface-elevated)] bg-[#22C55E]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--ff-text-900)]">{displayName}</p>
              <p className="truncate text-xs text-[var(--ff-text-700)]">Pro Member</p>
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col overflow-y-auto">
          <header className="sticky top-0 z-20 bg-[var(--ff-surface-elevated)]/95 px-4 py-4 backdrop-blur-md sm:px-8 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setMobileNavOpen((current) => !current)}
                  className="mt-1 rounded-[10px] border border-[var(--ff-border)] p-2 text-[var(--ff-text-700)] transition-colors hover:bg-[var(--ff-surface-hover)] md:hidden"
                  aria-label="Toggle navigation"
                >
                  <span className="material-symbols-outlined text-[20px]">menu</span>
                </button>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[var(--ff-text-900)] sm:text-3xl">
                    Welcome back,{' '}
                    <span className="[background-image:var(--ff-gradient-primary)] bg-clip-text text-transparent">
                      {firstName}
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-[var(--ff-text-700)]">Let&apos;s crush today&apos;s productivity targets.</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={openAlerts}
                  className="relative rounded-full p-2 text-[var(--ff-text-700)] transition-colors hover:bg-[var(--ff-surface-hover)] hover:text-[var(--ff-text-900)]"
                  aria-label="Notifications"
                >
                  <span className="material-symbols-outlined">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--ff-primary)]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/goals/new')}
                  className="flex items-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-[18px] py-[10px] font-semibold text-white shadow-e1 transition-[transform,filter,box-shadow] duration-normal ease-premium hover:scale-[1.02] hover:brightness-105 hover:shadow-hover"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  New Task
                </button>
              </div>
            </div>
          </header>

          {mobileNavOpen && (
            <div className="border-b border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-3 shadow-e1 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const active = isActiveNav(location.pathname, item.to);
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${active
                        ? 'bg-[var(--ff-primary)] font-semibold text-white'
                        : 'bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-600 dark:text-rose-300">
                {error}
              </div>
            )}

            <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <article className="group relative overflow-hidden rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2 transition-all duration-normal ease-premium hover:border-[rgba(124,58,237,0.5)] hover:shadow-glow">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--ff-primary-100)]/70 blur-xl transition-colors dark:bg-[var(--ff-primary-900)]/30" />
                <div className="relative z-10 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--ff-text-700)]">Total Points</p>
                  <span className="material-symbols-outlined text-xl text-[var(--ff-primary-soft)]">stars</span>
                </div>
                <div className="relative z-10 mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-[var(--ff-text-900)] font-numeric">{data.totalPoints.toLocaleString()}</p>
                  <p className={`flex items-center text-sm font-medium ${statDeltaClass}`}>
                    <span className="material-symbols-outlined text-[14px]">{statDeltaIcon}</span>
                    <span className="font-numeric">{Math.abs(statDelta).toLocaleString()}</span>
                  </p>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2 transition-all duration-normal ease-premium hover:border-[rgba(124,58,237,0.5)] hover:shadow-glow">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--ff-primary-100)]/70 blur-xl transition-colors dark:bg-[var(--ff-primary-900)]/30" />
                <div className="relative z-10 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--ff-text-700)]">Global Streak</p>
                  <span className="material-symbols-outlined text-xl text-[var(--ff-primary-soft)]">local_fire_department</span>
                </div>
                <div className="relative z-10 mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-[var(--ff-text-900)] font-numeric">{data.globalStreak} days</p>
                  <p className="text-sm font-medium text-emerald-400">{streakStatus}</p>
                </div>
              </article>

              <article className="group relative overflow-hidden rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2 transition-all duration-normal ease-premium hover:border-[rgba(124,58,237,0.5)] hover:shadow-glow">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--ff-primary-100)]/70 blur-xl transition-colors dark:bg-[var(--ff-primary-900)]/30" />
                <div className="relative z-10 flex items-center justify-between">
                  <p className="text-sm font-medium text-[var(--ff-text-700)]">Active Goals</p>
                  <span className="material-symbols-outlined text-xl text-[var(--ff-primary-soft)]">flag</span>
                </div>
                <div className="relative z-10 mt-2 flex items-baseline gap-2">
                  <p className="text-3xl font-bold tracking-tight text-[var(--ff-text-900)] font-numeric">{data.activeGoals.length}</p>
                  <p className="text-sm font-medium text-[var(--ff-text-500)]">In progress</p>
                </div>
              </article>
            </section>

            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col gap-6 lg:col-span-2">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-[var(--ff-text-900)]">Weekly Progress</h3>
                    <button
                      type="button"
                      onClick={() => navigate('/analytics')}
                      className="text-sm font-medium text-[var(--ff-primary)] transition-colors hover:text-[var(--ff-primary-hover)]"
                    >
                      View Details
                    </button>
                  </div>

                  <div className="relative h-64 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2">
                    <div className="pointer-events-none absolute inset-x-6 bottom-6 top-6 z-0 flex flex-col justify-between opacity-20">
                      {[0, 1, 2, 3].map((line) => (
                        <div key={line} className="w-full border-b border-[var(--ff-border)]" />
                      ))}
                    </div>

                    <div className="relative z-10 grid h-full grid-cols-7 items-end gap-2 pb-6">
                      {weeklyBars.map((bar) => {
                        const hasValue = bar.minutes > 0 && maxWeeklyMinutes > 0;
                        const heightPercent = hasValue ? Math.max(14, Math.round((bar.minutes / maxWeeklyMinutes) * 100)) : 12;
                        const isWeekend = bar.id === 'Sat' || bar.id === 'Sun';

                        return (
                          <button
                            key={bar.id}
                            type="button"
                            onMouseEnter={() => setHoveredWeeklyId(bar.id)}
                            onMouseLeave={() => setHoveredWeeklyId(null)}
                            className="group relative flex h-full items-end justify-center"
                            aria-label={`${bar.label}: ${bar.minutes} minutes`}
                          >
                            <div
                              className={`relative w-[70%] rounded-t-md transition-colors ${!hasValue
                                ? 'bg-[var(--ff-surface-hover)] opacity-55'
                                : isWeekend
                                  ? 'bg-[rgb(var(--ff-primary-rgb)/0.25)] hover:bg-[rgb(var(--ff-primary-rgb)/0.35)]'
                                  : 'bg-gradient-to-t from-[var(--ff-primary)] to-[var(--ff-primary-soft)] hover:brightness-110'
                                }`}
                              style={{ height: `${heightPercent}%` }}
                            >
                              {hoveredWeeklyId === bar.id && (
                                <span className="absolute -top-[66px] left-1/2 z-20 w-max -translate-x-1/2 rounded border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] px-2.5 py-1.5 text-left text-[11px] leading-tight text-[var(--ff-text-700)] shadow-e2">
                                  <p className="font-semibold text-[var(--ff-text-900)]">{bar.label}</p>
                                  <p>{bar.minutes} minutes logged</p>
                                  {visitSummaryByDay[bar.id].visits > 0 ? (
                                    <p className="text-[var(--ff-text-500)]">
                                      {visitSummaryByDay[bar.id].visits} visit
                                      {visitSummaryByDay[bar.id].visits > 1 ? 's' : ''}{' '}
                                      at {formatVisitTime(visitSummaryByDay[bar.id].lastVisitedAt)}
                                    </p>
                                  ) : (
                                    <p className="text-[var(--ff-text-500)]">No visit recorded</p>
                                  )}
                                </span>
                              )}
                            </div>
                            <p
                              className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs ${hasValue ? 'text-[var(--ff-text-700)]' : 'text-[var(--ff-text-500)]'
                                }`}
                            >
                              {bar.label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-[var(--ff-text-900)]">Active Goals</h3>
                  {visibleGoals.length === 0 ? (
                    <div className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2">
                      <p className="text-sm text-[var(--ff-text-700)]">No active goals available yet. Create one to get started.</p>
                    </div>
                  ) : (
                    visibleGoals.map((goal, index) => {
                      const progressPercent = getProgressPercent(goal);
                      const categoryColor = goal.categoryColor?.trim() || fallbackGoalColors[index % fallbackGoalColors.length];
                      const remainingMinutes = Math.max(goal.dailyTarget - goal.todayProgress, 0);

                      return (
                        <article
                          key={goal.goalId}
                          className="flex flex-col items-center justify-between gap-4 rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-4 shadow-e1 transition-all duration-normal ease-premium hover:border-[rgba(124,58,237,0.5)] hover:shadow-glow sm:flex-row"
                          style={{ borderLeftWidth: 4, borderLeftColor: categoryColor }}
                        >
                          <div className="flex w-full items-center gap-4 sm:w-auto">
                            <div className="relative h-12 w-12 shrink-0">
                              <div
                                className="h-12 w-12 rounded-full"
                                style={{
                                  background: `conic-gradient(${categoryColor} ${progressPercent * 3.6}deg, var(--ff-surface-hover) 0deg)`,
                                }}
                              />
                              <div className="absolute inset-[4px] rounded-full bg-[var(--ff-surface)]" />
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[var(--ff-text-900)]">
                                {progressPercent}%
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-[var(--ff-text-900)]">{goal.title}</h4>
                                <span
                                  className="rounded border px-2 py-0.5 text-[10px] font-bold uppercase"
                                  style={{
                                    color: categoryColor,
                                    backgroundColor: `${categoryColor}22`,
                                    borderColor: `${categoryColor}55`,
                                  }}
                                >
                                  {goal.category || 'General'}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--ff-text-700)]">
                                {remainingMinutes > 0 ? `${remainingMinutes} minutes left today` : 'Target complete for today'}
                              </p>
                              <p className="text-xs text-[var(--ff-text-500)]">
                                {Math.max(goal.todayProgress, 0)} / {Math.max(goal.dailyTarget, 0)} minutes
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-[18px] py-[10px] text-sm font-semibold text-[var(--ff-text-900)] transition-[transform,background-color] duration-normal ease-premium hover:bg-[var(--ff-surface-hover)] sm:w-auto disabled:cursor-not-allowed disabled:opacity-60"
                            onClick={() => {
                              if (goal.completedToday) {
                                navigate(`/goals/${goal.goalId}`);
                                return;
                              }
                              setSelectedGoal(goal);
                            }}
                          >
                            {goal.completedToday ? 'View Goal' : 'Log Activity'}
                          </button>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>

              <aside className="flex flex-col gap-6">
                <article className="relative overflow-hidden rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2">
                  <div className="pointer-events-none absolute inset-0 [background-image:var(--ff-gradient-card-accent)]" />
                  <h3 className="relative z-10 text-lg font-bold text-[var(--ff-text-900)]">Badge Momentum</h3>
                  <div className="relative z-10 mt-4 flex justify-center">
                    <div className="flex h-24 w-24 rotate-12 items-center justify-center rounded-xl border border-[var(--ff-border)] bg-gradient-to-br from-amber-400 to-orange-600 shadow-e2">
                      <span className="material-symbols-outlined text-5xl text-white">emoji_events</span>
                    </div>
                  </div>
                  <div className="relative z-10 mt-4 text-center">
                    <h4 className="text-xl font-bold text-[var(--ff-text-900)]">{badgeTitle}</h4>
                    <p className="mt-1 text-sm text-[var(--ff-text-700)]">{badgeUnlockLabel}</p>
                  </div>
                  <div className="relative z-10 mt-4 h-2 w-full rounded-full bg-[var(--ff-surface-soft)]">
                    <div className="h-2 rounded-full" style={{ width: `${badgeProgress}%`, backgroundImage: 'var(--ff-gradient-primary)' }} />
                  </div>
                </article>

                <article className="rounded-lg border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2">
                  <h3 className="text-lg font-bold text-[var(--ff-text-900)]">Recent Activity</h3>
                  <div className="relative mt-4 flex flex-col gap-0">
                    <div className="absolute bottom-2 left-[11px] top-2 z-0 w-px bg-[var(--ff-line)]" />

                    {data.recentActivities.slice(0, 3).map((activity, index) => {
                      const primary = index === 0;
                      const activityTitle = activity.goalTitle || 'Goal Activity';
                      const activityDetail = activity.minutes > 0 ? `${activity.minutes} minutes logged` : 'Activity logged';
                      return (
                        <div key={activity.id} className="relative z-10 flex gap-4 pb-4 last:pb-0">
                          <div
                            className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 ${primary
                              ? 'border-[var(--ff-primary)] bg-[var(--ff-surface-soft)]'
                              : 'border-[var(--ff-border)] bg-[var(--ff-surface-soft)]'
                              }`}
                          >
                            {primary && <span className="h-2 w-2 rounded-full bg-[var(--ff-primary)]" />}
                          </div>
                          <div>
                            <p className={`${primary ? 'text-[var(--ff-text-900)]' : 'text-[var(--ff-text-700)]'} text-sm font-medium`}>
                              {activityTitle}
                            </p>
                            <p className="text-xs text-[var(--ff-text-700)]">{activityDetail}</p>
                            <p className="text-[11px] text-[var(--ff-text-500)]">
                              {getRelativeTime(activity.date)} - {formatDateTime(activity.date)}
                            </p>
                          </div>
                        </div>
                      );
                    })}

                    {data.recentActivities.length === 0 && (
                      <p className="text-sm text-[var(--ff-text-700)]">No recent activity yet.</p>
                    )}
                  </div>
                </article>
              </aside>
            </section>
          </div>
        </main>
      </div>

      {alertsOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAlertsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-[20px] border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-5 shadow-e3">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-[var(--ff-text-900)]">Alerts</h2>
              <button
                type="button"
                className="rounded-[10px] border border-[var(--ff-border)] px-3 py-1.5 text-sm font-semibold text-[var(--ff-text-700)] transition-colors duration-fast ease-premium hover:bg-[var(--ff-surface-hover)] hover:text-[var(--ff-text-900)]"
                onClick={() => setAlertsOpen(false)}
              >
                Close
              </button>
            </div>

            {notificationsLoading && notifications.length === 0 ? (
              <p className="text-sm text-[var(--ff-text-700)]">Loading alerts...</p>
            ) : notificationsError ? (
              <p className="text-sm text-rose-300">{notificationsError}</p>
            ) : prioritizedNotifications.length === 0 ? (
              <p className="text-sm text-[var(--ff-text-700)]">You have no alerts right now.</p>
            ) : (
              <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                {prioritizedNotifications.map((notification) => (
                  <article
                    key={notification.id}
                    className={`rounded-xl border p-3 ${notification.isRead
                      ? 'border-[var(--ff-border)] bg-[var(--ff-surface-soft)]'
                      : 'border-[rgb(var(--ff-primary-rgb)/0.45)] bg-[rgb(var(--ff-primary-rgb)/0.10)]'
                      }`}
                  >
                    <p className="text-sm font-bold text-[var(--ff-text-900)]">{notification.title || 'Alert'}</p>
                    <p className="mt-1 text-xs text-[var(--ff-text-700)]">{notification.message}</p>
                    <p className="mt-2 text-[11px] text-[var(--ff-text-500)]">
                      {getRelativeTime(notification.createdAt)} - {formatDateTime(notification.createdAt)}
                    </p>

                    {!notification.isRead && (
                      <button
                        type="button"
                        className="mt-3 rounded-[10px] border border-[rgb(var(--ff-primary-rgb)/0.45)] bg-[rgb(var(--ff-primary-rgb)/0.15)] px-3 py-1.5 text-xs font-semibold text-[var(--ff-text-900)] transition-colors duration-fast ease-premium hover:bg-[rgb(var(--ff-primary-rgb)/0.25)] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={markingNotificationId === notification.id}
                        onClick={() => handleMarkNotificationRead(notification.id)}
                      >
                        {markingNotificationId === notification.id ? 'Marking...' : 'Mark read'}
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
          onBadgesEarned={() => {
            refreshDashboard();
          }}
          onClose={() => {
            setSelectedGoal(null);
            refreshDashboard();
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;

