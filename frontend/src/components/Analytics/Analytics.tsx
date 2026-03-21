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

const metricCards = [
  { key: 'activeDays', label: 'Active Days', icon: 'calendar_today', colors: 'from-violet-600 to-indigo-600', shadow: 'shadow-violet-500/25' },
  { key: 'currentStreak', label: 'Current Streak', icon: 'local_fire_department', colors: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/25' },
  { key: 'bestStreak', label: 'Best Streak', icon: 'emoji_events', colors: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-400/25' },
  { key: 'consistency', label: 'Consistency', icon: 'ssid_chart', colors: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/25' },
  { key: 'trustScore', label: 'Trust Score', icon: 'verified', colors: 'from-slate-500 to-slate-400', shadow: 'shadow-slate-400/15' },
];

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
    return [
      { key: 'activeDays', value: `${data.consistencyMetrics.activeDays}/${data.consistencyMetrics.totalDays}`, meta: 'Last 30 days' },
      { key: 'currentStreak', value: `${data.consistencyMetrics.currentStreak}`, meta: 'Days in a row' },
      { key: 'bestStreak', value: `${data.consistencyMetrics.longestStreak}`, meta: 'Longest run ever' },
      { key: 'consistency', value: `${data.consistencyMetrics.consistencyRate}%`, meta: 'Execution quality' },
      { key: 'trustScore', value: `${data.trustMetrics.score}`, meta: `${data.trustMetrics.band} confidence` },
    ];
  }, [data]);

  return (
    <>
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Performance Insights</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Consistency, streak quality, trust score, and category distribution.</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">
        {error && data && (
          <div className="rounded-xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>{error}
          </div>
        )}

        {/* Loading skeleton */}
        {!data && loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {[1,2,3,4,5].map((i) => <CardSkeleton key={i} />)}
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
            {/* Metric cards */}
            <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {metrics.map((metric, i) => {
                const card = metricCards.find((c) => c.key === metric.key)!;
                return (
                  <article
                    key={metric.key}
                    className={`group flex flex-col rounded-2xl bg-gradient-to-br ${card.colors} p-5 shadow-lg ${card.shadow} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">{card.label}</p>
                      <span className="material-symbols-outlined text-[18px] text-white/60">{card.icon}</span>
                    </div>
                    <p className="text-3xl font-extrabold leading-none text-white">{metric.value}</p>
                    <p className="mt-2 text-xs font-medium text-white/70">{metric.meta}</p>
                  </article>
                );
              })}
            </section>

            {/* AI Insights */}
            <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30">
                  <span className="material-symbols-outlined text-[20px] text-violet-600 dark:text-violet-400">auto_awesome</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Insights</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Personalized recommendations based on your patterns</p>
                </div>
              </div>
              <div className="grid gap-3">
                {insights.length > 0 ? insights.map((insight, index) => (
                  <div key={`${index}-${insight}`} className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4">
                    <span className="material-symbols-outlined text-[16px] text-violet-500 shrink-0 mt-0.5">lightbulb</span>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{insight}</p>
                  </div>
                )) : (
                  <div className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4">
                    <span className="material-symbols-outlined text-[16px] text-slate-400 shrink-0 mt-0.5">lightbulb</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Keep logging focused sessions to unlock personalized recommendations.</p>
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
    </>
  );
};

export default Analytics;
