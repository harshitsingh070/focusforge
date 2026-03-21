import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProgress } from '../../store/badgesSlice';
import BadgeGrid from './BadgeGrid';
import EarnedBadges from './EarnedBadges';
import Progress from './Progress';
import Button from '../ui/Button';

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
      <header className="sticky top-0 z-20 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 py-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Your Badges</h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Track earned milestones and unlock your next achievements.</p>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Total Badges</p>
            <p className="mt-2 text-5xl font-black text-white">{progress.totalCount}</p>
            <div className="mt-4 h-1.5 rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white/70 transition-all duration-700" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 p-6 shadow-lg shadow-orange-400/25 transition-all duration-200 hover:-translate-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Earned</p>
            <p className="mt-2 text-5xl font-black text-white">{progress.earnedCount}</p>
            <div className="mt-4 h-1.5 rounded-full bg-white/20">
              <div className="h-full rounded-full bg-white/70 transition-all duration-700" style={{ width: `${earnedPct}%` }} />
            </div>
          </div>
          <Progress earnedCount={progress.earnedCount} totalCount={progress.totalCount} />
        </section>

        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
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
                    : 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className="flex justify-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 shadow-sm">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-violet-500" />
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-5">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
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
