import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import Navbar from '../Layout/Navbar';

type BadgeItem = {
  id: number;
  name: string;
  description: string;
  category?: string;
  iconUrl?: string;
  pointsBonus?: number;
  earned?: boolean;
  earnedAt?: string;
  earnedReason?: string;
  currentValue?: number;
  requiredValue?: number;
  progressPercentage?: number;
  ruleText?: string;
};

type BadgeResponse = {
  badges?: BadgeItem[];
  badgesByCategory?: Record<string, BadgeItem[]>;
  totalCount?: number;
  earnedCount?: number;
};

const Badges: React.FC = () => {
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedView, setSelectedView] = useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');

  const loadBadges = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/badges/all');
      const data = (response.data || {}) as BadgeResponse;
      setBadges(data.badges || []);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadges();
  }, []);

  const categories = useMemo(() => {
    const values = Array.from(new Set(badges.map((badge) => badge.category).filter(Boolean))) as string[];
    return ['All', ...values];
  }, [badges]);

  const earnedCount = useMemo(() => badges.filter((badge) => badge.earned).length, [badges]);

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
            <p className="mt-2 text-3xl font-black text-indigo-700">{badges.length}</p>
          </div>

          <div className="card border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-sm font-semibold text-ink-muted">Earned</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{earnedCount}</p>
          </div>

          <div className="card border-amber-200 bg-gradient-to-br from-amber-50 to-white sm:col-span-2 xl:col-span-1">
            <p className="text-sm font-semibold text-ink-muted">Completion</p>
            <p className="mt-2 text-3xl font-black text-amber-700">
              {badges.length ? Math.round((earnedCount * 100) / badges.length) : 0}%
            </p>
          </div>
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
            <button onClick={loadBadges} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredBadges.length === 0 && (
          <div className="card text-center">
            <p className="text-ink-muted">No badges found for this filter.</p>
          </div>
        )}

        {!loading && !error && filteredBadges.length > 0 && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredBadges.map((badge) => {
              const progress = Math.max(0, Math.min(100, badge.progressPercentage || 0));

              return (
                <article
                  key={badge.id}
                  className={`card overflow-hidden ${
                    badge.earned
                      ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                      : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{badge.category || 'General'}</p>
                      <h3 className="mt-1 break-words font-display text-lg font-bold text-gray-900">{badge.name}</h3>
                    </div>
                    <span className={`status-chip ${badge.earned ? '' : 'warn'}`}>{badge.earned ? 'Earned' : 'In progress'}</span>
                  </div>

                  <p className="text-sm text-gray-700">{badge.description}</p>

                  {badge.ruleText && <p className="mt-2 text-xs text-ink-muted">Rule: {badge.ruleText}</p>}

                  {badge.earned ? (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-100/70 p-3">
                      <p className="text-sm font-semibold text-emerald-800">Unlocked</p>
                      {badge.earnedReason && <p className="mt-1 text-xs text-emerald-700">{badge.earnedReason}</p>}
                      {badge.pointsBonus ? <p className="mt-1 text-xs text-emerald-700">Bonus: +{badge.pointsBonus} points</p> : null}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                        <span>
                          {badge.currentValue || 0} / {badge.requiredValue || '-'}
                        </span>
                        <span className="font-semibold">{Math.round(progress)}%</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div className="h-2.5 rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default Badges;
