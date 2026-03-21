import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboard } from '../../store/dashboardSlice';
import { fetchNotifications, markNotificationRead } from '../../store/notificationsSlice';
import { fetchSettings } from '../../store/settingsSlice';
import { Badge, GoalProgress, NotificationItem } from '../../types';
import LogActivityModal from '../Activity/LogActivityModal';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import EmptyState from '../ui/EmptyState';
import { CardSkeleton } from '../ui/Skeleton';

const DASHBOARD_REFRESH_INTERVAL_MS = 30000;
const MAX_DASHBOARD_GOALS = 3;

const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
type DayLabel = (typeof dayOrder)[number];
type WeeklyBar = { id: DayLabel; label: DayLabel; minutes: number };

const fallbackGoalColors = ['#8B5CF6', '#7C3AED', '#3B82F6', '#22C55E'];
const weekdayAliases: Record<string, DayLabel> = {
  mon: 'Mon', monday: 'Mon', tue: 'Tue', tues: 'Tue', tuesday: 'Tue',
  wed: 'Wed', weds: 'Wed', wednesday: 'Wed', thu: 'Thu', thur: 'Thu',
  thurs: 'Thu', thursday: 'Thu', fri: 'Fri', friday: 'Fri', sat: 'Sat',
  saturday: 'Sat', sun: 'Sun', sunday: 'Sun',
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const toMinutes = (value: unknown) => { const p = Number(value); return Number.isFinite(p) ? Math.max(0, Math.round(p)) : 0; };

const normalizeWeekdayLabel = (value: string): DayLabel | null => {
  const n = (value || '').trim().toLowerCase();
  if (!n) return null;
  if (weekdayAliases[n]) return weekdayAliases[n];
  const lo = n.replace(/[^a-z]/g, '');
  if (lo.length >= 3 && weekdayAliases[lo.slice(0, 3)]) return weekdayAliases[lo.slice(0, 3)];
  const d = new Date(value);
  if (!Number.isNaN(d.getTime())) return dayOrder[(d.getDay() + 6) % 7];
  return null;
};

const buildWeeklyBars = (weeklyProgress: Record<string, number> | undefined): WeeklyBar[] => {
  const m = new Map<DayLabel, number>(dayOrder.map((d) => [d, 0]));
  Object.entries(weeklyProgress || {}).forEach(([raw, mins]) => {
    const d = normalizeWeekdayLabel(raw);
    if (d) m.set(d, toMinutes(mins));
  });
  return dayOrder.map((d) => ({ id: d, label: d, minutes: m.get(d) ?? 0 }));
};

const getTodayLabel = (): DayLabel => dayOrder[(new Date().getDay() + 6) % 7];

const getRelativeTime = (v?: string) => {
  if (!v) return 'Recently';
  const p = new Date(v);
  return Number.isNaN(p.getTime()) ? 'Recently' : formatDistanceToNowStrict(p, { addSuffix: true });
};

const formatDateTime = (v?: string) => {
  if (!v) return 'Unknown time';
  const p = new Date(v);
  return Number.isNaN(p.getTime()) ? 'Unknown time' : format(p, 'MMM d, yyyy h:mm a');
};

const toSortTime = (v?: string) => { const p = Date.parse(v || ''); return Number.isFinite(p) ? p : 0; };

const getProgressPercent = (goal: GoalProgress) => {
  const t = Math.max(Number(goal.dailyTarget) || 0, 0);
  const p = Math.max(Number(goal.todayProgress) || 0, 0);
  if (t <= 0) return goal.completedToday ? 100 : 0;
  return clamp(Math.round((p / t) * 100), 0, 100);
};

const getGoalPriorityBucket = (goal: GoalProgress) => {
  const hasLoggedToday = (Number(goal.todayProgress) || 0) > 0;
  if (!hasLoggedToday) return 0; // show goals with no logs today first
  if (!goal.completedToday) return 1; // then partially logged goals
  return 2; // completed goals last
};

const getBadgeProgressPercent = (badge?: Badge) => {
  if (!badge) return 70;
  if (Number.isFinite(badge.progressPercentage)) return clamp(Math.round(Number(badge.progressPercentage)), 0, 100);
  if (Number.isFinite(badge.requiredValue) && Number(badge.requiredValue) > 0) {
    const c = Number.isFinite(badge.currentValue) ? Number(badge.currentValue) : 0;
    return clamp(Math.round((c / Number(badge.requiredValue)) * 100), 0, 100);
  }
  return 70;
};

const getBadgeUnlockLabel = (badge: Badge | undefined, totalPoints: number) => {
  if (!badge) return 'Unlock in 2,550 points';
  const ea = badge.awardedAt || badge.earnedAt;
  if (ea) return `Earned ${getRelativeTime(ea)}`;
  if (Number.isFinite(badge.requiredValue) && Number(badge.requiredValue) > 0) {
    const c = Number.isFinite(badge.currentValue) ? Number(badge.currentValue) : totalPoints;
    const r = Math.max(0, Math.round(Number(badge.requiredValue) - c));
    return `Unlock in ${r.toLocaleString()} points`;
  }
  return 'Unlock in 2,550 points';
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { data, error } = useSelector((state: RootState) => state.dashboard);
  const { notifications, unreadCount, loading: notificationsLoading, error: notificationsError } = useSelector(
    (state: RootState) => state.notifications
  );

  const [selectedGoal, setSelectedGoal] = useState<GoalProgress | null>(null);
  const [hoveredWeeklyId, setHoveredWeeklyId] = useState<DayLabel | null>(null);
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [markingNotificationId, setMarkingNotificationId] = useState<number | null>(null);

  const refreshDashboard = useCallback(() => {
    dispatch(fetchDashboard());
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => { dispatch(fetchSettings()); }, [dispatch]);

  useEffect(() => {
    refreshDashboard();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshDashboard();
    }, DASHBOARD_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [refreshDashboard]);

  const weeklyBars = useMemo(() => buildWeeklyBars(data?.weeklyProgress), [data?.weeklyProgress]);
  const prioritizedGoals = useMemo(
    () => [...(data?.activeGoals || [])].sort((a, b) => {
      const bucketDelta = getGoalPriorityBucket(a) - getGoalPriorityBucket(b);
      if (bucketDelta !== 0) return bucketDelta;

      // Within the same bucket, prioritize at-risk goals and then higher remaining workload.
      const riskDelta = Number(b.atRisk) - Number(a.atRisk);
      if (riskDelta !== 0) return riskDelta;

      const remainingA = Math.max((Number(a.dailyTarget) || 0) - (Number(a.todayProgress) || 0), 0);
      const remainingB = Math.max((Number(b.dailyTarget) || 0) - (Number(b.todayProgress) || 0), 0);
      if (remainingA !== remainingB) return remainingB - remainingA;

      return getProgressPercent(b) - getProgressPercent(a);
    }), [data?.activeGoals]
  );
  const prioritizedNotifications = useMemo<NotificationItem[]>(
    () => [...notifications]
      .sort((a, b) => {
        const rd = Number(a.isRead) - Number(b.isRead);
        return rd !== 0 ? rd : toSortTime(b.createdAt) - toSortTime(a.createdAt);
      })
      .slice(0, 12),
    [notifications]
  );

  const openAlerts = useCallback(() => { setAlertsOpen(true); dispatch(fetchNotifications()); }, [dispatch]);

  const handleMarkNotificationRead = useCallback(
    async (notificationId: number) => {
      setMarkingNotificationId(notificationId);
      try { await dispatch(markNotificationRead(notificationId)).unwrap(); }
      finally { setMarkingNotificationId(null); }
    }, [dispatch]
  );

  // Loading state with skeleton
  if (!data && !error) {
    return (
      <div className="p-4 sm:p-8 max-w-[1280px] mx-auto space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <CardSkeleton /><CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20 px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard unavailable</h1>
          <p className="mt-2 text-sm text-red-500">{error || 'Unable to load dashboard data right now.'}</p>
          <div className="mt-5">
            <Button variant="primary" onClick={refreshDashboard}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const displayName = [user?.username, data.username, 'FocusForge User'].find(
    (c) => typeof c === 'string' && c.trim().length > 0
  ) as string;
  const firstName = displayName.split(/[\s@._-]+/).filter(Boolean)[0] || 'there';
  const latestBadge = data.recentBadges[0];
  const maxWeeklyMinutes = Math.max(...weeklyBars.map((b) => b.minutes), 0);
  const todayLabel = getTodayLabel();
  const todayIndex = weeklyBars.findIndex((b) => b.id === todayLabel);
  const todayMinutes = todayIndex >= 0 ? weeklyBars[todayIndex].minutes : 0;
  const yesterdayMinutes = todayIndex > 0 ? weeklyBars[todayIndex - 1].minutes : 0;
  const minuteDelta = todayMinutes - yesterdayMinutes;
  const recentPointDelta = data.recentActivities.slice(0, 6)
    .reduce((sum, a) => sum + (Number.isFinite(a.points) ? Number(a.points) : 0), 0);
  const statDelta = recentPointDelta !== 0 ? recentPointDelta : minuteDelta;
  const streakStatus = data.globalStreak > 0 ? 'Active streak' : 'Start your streak';
  const visibleGoals = prioritizedGoals.slice(0, MAX_DASHBOARD_GOALS);
  const badgeProgress = getBadgeProgressPercent(latestBadge);
  const badgeTitle = latestBadge?.name || 'Productivity Master';
  const badgeUnlockLabel = getBadgeUnlockLabel(latestBadge, data.totalPoints);

  return (
    <>
      {/* Content */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 px-5 py-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-[2.75rem]">
                Welcome back, {firstName} <span aria-hidden="true">👋</span>
              </h2>
              <p className="mt-1 text-base text-slate-600 dark:text-slate-300">You&apos;re in the top 5% of deep workers this week.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-700 ring-1 ring-violet-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:ring-slate-700/60">
                <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.55)] dark:bg-violet-400 dark:shadow-[0_0_8px_rgba(167,139,250,0.75)]" />
                Live Session Active
              </div>
              <button
                type="button"
                onClick={openAlerts}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 transition-all duration-200 hover:border-violet-300/70 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700/70 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-violet-400/40 dark:hover:bg-slate-700/80 dark:hover:text-violet-200"
                aria-label="Notifications"
              >
                <span className="material-symbols-outlined text-[20px]">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-500 px-1 text-[9px] font-bold text-slate-950">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <Button
                variant="primary"
                icon="add"
                onClick={() => navigate('/goals/new')}
                className="rounded-full px-5 shadow-[0_8px_24px_rgba(139,92,246,0.35)]"
              >
                New Goal
              </Button>
            </div>
          </div>
        </section>

        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {error}
          </div>
        )}

        {/* KPI Stats */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: 'Total Points', value: data.totalPoints.toLocaleString(), icon: 'stars',
              iconBg: 'bg-violet-100 dark:bg-violet-900/30', iconColor: 'text-violet-600 dark:text-violet-400',
              sub: statDelta !== 0 ? `${statDelta >= 0 ? '+' : ''}${Math.abs(statDelta).toLocaleString()} pts` : '',
              subColor: statDelta >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500',
            },
            {
              label: 'Global Streak', value: `${data.globalStreak} days`, icon: 'local_fire_department',
              iconBg: 'bg-orange-100 dark:bg-orange-900/30', iconColor: 'text-orange-500 dark:text-orange-400',
              sub: streakStatus, subColor: 'text-orange-600 dark:text-orange-400',
            },
            {
              label: 'Active Goals', value: String(data.activeGoals.length), icon: 'flag',
              iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400',
              sub: 'In progress', subColor: 'text-emerald-600 dark:text-emerald-400',
            },
          ].map((stat) => (
            <Card key={stat.label} hover>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</p>
                  {stat.sub && <p className={`mt-1 text-xs font-semibold ${stat.subColor}`}>{stat.sub}</p>}
                </div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                  <span className={`material-symbols-outlined text-xl ${stat.iconColor}`}>{stat.icon}</span>
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Main content grid */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Weekly Progress */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Weekly Progress</h3>
                <button
                  type="button"
                  onClick={() => navigate('/analytics')}
                  className="text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                  View Details →
                </button>
              </div>
              <div className="relative h-56">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-[0.08]">
                  {[0, 1, 2, 3].map((l) => <div key={l} className="w-full border-b border-slate-900 dark:border-white" />)}
                </div>
                {/* Bars */}
                <div className="relative z-10 grid h-full grid-cols-7 items-end gap-2 sm:gap-3 pb-6">
                  {weeklyBars.map((bar, i) => {
                    const hasValue = bar.minutes > 0 && maxWeeklyMinutes > 0;
                    const heightPercent = hasValue ? Math.max(14, Math.round((bar.minutes / maxWeeklyMinutes) * 100)) : 10;
                    const isToday = bar.id === todayLabel;
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
                          className={`
                            relative w-[65%] sm:w-[60%] rounded-lg transition-all duration-200
                            ${!hasValue
                              ? 'bg-slate-100 dark:bg-slate-800 opacity-60'
                              : isToday
                                ? 'bg-gradient-to-t from-violet-600 to-violet-400 shadow-md shadow-violet-500/20'
                                : 'bg-gradient-to-t from-violet-500/60 to-violet-400/40 dark:from-violet-500/40 dark:to-violet-400/20'
                            }
                            ${hasValue ? 'hover:brightness-110 hover:shadow-lg' : ''}
                          `}
                          style={{
                            height: `${heightPercent}%`,
                            animation: `ff-bar-grow 600ms cubic-bezier(.4,0,.2,1) ${i * 60}ms both`,
                          }}
                        >
                          {hoveredWeeklyId === bar.id && (
                            <span className="absolute -top-12 left-1/2 z-20 w-max -translate-x-1/2 rounded-lg bg-slate-900 dark:bg-slate-700 px-3 py-2 text-xs text-white shadow-xl">
                              <strong>{bar.label}</strong>: {bar.minutes} min
                            </span>
                          )}
                        </div>
                        <p className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium ${isToday ? 'text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500'}`}>
                          {bar.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </Card>

            {/* Active Goals */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Active Goals</h3>
              {visibleGoals.length === 0 ? (
                <EmptyState
                  icon="track_changes"
                  title="No active goals"
                  description="Create your first goal to start tracking progress."
                  actionLabel="Create Goal"
                  onAction={() => navigate('/goals/new')}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {visibleGoals.map((goal, index) => {
                    const progressPercent = getProgressPercent(goal);
                    const categoryColor = goal.categoryColor?.trim() || fallbackGoalColors[index % fallbackGoalColors.length];
                    const remainingMinutes = Math.max(goal.dailyTarget - goal.todayProgress, 0);

                    return (
                      <Card key={goal.goalId} hover accent={categoryColor}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            {/* Progress ring */}
                            <div className="relative h-12 w-12 shrink-0">
                              <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="3"
                                  className="text-slate-100 dark:text-slate-800" />
                                <circle cx="24" cy="24" r="20" fill="none" strokeWidth="3" strokeLinecap="round"
                                  stroke={categoryColor}
                                  strokeDasharray={`${progressPercent * 1.256} 125.6`}
                                  className="transition-all duration-700" />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-900 dark:text-white">
                                {progressPercent}%
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-bold text-slate-900 dark:text-white">{goal.title}</h4>
                                <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase"
                                  style={{ color: categoryColor, backgroundColor: `${categoryColor}15`, borderColor: `${categoryColor}40` }}>
                                  {goal.category || 'General'}
                                </span>
                              </div>
                              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                {remainingMinutes > 0 ? `${remainingMinutes} min left today` : '✓ Target complete'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={goal.completedToday ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={() => {
                              if (goal.completedToday) { navigate(`/goals/${goal.goalId}`); return; }
                              setSelectedGoal(goal);
                            }}
                          >
                            {goal.completedToday ? 'View Goal' : 'Log Activity'}
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar */}
          <aside className="flex flex-col gap-5">
            {/* Badge Momentum */}
            <Card>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50/50 dark:from-violet-900/10 to-transparent rounded-2xl" />
              <div className="relative z-10">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Badge Momentum</h3>
                <div className="mt-5 flex justify-center">
                  <div className="flex h-20 w-20 rotate-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-orange-500/25 transition-transform hover:scale-105">
                    <span className="material-symbols-outlined text-4xl text-white">emoji_events</span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">{badgeTitle}</h4>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{badgeUnlockLabel}</p>
                </div>
                <div className="mt-4 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-700"
                    style={{ width: `${badgeProgress}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">Recent Activity</h3>
              {data.recentActivities.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
              ) : (
                <div className="relative flex flex-col gap-0">
                  <div className="absolute bottom-2 left-[11px] top-2 z-0 w-px bg-slate-200 dark:bg-slate-700" />
                  {data.recentActivities.slice(0, 4).map((activity, index) => {
                    const primary = index === 0;
                    return (
                      <div key={activity.id} className="relative z-10 flex gap-3 pb-4 last:pb-0">
                        <div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 shrink-0 ${
                          primary
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}>
                          {primary && <span className="h-2 w-2 rounded-full bg-violet-600" />}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate ${primary ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                            {activity.goalTitle || 'Goal Activity'}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {activity.minutes > 0 ? `${activity.minutes} min` : 'Logged'} · {getRelativeTime(activity.date)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: 'add_circle', label: 'New Goal', to: '/goals/new' },
                  { icon: 'monitoring', label: 'Analytics', to: '/analytics' },
                  { icon: 'military_tech', label: 'Badges', to: '/badges' },
                  { icon: 'leaderboard', label: 'Rankings', to: '/leaderboard' },
                ].map((action) => (
                  <button
                    key={action.to}
                    onClick={() => navigate(action.to)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 py-3 px-2 text-slate-600 dark:text-slate-400 transition-all duration-200 hover:bg-violet-50 dark:hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-500/30"
                  >
                    <span className="material-symbols-outlined text-[20px]">{action.icon}</span>
                    <span className="text-xs font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </aside>
        </section>
      </div>

      {/* Notifications Modal */}
      <Modal open={alertsOpen} onClose={() => setAlertsOpen(false)} title="Notifications" maxWidth="2xl">
        {notificationsLoading && notifications.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-4">Loading notifications...</p>
        ) : notificationsError ? (
          <p className="text-sm text-red-500 py-4">{notificationsError}</p>
        ) : prioritizedNotifications.length === 0 ? (
          <EmptyState icon="notifications_off" title="All caught up" description="You have no notifications right now." />
        ) : (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto">
            {prioritizedNotifications.map((n) => (
              <article
                key={n.id}
                className={`rounded-xl border p-4 transition-colors ${
                  n.isRead
                    ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                    : 'border-violet-200 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10'
                }`}
              >
                <p className="text-sm font-bold text-slate-900 dark:text-white">{n.title || 'Alert'}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{n.message}</p>
                <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  {getRelativeTime(n.createdAt)} · {formatDateTime(n.createdAt)}
                </p>
                {!n.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    disabled={markingNotificationId === n.id}
                    onClick={() => handleMarkNotificationRead(n.id)}
                    loading={markingNotificationId === n.id}
                  >
                    Mark read
                  </Button>
                )}
              </article>
            ))}
          </div>
        )}
      </Modal>

      {/* Log Activity Modal */}
      {selectedGoal && (
        <LogActivityModal
          goalId={selectedGoal.goalId}
          goalTitle={selectedGoal.title}
          dailyTarget={selectedGoal.dailyTarget}
          onBadgesEarned={() => refreshDashboard()}
          onClose={() => { setSelectedGoal(null); refreshDashboard(); }}
        />
      )}
    </>
  );
};

export default Dashboard;
