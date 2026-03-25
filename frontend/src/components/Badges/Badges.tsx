import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProgress } from '../../store/badgesSlice';
import BadgeGrid from './BadgeGrid';
import EarnedBadges from './EarnedBadges';
import Progress from './Progress';
import Button from '../ui/Button';
import styles from '../Dashboard/Dashboard.module.css';

const VIEWS = [
  { id: 'ALL' as const, label: 'All Badges' },
  { id: 'EARNED' as const, label: 'Earned' },
  { id: 'LOCKED' as const, label: 'Locked' },
];

const Badges: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { badges, earnedBadges, progress, loading, error } = useSelector((state: RootState) => state.badges);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedView, setSelectedView] = useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');

  useEffect(() => { dispatch(fetchProgress()); }, [dispatch]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(badges.map((badge) => badge.category).filter(Boolean))) as string[];
    return ['All', ...values];
  }, [badges]);

  const filteredBadges = useMemo(() => {
    let items = [...badges];
    if (selectedCategory !== 'All') items = items.filter((b) => b.category === selectedCategory);
    if (selectedView === 'EARNED') items = items.filter((b) => b.earned);
    if (selectedView === 'LOCKED') items = items.filter((b) => !b.earned);
    return items;
  }, [badges, selectedCategory, selectedView]);

  const earnedPct = progress.totalCount > 0 ? Math.round((progress.earnedCount / progress.totalCount) * 100) : 0;

  return (
    <>
      <div className={`${styles.dashboardThemeScope} mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8`}>
        {/* Header banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
          <div className="relative">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Your Badges</h2>
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Track earned milestones and unlock your next achievements.</p>
          </div>
        </section>

        {/* Stat cards — dashboard style */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Badges */}
          <div className={`${styles.dashboardStatCard} ${styles.dashboardStatCardViolet} rounded-2xl p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={styles.dashboardStatLabel}>Total Badges</p>
                <p className={styles.dashboardStatValue}>{progress.totalCount}</p>
                <p className={`${styles.dashboardStatSub} ${styles.dashboardStatSubPositive}`}>Available to earn</p>
              </div>
              <div className={`${styles.dashboardStatIconShell} ${styles.dashboardStatIconViolet}`}>
                <span className="material-symbols-outlined text-[20px]">military_tech</span>
              </div>
            </div>
          </div>

          {/* Earned */}
          <div className={`${styles.dashboardStatCard} ${styles.dashboardStatCardAmber} rounded-2xl p-6`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={styles.dashboardStatLabel}>Earned</p>
                <p className={styles.dashboardStatValue}>{progress.earnedCount}</p>
                <p className={`${styles.dashboardStatSub} ${styles.dashboardStatSubWarm}`}>{earnedPct}% complete</p>
              </div>
              <div className={`${styles.dashboardStatIconShell} ${styles.dashboardStatIconAmber}`}>
                <span className="material-symbols-outlined text-[20px]">emoji_events</span>
              </div>
            </div>
          </div>

          {/* Progress card */}
          <Progress earnedCount={progress.earnedCount} totalCount={progress.totalCount} />
        </section>

        {/* Filter controls */}
        <section className={`${styles.dashboardPanelCard} rounded-2xl p-5`}>
          <div className="mb-4 flex flex-wrap gap-2">
            {VIEWS.map((view) => (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-150 ${
                  selectedView === view.id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                  selectedCategory === category
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                    : 'border border-[var(--ff-dashboard-card-border,var(--ff-border))] text-[var(--ff-dashboard-text-soft,var(--ff-text-700))] hover:text-[var(--ff-dashboard-text,var(--ff-text-900))]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className={`${styles.dashboardPanelCard} flex justify-center rounded-2xl py-16`}>
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--ff-dashboard-track,var(--ff-border))] border-t-violet-500" />
          </div>
        )}

        {error && !loading && (
          <div className={`${styles.dashboardPanelCard} rounded-2xl p-5`}>
            <p className="text-sm text-red-400">{error}</p>
            <Button variant="primary" className="mt-3" onClick={() => dispatch(fetchProgress())}>Retry</Button>
          </div>
        )}

        {!loading && !error && <BadgeGrid badges={filteredBadges} />}

        <section>
          <EarnedBadges badges={earnedBadges} />
        </section>
      </div>
    </>
  );
};

export default Badges;
