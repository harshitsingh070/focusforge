import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAdminEmail } from '../../constants/admin';
import { AppDispatch, RootState } from '../../store';
import { fetchAnalytics } from '../../store/analyticsSlice';
import CategoryBreakdown from './CategoryBreakdown';
import DailyChart from './DailyChart';
import TrendAnalysis from './TrendAnalysis';
import WeeklyChart from './WeeklyChart';

const baseNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/goals', label: 'Goals', icon: 'track_changes' },
  { to: '/activity', label: 'Activity', icon: 'event_note' },
  { to: '/analytics', label: 'Analytics', icon: 'monitoring' },
  { to: '/badges', label: 'Badges', icon: 'military_tech' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
  { to: '/rules', label: 'Rules', icon: 'gavel' },
];

const metricCards = [
  { key: 'activeDays', label: 'Active Days', icon: 'calendar_today', colors: 'from-violet-600 to-indigo-600', shadow: 'shadow-violet-500/25' },
  { key: 'currentStreak', label: 'Current Streak', icon: 'local_fire_department', colors: 'from-orange-500 to-red-500', shadow: 'shadow-orange-500/25' },
  { key: 'bestStreak', label: 'Best Streak', icon: 'emoji_events', colors: 'from-amber-500 to-yellow-400', shadow: 'shadow-amber-400/25' },
  { key: 'consistency', label: 'Consistency', icon: 'ssid_chart', colors: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/25' },
  { key: 'trustScore', label: 'Trust Score', icon: 'verified', colors: 'from-slate-500 to-slate-400', shadow: 'shadow-slate-400/15' },
];

const getInitials = (value: string) => {
  const tokens = (value || '').split(/[\s@._-]+/).filter(Boolean).slice(0, 2);
  return tokens.length === 0 ? 'FF' : tokens.map((t) => t[0]?.toUpperCase() || '').join('');
};

const isActiveNav = (pathname: string, route: string) =>
  pathname === route || (route !== '/dashboard' && pathname.startsWith(route));

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { data, loading, error } = useSelector((state: RootState) => state.analytics);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  const displayName = [user?.username, user?.email, 'FocusForge User'].find(
    (c) => typeof c === 'string' && c.trim().length > 0
  ) as string;
  const initials = getInitials(displayName);
  const navItems = isAdminEmail(user?.email)
    ? [...baseNavItems, { to: '/admin', label: 'Admin', icon: 'shield_person' }]
    : baseNavItems;

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
    <div className="ff-page-enter min-h-screen bg-slate-50 dark:bg-slate-950 [font-family:'Inter',sans-serif]">
      <div className="flex h-screen overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="hidden w-[260px] flex-shrink-0 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:flex">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 shadow-md shadow-violet-500/30">
                <span className="text-sm font-bold text-white">FF</span>
              </div>
              <h1 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">FocusForge</h1>
            </div>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = isActiveNav(location.pathname, item.to);
                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ${
                      active
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-sm">
              {initials}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-slate-800 bg-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{displayName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">Pro Member</p>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          {/* Sticky header */}
          <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-4 sm:px-8 shadow-sm">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Performance Insights</h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Consistency, streak quality, trust score, and category distribution.</p>
              </div>
            </div>
          </header>

          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">

            {error && data && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* Loading / Empty States */}
            {!data && loading && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-20 text-center shadow-sm">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-violet-500 mb-4" />
                <p className="text-base font-semibold text-slate-900 dark:text-white">Loading Performance Insights</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Crunching consistency, streak quality, and trust score trends.</p>
              </div>
            )}

            {!data && !loading && error && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-20 text-center shadow-sm">
                <span className="material-symbols-outlined mb-4 text-4xl text-red-400">error</span>
                <p className="text-base font-semibold text-slate-900 dark:text-white">Analytics Failed To Load</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{error}</p>
                <button
                  type="button"
                  onClick={() => dispatch(fetchAnalytics())}
                  className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-violet-500 hover:to-purple-500 transition-all duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {!data && !loading && !error && (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-20 text-center shadow-sm">
                <span className="material-symbols-outlined mb-4 text-4xl text-slate-300 dark:text-slate-600">monitoring</span>
                <p className="text-base font-semibold text-slate-900 dark:text-white">No Analytics Data Yet</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-xs">Log activity for a few days and come back to see your performance insights.</p>
                <button
                  type="button"
                  onClick={() => dispatch(fetchAnalytics())}
                  className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-violet-500 hover:to-purple-500 transition-all duration-200"
                >
                  Refresh
                </button>
              </div>
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
                <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
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
                    {insights.length > 0 ? (
                      insights.map((insight, index) => (
                        <div key={`${index}-${insight}`} className="flex items-start gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 p-4">
                          <span className="material-symbols-outlined text-[16px] text-violet-500 shrink-0 mt-0.5">lightbulb</span>
                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{insight}</p>
                        </div>
                      ))
                    ) : (
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
        </main>
      </div>
    </div>
  );
};

export default Analytics;
