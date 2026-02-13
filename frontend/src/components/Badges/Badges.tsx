import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchProgress } from '../../store/badgesSlice';
import Navbar from '../Layout/Navbar';
import BadgeGrid from './BadgeGrid';
import EarnedBadges from './EarnedBadges';
import Progress from './Progress';

const Badges: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { badges, earnedBadges, progress, loading, error } = useSelector((state: RootState) => state.badges);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedView, setSelectedView] = useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');

  useEffect(() => {
    dispatch(fetchProgress());
  }, [dispatch]);

  const categories = useMemo(() => {
    const values = Array.from(new Set(badges.map((badge) => badge.category).filter(Boolean))) as string[];
    return ['All', ...values];
  }, [badges]);

  const filteredBadges = useMemo(() => {
    let items = [...badges];

    if (selectedCategory !== 'All') {
      items = items.filter((badge) => badge.category === selectedCategory);
    }

    if (selectedView === 'EARNED') {
      items = items.filter((badge) => badge.earned);
    }

    if (selectedView === 'LOCKED') {
      items = items.filter((badge) => !badge.earned);
    }

    return items;
  }, [badges, selectedCategory, selectedView]);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <p className="status-chip">Achievements</p>
          <h1 className="section-title mt-3">Badges</h1>
          <p className="section-subtitle">Track unlocked milestones and what to target next.</p>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="card border-indigo-200 bg-gradient-to-br from-indigo-50 to-white">
            <p className="text-sm font-semibold text-ink-muted">Total Badges</p>
            <p className="mt-2 text-3xl font-black text-indigo-700">{progress.totalCount}</p>
          </div>

          <div className="card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-sm font-semibold text-ink-muted">Earned</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{progress.earnedCount}</p>
          </div>

          <Progress earnedCount={progress.earnedCount} totalCount={progress.totalCount} />
        </section>

        <section className="card mb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {(['ALL', 'EARNED', 'LOCKED'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  selectedView === view ? 'bg-primary-600 text-white' : 'border border-slate-200 bg-white text-gray-700'
                }`}
              >
                {view === 'ALL' ? 'All' : view === 'EARNED' ? 'Earned' : 'Locked'}
              </button>
            ))}
          </div>

          <div className="scrollbar-soft flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  selectedCategory === category
                    ? 'bg-primary-100 text-primary-700'
                    : 'border border-slate-200 bg-white text-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className="card">
            <div className="flex justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="card border-red-200 bg-red-50">
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={() => dispatch(fetchProgress())} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && <BadgeGrid badges={filteredBadges} />}

        <section className="mt-6">
          <EarnedBadges badges={earnedBadges} />
        </section>
      </main>
    </div>
  );
};

export default Badges;
