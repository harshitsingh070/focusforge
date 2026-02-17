import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchDashboard } from '../../store/dashboardSlice';
import { fetchNotifications, markNotificationRead } from '../../store/notificationsSlice';
import { BadgeAward, GoalProgress, NotificationItem, RecentActivity } from '../../types';
import LogActivityModal from '../Activity/LogActivityModal';
import Navbar from '../Layout/Navbar';

const DASHBOARD_REFRESH_INTERVAL_MS = 30000;
const TREND_CHART_WIDTH = 560;
const TREND_CHART_HEIGHT = 150;

type WeeklyEntry = {
  id: string;
  label: string;
  minutes: number;
};

type WeeklyPoint = WeeklyEntry & {
  x: number;
  y: number;
};

type ActiveGoalCardData = {
  goal: GoalProgress;
  progressPercent: number;
  orderIndex: number;
};

const accentPalette = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6'];

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

const normalizeWeeklySeries = (input: Record<string, number>): WeeklyEntry[] => {
  const entries = Object.entries(input || {});
  if (entries.length === 0) {
    return [];
  }

  return entries.map(([label, minutes], index) => ({
    id: `${label}-${index}`,
    label,
    minutes: Number(minutes || 0),
  }));
};

const buildTrendPoints = (
  series: WeeklyEntry[],
  width = TREND_CHART_WIDTH,
  height = TREND_CHART_HEIGHT
): WeeklyPoint[] => {
  if (series.length === 0) {
    return [];
  }

  const max = Math.max(...series.map((item) => item.minutes), 1);
  const step = series.length > 1 ? width / (series.length - 1) : 0;

  return series.map((entry, index) => {
    const x = series.length > 1 ? index * step : width / 2;
    const y = height - (entry.minutes / max) * (height - 16) - 8;
    return {
      ...entry,
      x,
      y,
    };
  });
};

const buildTrendPath = (points: WeeklyPoint[]) => {
  if (points.length === 0) {
    return '';
  }

  return points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(' ');
};

const buildTrendAreaPath = (points: WeeklyPoint[], height = TREND_CHART_HEIGHT) => {
  if (points.length === 0) {
    return '';
  }

  const linePath = buildTrendPath(points);
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  return `${linePath} L ${lastPoint.x.toFixed(2)} ${height} L ${firstPoint.x.toFixed(2)} ${height} Z`;
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

  // Not started: warning color
  if (progressPercent <= 0) return '#ef4444';

  // Partially completed: use a separate color family
  if (activityScore >= 75) return '#3b82f6';
  if (activityScore >= 55) return '#0ea5e9';
  if (activityScore >= 35) return '#14b8a6';
  return '#f59e0b';
};

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { data, loading, error } = useSelector((state: RootState) => state.dashboard);
  const { notifications, unreadCount, loading: notificationsLoading, error: notificationsError } = useSelector(
    (state: RootState) => state.notifications
  );

  const [refreshing, setRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<GoalProgress | null>(null);
  const [selectedWeeklyId, setSelectedWeeklyId] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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

  const handleToggleNotifications = useCallback(() => {
    setNotificationsOpen((open) => !open);
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
  const weeklyPoints = useMemo(() => buildTrendPoints(weeklySeries), [weeklySeries]);
  const trendPath = useMemo(() => buildTrendPath(weeklyPoints), [weeklyPoints]);
  const trendAreaPath = useMemo(() => buildTrendAreaPath(weeklyPoints), [weeklyPoints]);
  const maxWeekly = useMemo(
    () => (weeklyPoints.length ? Math.max(...weeklyPoints.map((point) => point.minutes), 1) : 1),
    [weeklyPoints]
  );

  const selectedWeekPoint = useMemo(() => {
    if (weeklyPoints.length === 0) {
      return null;
    }

    if (selectedWeeklyId) {
      const selectedPoint = weeklyPoints.find((point) => point.id === selectedWeeklyId);
      if (selectedPoint) {
        return selectedPoint;
      }
    }

    return weeklyPoints[weeklyPoints.length - 1];
  }, [weeklyPoints, selectedWeeklyId]);

  const activeGoalCards = useMemo<ActiveGoalCardData[]>(
    () =>
      (data?.activeGoals || []).map((goal, orderIndex) => {
        const progressPercent = getGoalProgressPercent(goal);
        return {
          goal,
          progressPercent,
          orderIndex,
        };
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
    () => [...notifications].sort((a, b) => Number(a.isRead) - Number(b.isRead)).slice(0, 6),
    [notifications]
  );

  useEffect(() => {
    if (weeklyPoints.length === 0) {
      if (selectedWeeklyId !== null) {
        setSelectedWeeklyId(null);
      }
      return;
    }

    if (!selectedWeeklyId || !weeklyPoints.some((point) => point.id === selectedWeeklyId)) {
      setSelectedWeeklyId(weeklyPoints[weeklyPoints.length - 1].id);
    }
  }, [weeklyPoints, selectedWeeklyId]);

  if (loading && !data) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-container">
          <section className="card mx-auto max-w-xl text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Loading your dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Preparing your goals, streaks, and activity insights.</p>
          </section>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-container">
          <section className="card mx-auto max-w-xl text-center">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard unavailable</h1>
            <p className="mt-2 text-sm text-red-600">{error || 'Unable to fetch dashboard data right now.'}</p>
            <button type="button" className="btn-primary mt-5" onClick={() => refreshDashboard(false)}>
              Retry
            </button>
          </section>
        </main>
      </div>
    );
  }

  const highlightedWeeklyPercent = selectedWeekPoint ? Math.round((selectedWeekPoint.minutes / maxWeekly) * 100) : 0;

  const statCards = [
    {
      label: 'Total Points',
      value: data.totalPoints.toLocaleString(),
      helper: 'Focus score',
      icon: 'P',
      gradient: 'linear-gradient(136deg, #5ea8ff 0%, #6d4ff6 100%)',
    },
    {
      label: 'Global Streak',
      value: `${data.globalStreak}`,
      helper: 'Days in a row',
      icon: 'S',
      gradient: 'linear-gradient(136deg, #fb7a59 0%, #f04f93 100%)',
    },
    {
      label: 'Active Goals',
      value: `${data.activeGoals.length}`,
      helper: 'Current focus',
      icon: 'A',
      gradient: 'linear-gradient(136deg, #f9b340 0%, #f28b35 100%)',
    },
  ];

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        {statusMessage && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-soft">
            {statusMessage}
          </div>
        )}

        <section className="section-heading rounded-[28px] border border-white/70 bg-white/55 p-6 backdrop-blur-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Dashboard Overview</p>
              <h1 className="mt-2 font-display text-[clamp(2rem,4vw,3.45rem)] font-extrabold leading-tight text-slate-900">
                {getGreeting()}, {data.username}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-600">Keep up the excellent work and stay consistent today.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-secondary" onClick={() => refreshDashboard(false)} disabled={refreshing}>
                {refreshing ? 'Syncing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {data.underReview && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Some recent logs are under fair-play review.
            </div>
          )}

        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.72fr)_minmax(300px,1fr)]">
          <section>
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {statCards.map((card) => (
                <article
                  key={card.label}
                  className="relative overflow-hidden rounded-[24px] border border-white/30 px-5 py-5 text-white shadow-[0_18px_34px_rgba(15,23,42,0.15)]"
                  style={{ background: card.gradient }}
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-base font-bold text-white">
                      {card.icon}
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80">{card.label}</p>
                  </div>
                  <p className="mt-8 text-5xl font-black leading-none text-white">{card.value}</p>
                  <p className="mt-2 text-sm font-semibold text-white/90">{card.helper}</p>
                </article>
              ))}
            </div>

            <section>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">Active Goals</h2>
                  <p className="mt-1 text-sm text-slate-500">Track progress and log your sessions quickly.</p>
                </div>
                <button type="button" className="btn-primary" onClick={() => navigate('/goals/new')}>
                  + Create Goal
                </button>
              </div>

              {prioritizedGoals.length === 0 ? (
                <article className="card text-center">
                  <p className="text-slate-600">No active goals yet. Create one to start building streaks.</p>
                </article>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {prioritizedGoals.map((entry) => {
                    const { goal, progressPercent, orderIndex } = entry;
                    const chipColor = goal.categoryColor || accentPalette[orderIndex % accentPalette.length];
                    const activityScore = getGoalActivityScore(goal, progressPercent);
                    const ringColor = getGoalRingColor(goal, progressPercent, activityScore);
                    const ringStyle = {
                      ['--ring-value' as string]: `${progressPercent}%`,
                      ['--ring-color' as string]: ringColor,
                    } as React.CSSProperties;

                    return (
                      <article
                        key={goal.goalId}
                        className="card relative flex h-full min-h-[17.5rem] flex-col overflow-hidden border-white/75 bg-white/94"
                      >
                        <span
                          className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl"
                          style={{ background: `linear-gradient(180deg, ${ringColor}, transparent)` }}
                        />

                        <div className="w-full text-left">
                          <div className="flex items-center justify-between gap-2">
                            <span className="status-chip" style={{ background: `${chipColor}1c`, color: chipColor }}>
                              {goal.category}
                            </span>
                            {!goal.completedToday && (
                              <span className="status-chip" style={{ background: 'rgba(249,115,22,0.18)', color: '#c2410c' }}>
                                Pending
                              </span>
                            )}
                          </div>
                          <h3 className="mt-2 truncate text-2xl font-bold leading-tight text-slate-900">{goal.title}</h3>
                        </div>

                        <div
                          className={`mt-5 self-center rounded-full ${goal.completedToday ? '' : 'ring-4 ring-amber-100/80'}`}
                        >
                          <div className="ff-ring-wrap">
                            <div className="ff-ring" style={ringStyle} />
                            <p className="ff-ring__label">{progressPercent}%</p>
                          </div>
                        </div>

                        <p className="mt-3 text-center text-xs font-semibold text-slate-500">Activity score: {activityScore}</p>

                        <div className="mt-auto flex w-full justify-center pt-5">
                          <button
                            type="button"
                            className="w-full max-w-[170px] self-center whitespace-nowrap rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-bold text-white shadow-[0_10px_22px_rgba(16,185,129,0.34)] transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={goal.completedToday}
                            onClick={() => setSelectedGoal(goal)}
                          >
                            {goal.completedToday ? 'Completed Today' : 'Log Activity'}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-4">
            <section className="card border-white/75 bg-white/90">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Weekly Progress</h3>
                  <p className="mt-1 text-sm text-slate-500">Tap a day to inspect your logged minutes.</p>
                </div>
                {selectedWeekPoint && (
                  <span className="status-chip" style={{ background: 'rgba(251,146,60,0.16)', color: '#ea580c' }}>
                    {selectedWeekPoint.minutes}m
                  </span>
                )}
              </div>

              {weeklyPoints.length === 0 ? (
                <p className="mt-5 text-sm text-slate-500">No weekly progress data available yet.</p>
              ) : (
                <>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-b from-orange-50/65 to-white p-3">
                    <svg viewBox={`0 0 ${TREND_CHART_WIDTH} ${TREND_CHART_HEIGHT}`} className="h-40 w-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="trendAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="rgba(249,115,22,0.34)" />
                          <stop offset="100%" stopColor="rgba(249,115,22,0.04)" />
                        </linearGradient>
                      </defs>

                      <path d={trendAreaPath} fill="url(#trendAreaFill)" />
                      <path d={trendPath} fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />

                      {weeklyPoints.map((point) => {
                        const isSelected = point.id === selectedWeekPoint?.id;
                        return (
                          <circle
                            key={point.id}
                            cx={point.x}
                            cy={point.y}
                            r={isSelected ? 6 : 4}
                            fill={isSelected ? '#f97316' : '#fb923c'}
                            stroke="#fff"
                            strokeWidth={isSelected ? 3 : 2}
                            onClick={() => setSelectedWeeklyId(point.id)}
                            className="cursor-pointer"
                          />
                        );
                      })}
                    </svg>
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1.5">
                    {weeklyPoints.map((point) => {
                      const active = point.id === selectedWeekPoint?.id;
                      return (
                        <button
                          key={point.id}
                          type="button"
                          onClick={() => setSelectedWeeklyId(point.id)}
                          className={`rounded-xl border px-1.5 py-2 text-center transition-colors ${
                            active
                              ? 'border-orange-200 bg-orange-50 text-orange-700'
                              : 'border-slate-100 bg-slate-50/90 text-slate-500 hover:border-slate-200 hover:bg-white'
                          }`}
                        >
                          <p className="text-[10px] font-semibold uppercase tracking-wide">{point.label.slice(0, 3)}</p>
                          <p className="mt-1 text-[11px] font-bold">{point.minutes}m</p>
                        </button>
                      );
                    })}
                  </div>

                  {selectedWeekPoint && (
                    <p className="mt-3 text-xs text-slate-500">
                      {selectedWeekPoint.label}: {selectedWeekPoint.minutes} minutes ({highlightedWeeklyPercent}% of this week's peak).
                    </p>
                  )}
                </>
              )}
            </section>

            <section className="card border-white/75 bg-white/90">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
                  <p className="mt-1 text-sm text-slate-500">Latest verified check-ins from your goals.</p>
                </div>
                <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => navigate('/activity')}>
                  Open
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {data.recentActivities.slice(0, 5).map((activity: RecentActivity) => (
                  <article key={activity.id} className="rounded-2xl border border-slate-100 bg-white px-3 py-3 transition-colors hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ background: activity.categoryColor || '#3B82F6' }}
                          />
                          <p className="truncate font-semibold text-slate-900">{activity.goalTitle}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{formatDisplayDate(activity.date)}</p>
                      </div>
                      <span className="status-chip" style={{ background: `${activity.categoryColor}1f`, color: activity.categoryColor }}>
                        {activity.minutes}m
                      </span>
                    </div>
                  </article>
                ))}

                {data.recentActivities.length === 0 && <p className="text-sm text-slate-500">No activity logged yet.</p>}
              </div>
            </section>

            <section className="card border-amber-100 bg-white/92">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-sm text-amber-600">?</span>
                  <p className="text-sm font-semibold text-slate-800">Badge Momentum</p>
                </div>
                <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={() => navigate('/badges')}>
                  View
                </button>
              </div>

              {data.recentBadges.length > 0 ? (
                <p className="mt-2 text-sm text-slate-600">
                  You recently earned <span className="font-semibold text-slate-900">{data.recentBadges[0].name}</span>. Keep your streak to unlock
                  more.
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">No new badge yet. Keep logging activity to unlock your next achievement.</p>
              )}
            </section>

            <section className="card border-blue-100 bg-white/92">
              <button
                type="button"
                onClick={handleToggleNotifications}
                className="status-chip cursor-pointer border border-blue-200 bg-blue-50 text-blue-700"
                aria-expanded={notificationsOpen}
                aria-controls="dashboard-alerts-panel"
              >
                {unreadCount} unread alerts
              </button>

              {notificationsOpen && (
                <div id="dashboard-alerts-panel" className="mt-3 rounded-2xl border border-slate-200 bg-white/92 p-3">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">Alerts</p>
                    <button type="button" className="btn-ghost !px-2.5 !py-1 text-xs" onClick={() => dispatch(fetchNotifications())}>
                      Reload
                    </button>
                  </div>

                  {notificationsLoading && notifications.length === 0 ? (
                    <p className="text-sm text-slate-500">Loading alerts...</p>
                  ) : notificationsError ? (
                    <p className="text-sm text-red-600">{notificationsError}</p>
                  ) : prioritizedNotifications.length === 0 ? (
                    <p className="text-sm text-slate-500">You have no alerts right now.</p>
                  ) : (
                    <div className="space-y-2">
                      {prioritizedNotifications.map((notification) => (
                        <article
                          key={notification.id}
                          className={`rounded-xl border px-3 py-2 ${notification.isRead ? 'border-slate-200 bg-slate-50' : 'border-blue-200 bg-blue-50/60'}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">{notification.title || 'Alert'}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{notification.message}</p>
                              <p className="mt-1 text-[11px] text-slate-400">{formatDisplayDate(notification.createdAt)}</p>
                            </div>
                            {!notification.isRead && (
                              <button
                                type="button"
                                className="btn-secondary !px-2.5 !py-1 text-xs"
                                disabled={markingNotificationId === notification.id}
                                onClick={() => handleMarkNotificationRead(notification.id)}
                              >
                                {markingNotificationId === notification.id ? '...' : 'Mark read'}
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>

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
