import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAnalytics } from '../../store/analyticsSlice';
import CategoryBreakdown from './CategoryBreakdown';
import DailyChart from './DailyChart';
import TrendAnalysis from './TrendAnalysis';
import WeeklyChart from './WeeklyChart';
import EmptyState from '../ui/EmptyState';
import { CardSkeleton } from '../ui/Skeleton';
import styles from '../Dashboard/Dashboard.module.css';
import './Analytics.css';

const METRIC_CONFIG = [
  { key: 'activeDays', label: 'Active Days', icon: 'calendar_today', cardClass: 'dashboardStatCardViolet' as const, iconClass: 'dashboardStatIconViolet' as const, subColor: 'dashboardStatSubPositive' as const },
  { key: 'currentStreak', label: 'Current Streak', icon: 'local_fire_department', cardClass: 'dashboardStatCardAmber' as const, iconClass: 'dashboardStatIconAmber' as const, subColor: 'dashboardStatSubWarm' as const },
  { key: 'bestStreak', label: 'Best Streak', icon: 'emoji_events', cardClass: 'dashboardStatCardAmber' as const, iconClass: 'dashboardStatIconAmber' as const, subColor: 'dashboardStatSubWarm' as const },
  { key: 'consistency', label: 'Consistency', icon: 'ssid_chart', cardClass: 'dashboardStatCardEmerald' as const, iconClass: 'dashboardStatIconEmerald' as const, subColor: 'dashboardStatSubPositive' as const },
  { key: 'trustScore', label: 'Trust Score', icon: 'verified', cardClass: 'dashboardStatCardViolet' as const, iconClass: 'dashboardStatIconViolet' as const, subColor: 'dashboardStatSubPositive' as const },
];

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.analytics);

  useEffect(() => { dispatch(fetchAnalytics()); }, [dispatch]);

  const insights = useMemo(
    () => (data?.insights || []).filter((e) => typeof e === 'string' && e.trim().length > 0),
    [data?.insights]
  );

  const metrics = useMemo(() => {
    if (!data) return [];

    const activeDaysPct = data.consistencyMetrics.totalDays > 0
      ? (data.consistencyMetrics.activeDays / data.consistencyMetrics.totalDays) * 100
      : 0;
    const currentStreakPct = data.consistencyMetrics.longestStreak > 0
      ? (data.consistencyMetrics.currentStreak / data.consistencyMetrics.longestStreak) * 100
      : data.consistencyMetrics.currentStreak > 0 ? 25 : 0;

    return [
      {
        key: 'activeDays',
        value: `${data.consistencyMetrics.activeDays}/${data.consistencyMetrics.totalDays}`,
        meta: 'Last 30 days',
        progress: clampPercent(activeDaysPct),
      },
      {
        key: 'currentStreak',
        value: `${data.consistencyMetrics.currentStreak}`,
        meta: 'Days in a row',
        progress: clampPercent(currentStreakPct),
      },
      {
        key: 'bestStreak',
        value: `${data.consistencyMetrics.longestStreak}`,
        meta: 'Longest run ever',
        progress: 100,
      },
      {
        key: 'consistency',
        value: `${data.consistencyMetrics.consistencyRate}%`,
        meta: 'Execution quality',
        progress: clampPercent(data.consistencyMetrics.consistencyRate),
      },
      {
        key: 'trustScore',
        value: `${data.trustMetrics.score}`,
        meta: `${data.trustMetrics.band} confidence`,
        progress: clampPercent(data.trustMetrics.score),
      },
    ];
  }, [data]);

  return (
    <div className={`${styles.dashboardThemeScope} ff-analytics-page`}>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">
        {/* Header banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Performance Insights</h2>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Consistency, streak quality, trust score, and category distribution.</p>
          </div>
        </section>

        {error && data && (
          <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>{error}
          </div>
        )}

        {/* Loading skeleton */}
        {!data && loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {[1, 2, 3, 4, 5].map((i) => <CardSkeleton key={i} />)}
            </div>
            <CardSkeleton />
          </div>
        )}

        {!data && !loading && error && (
          <EmptyState icon="error" title="Analytics Failed To Load" description={error}
            actionLabel="Retry" onAction={() => dispatch(fetchAnalytics())} />
        )}

        {!data && !loading && !error && (
          <EmptyState
            icon="monitoring"
            title="No Analytics Data Yet"
            description="Log activity for a few days and come back to see your performance insights."
            actionLabel="Refresh"
            onAction={() => dispatch(fetchAnalytics())}
          />
        )}

        {data && (
          <>
            {/* Metric cards — dashboard style */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {metrics.map((metric, i) => {
                const cfg = METRIC_CONFIG.find((c) => c.key === metric.key)!;
                return (
                  <div
                    key={metric.key}
                    className={`${styles.dashboardStatCard} ${styles[cfg.cardClass]} ff-analytics-metric-hover rounded-2xl p-5`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className={styles.dashboardStatLabel}>{cfg.label}</p>
                      <div className={`${styles.dashboardStatIconShell} ${styles[cfg.iconClass]}`}>
                        <span className="material-symbols-outlined text-[18px]">{cfg.icon}</span>
                      </div>
                    </div>
                    <p className={styles.dashboardStatValue}>{metric.value}</p>
                    <p className={`${styles.dashboardStatSub} ${styles[cfg.subColor]}`}>{metric.meta}</p>
                    <div className={`${styles.dashboardGoalTrack} mt-4`}>
                      <div
                        className={styles.dashboardGoalFill}
                        style={{ width: `${Math.max(8, metric.progress)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </section>

            {/* AI Insights */}
            <section className={`${styles.dashboardPanelCard} rounded-2xl p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`${styles.dashboardStatIconShell} ${styles.dashboardStatIconViolet}`}>
                  <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${styles.dashboardGoalTitle}`}>AI Insights</h2>
                  <p className={`text-xs ${styles.dashboardGoalMeta}`}>Personalized recommendations based on your patterns</p>
                </div>
              </div>
              <div className="grid gap-3">
                {insights.length > 0 ? insights.map((insight, index) => (
                  <div key={`${index}-${insight}`} className={`${styles.dashboardGoalCard} flex items-start gap-3 rounded-xl p-4`}>
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5" style={{ color: '#a78bfa' }}>lightbulb</span>
                    <p className={`text-sm leading-relaxed ${styles.dashboardGoalMeta}`}>{insight}</p>
                  </div>
                )) : (
                  <div className={`${styles.dashboardGoalCard} flex items-start gap-3 rounded-xl p-4`}>
                    <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5" style={{ color: 'var(--ff-dashboard-text-muted, var(--ff-text-500))' }}>lightbulb</span>
                    <p className={`text-sm ${styles.dashboardGoalMeta}`}>Keep logging focused sessions to unlock personalized recommendations.</p>
                  </div>
                )}
              </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <WeeklyChart data={data.weeklyProgress} />
              <CategoryBreakdown data={data.categoryBreakdown} />
              <DailyChart data={data.weeklyHeatmap} />
              <TrendAnalysis monthlyTrends={data.monthlyTrends} streakHistory={data.streakHistory} />
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
