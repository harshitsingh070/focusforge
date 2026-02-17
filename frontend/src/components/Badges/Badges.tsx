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
          <h1 className="section-title">Your Badges</h1>
          <p className="section-subtitle">Track earned milestones and lock in your next unlocks.</p>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="card border-transparent text-white" style={{ background: 'linear-gradient(135deg,#1D4ED8,#0EA5E9)' }}>
            <p className="text-sm font-semibold text-white/80">Total Badges</p>
            <p className="mt-2 text-6xl font-black">{progress.totalCount}</p>
            <div className="mt-4 h-1.5 rounded-full bg-white/20">
              <span className="block h-full rounded-full bg-white/80" style={{ width: '56%' }} />
            </div>
          </div>

          <div className="card border-transparent text-white" style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316,#FB7185)' }}>
            <p className="text-sm font-semibold text-white/80">Earned</p>
            <p className="mt-2 text-6xl font-black">{progress.earnedCount}</p>
            <div className="mt-4 h-1.5 rounded-full bg-white/20">
              <span className="block h-full rounded-full bg-white/80" style={{ width: '48%' }} />
            </div>
          </div>

          <Progress earnedCount={progress.earnedCount} totalCount={progress.totalCount} />
        </section>

        <section className="card mb-6">
          <div className="mb-4 flex flex-wrap gap-2">
            {(['ALL', 'EARNED', 'LOCKED'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  selectedView === view ? 'bg-slate-900 text-white' : 'border border-slate-200 bg-white text-gray-700'
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
                    ? 'bg-slate-100 text-slate-900'
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
