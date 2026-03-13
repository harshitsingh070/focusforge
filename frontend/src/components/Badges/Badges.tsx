import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAdminEmail } from '../../constants/admin';
import { AppDispatch, RootState } from '../../store';
import { fetchProgress } from '../../store/badgesSlice';
import BadgeGrid from './BadgeGrid';
import EarnedBadges from './EarnedBadges';
import Progress from './Progress';

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

const VIEWS = [
  { id: 'ALL' as const, label: 'All Badges' },
  { id: 'EARNED' as const, label: 'Earned' },
  { id: 'LOCKED' as const, label: 'Locked' },
];

const getInitials = (value: string) => {
  const tokens = (value || '').split(/[\s@._-]+/).filter(Boolean).slice(0, 2);
  return tokens.length === 0 ? 'FF' : tokens.map((t) => t[0]?.toUpperCase() || '').join('');
};

const isActiveNav = (pathname: string, route: string) =>
  pathname === route || (route !== '/dashboard' && pathname.startsWith(route));

const Badges: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { badges, earnedBadges, progress, loading, error } = useSelector((state: RootState) => state.badges);
  const { user } = useSelector((state: RootState) => state.auth);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedView, setSelectedView] = useState<'ALL' | 'EARNED' | 'LOCKED'>('ALL');

  useEffect(() => {
    dispatch(fetchProgress());
  }, [dispatch]);

  const displayName = [user?.username, user?.email, 'FocusForge User'].find(
    (c) => typeof c === 'string' && c.trim().length > 0
  ) as string;
  const initials = getInitials(displayName);
  const navItems = isAdminEmail(user?.email)
    ? [...baseNavItems, { to: '/admin', label: 'Admin', icon: 'shield_person' }]
    : baseNavItems;

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

  const earnedPct = progress.totalCount > 0
    ? Math.round((progress.earnedCount / progress.totalCount) * 100)
    : 0;

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
          {/* Sticky Header */}
          <header className="sticky top-0 z-20 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-4 sm:px-8 shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Your Badges</h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Track earned milestones and unlock your next achievements.</p>
          </header>

          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">

            {/* Stat Cards */}
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Total Badges */}
              <div className="flex flex-col rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 p-6 shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Total Badges</p>
                <p className="mt-2 text-5xl font-black text-white">{progress.totalCount}</p>
                <div className="mt-4 h-1.5 rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white/70 transition-all duration-700" style={{ width: '100%' }} />
                </div>
              </div>

              {/* Earned */}
              <div className="flex flex-col rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-pink-500 p-6 shadow-lg shadow-orange-400/25 transition-all duration-200 hover:-translate-y-0.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-white/70">Earned</p>
                <p className="mt-2 text-5xl font-black text-white">{progress.earnedCount}</p>
                <div className="mt-4 h-1.5 rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-white/70 transition-all duration-700" style={{ width: `${earnedPct}%` }} />
                </div>
              </div>

              {/* Progress Card */}
              <Progress earnedCount={progress.earnedCount} totalCount={progress.totalCount} />
            </section>

            {/* Filters */}
            <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              {/* View tabs */}
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

              {/* Category chips */}
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

            {/* Loading */}
            {loading && (
              <div className="flex justify-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-16 shadow-sm">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-violet-500" />
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-5">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                <button
                  onClick={() => dispatch(fetchProgress())}
                  className="mt-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-purple-500"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Badge Grid */}
            {!loading && !error && <BadgeGrid badges={filteredBadges} />}

            {/* Earned Badges Timeline */}
            <section>
              <EarnedBadges badges={earnedBadges} />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Badges;
