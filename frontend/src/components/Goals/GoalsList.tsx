import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoals } from '../../store/goalsSlice';
import { Goal } from '../../types';

type GoalTab = 'ACTIVE' | 'ALL' | 'COMPLETED' | 'ARCHIVED';
type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

interface GoalWithMeta extends Goal {
  progressPercent: number;
  completed: boolean;
  difficultyLevel: DifficultyLevel;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/goals', label: 'Goals', icon: 'track_changes' },
  { to: '/analytics', label: 'Statistics', icon: 'monitoring' },
  { to: '/badges', label: 'Badges', icon: 'military_tech' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
];

const TAB_ITEMS: Array<{ id: GoalTab; label: string }> = [
  { id: 'ACTIVE', label: 'Active' },
  { id: 'ALL', label: 'All Goals' },
  { id: 'COMPLETED', label: 'Completed' },
  { id: 'ARCHIVED', label: 'Archived' },
];

const fallbackGoalColors = ['#8B5CF6', '#7C3AED', '#3B82F6', '#22C55E'];

const DIFFICULTY_STYLE: Record<DifficultyLevel, { background: string; color: string; border: string }> = {
  Easy: {
    background: 'rgba(34, 197, 94, 0.12)',
    color: '#16A34A',
    border: 'rgba(34, 197, 94, 0.35)',
  },
  Medium: {
    background: 'rgba(245, 158, 11, 0.12)',
    color: '#D97706',
    border: 'rgba(245, 158, 11, 0.35)',
  },
  Hard: {
    background: 'rgba(239, 68, 68, 0.12)',
    color: '#DC2626',
    border: 'rgba(239, 68, 68, 0.35)',
  },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getInitials = (value: string) => {
  const tokens = (value || '')
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (tokens.length === 0) {
    return 'FF';
  }

  return tokens.map((token) => token[0]?.toUpperCase() || '').join('');
};

const estimateProgress = (goal: Goal): number => {
  const streakBase = goal.longestStreak > 0 ? goal.currentStreak / goal.longestStreak : goal.currentStreak > 0 ? 0.55 : 0;
  const targetScore = clamp((goal.dailyMinimumMinutes || 0) / 90, 0, 1);
  const difficultyScore = clamp((goal.difficulty || 1) / 5, 0.2, 1);

  const weighted = streakBase * 0.58 + targetScore * 0.27 + difficultyScore * 0.15;
  let progress = Math.round(weighted * 100);

  if (!goal.isActive) {
    progress = Math.max(progress, 70);
  }

  return clamp(progress, 0, 100);
};

const getDifficultyLevel = (difficulty: number): DifficultyLevel => {
  if (difficulty <= 2) {
    return 'Easy';
  }
  if (difficulty === 3) {
    return 'Medium';
  }
  return 'Hard';
};

const isActiveNav = (pathname: string, route: string) => pathname === route || (route !== '/dashboard' && pathname.startsWith(route));

const GoalsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();

  const { goals, loading, error } = useSelector((state: RootState) => state.goals);
  const { user } = useSelector((state: RootState) => state.auth);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<GoalTab>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Refresh goals every time this page is visited so archive changes are reflected
  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch, location.pathname]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  const displayName = [user?.username, user?.email, 'FocusForge User'].find(
    (candidate) => typeof candidate === 'string' && candidate.trim().length > 0
  ) as string;
  const initials = getInitials(displayName);

  const goalsWithMeta = useMemo<GoalWithMeta[]>(
    () =>
      goals.map((goal) => {
        const progressPercent = estimateProgress(goal);
        return {
          ...goal,
          progressPercent,
          completed: progressPercent >= 90,
          difficultyLevel: getDifficultyLevel(Math.max(1, Math.min(goal.difficulty || 1, 5))),
        };
      }),
    [goals]
  );

  // Unique category list derived from all goals
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(goalsWithMeta.map((g) => g.category).filter(Boolean))) as string[];
    return cats.sort();
  }, [goalsWithMeta]);

  const filteredGoals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return goalsWithMeta.filter((goal) => {
      const matchesTab =
        activeTab === 'ALL' ||
        (activeTab === 'ACTIVE' && goal.isActive && !goal.completed) ||
        (activeTab === 'COMPLETED' && goal.completed) ||
        (activeTab === 'ARCHIVED' && !goal.isActive);

      if (!matchesTab) return false;

      if (categoryFilter !== 'ALL' && goal.category !== categoryFilter) return false;

      if (!query) return true;

      return [goal.title, goal.description, goal.category].some((field) => field?.toLowerCase().includes(query));
    });
  }, [activeTab, categoryFilter, goalsWithMeta, searchQuery]);

  return (
    <div className="min-h-screen bg-[var(--ff-bg)] [background-image:var(--ff-gradient-bg-light),var(--ff-gradient-highlight)] text-[var(--ff-text-900)] [font-family:'Inter',sans-serif] dark:[background-image:var(--ff-gradient-bg-dark)]">
      <div className="flex h-screen overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="hidden w-[260px] flex-shrink-0 flex-col justify-between border-r border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-4 shadow-e1 md:flex">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2">
              <div className="rounded-[10px] bg-[var(--ff-primary-100)] p-2 dark:bg-[var(--ff-primary-900)]/40">
                <span className="material-symbols-outlined text-2xl text-[var(--ff-primary)]">auto_awesome</span>
              </div>
              <div className="overflow-hidden">
                <h1 className="truncate text-lg font-bold tracking-tight text-[var(--ff-text-900)]">FocusForge</h1>
                <p className="text-xs font-medium text-[var(--ff-text-700)]">Dashboard</p>
              </div>
            </div>

            <nav className="mt-4 flex flex-col gap-2">
              {navItems.map((item) => {
                const active = isActiveNav(location.pathname, item.to);

                return (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => navigate(item.to)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${active
                      ? 'border border-[var(--ff-primary)] bg-[var(--ff-primary)] text-white'
                      : 'text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)] hover:text-[var(--ff-text-900)]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto flex items-center gap-3 rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--ff-surface-hover)] text-xs font-bold text-[var(--ff-text-900)]">
              {initials}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[var(--ff-surface-elevated)] bg-[#22C55E]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--ff-text-900)]">{displayName}</p>
              <p className="truncate text-xs text-[var(--ff-text-700)]">Pro Member</p>
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          {/* Sticky page header */}
          <header className="sticky top-0 z-20 bg-[var(--ff-surface-elevated)]/95 px-6 py-4 backdrop-blur-md sm:px-8">
            {/* Row 1: title + actions */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Mobile hamburger */}
              <button
                type="button"
                onClick={() => setMobileNavOpen((c) => !c)}
                className="rounded-[10px] border border-[var(--ff-border)] p-2 text-[var(--ff-text-700)] transition-colors hover:bg-[var(--ff-surface-hover)] md:hidden"
                aria-label="Toggle navigation"
              >
                <span className="material-symbols-outlined text-[20px]">menu</span>
              </button>

              {/* Title */}
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold tracking-tight text-[var(--ff-text-900)]">My Goals</h2>
                <p className="mt-0.5 text-sm text-[var(--ff-text-700)]">Track your progress and crush your targets.</p>
              </div>

              {/* Search + New Goal */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--ff-text-500)]">
                    search
                  </span>
                  <input
                    id="goals-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search goals..."
                    className="w-52 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] py-2 pl-10 pr-3 text-sm text-[var(--ff-text-900)] outline-none transition-all duration-fast ease-premium placeholder:text-[var(--ff-text-500)] focus:border-[rgba(var(--ff-primary-rgb),0.55)] focus:w-64"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/goals/new')}
                  className="flex items-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-e1 transition-[transform,filter,box-shadow] duration-normal ease-premium hover:scale-[1.02] hover:brightness-105 hover:shadow-hover"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  New Goal
                </button>
              </div>
            </div>

            {/* Row 2: Filter tabs + category dropdown */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {TAB_ITEMS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors duration-fast ease-premium ${activeTab === tab.id
                      ? 'bg-[var(--ff-primary)] text-white shadow-e1'
                      : 'bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)] hover:text-[var(--ff-text-900)]'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Category dropdown */}
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--ff-text-500)]">
                  category
                </span>
                <select
                  id="goals-category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] py-1.5 pl-9 pr-8 text-sm font-medium text-[var(--ff-text-900)] outline-none transition-colors duration-fast ease-premium focus:border-[rgba(var(--ff-primary-rgb),0.55)] cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[var(--ff-text-500)]">
                  expand_more
                </span>
              </div>
            </div>
          </header>

          {/* Mobile nav drawer */}
          {mobileNavOpen && (
            <div className="border-b border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-3 shadow-e1 md:hidden">
              <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const active = isActiveNav(location.pathname, item.to);
                  return (
                    <button
                      key={item.to}
                      type="button"
                      onClick={() => navigate(item.to)}
                      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${active
                        ? 'bg-[var(--ff-primary)] font-semibold text-white'
                        : 'bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Content area ── */}
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-6 sm:p-8">
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-600 dark:text-rose-300">
                {error}
              </div>
            )}

            {/* ── Summary stats ── */}
            {!loading && (
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    icon: 'track_changes',
                    label: 'Total Goals',
                    value: goalsWithMeta.length,
                    accent: 'var(--ff-primary)',
                    bg: 'rgba(124,58,237,0.08)',
                  },
                  {
                    icon: 'check_circle',
                    label: 'Completed',
                    value: goalsWithMeta.filter((g) => g.completed).length,
                    accent: '#16A34A',
                    bg: 'rgba(34,197,94,0.08)',
                  },
                  {
                    icon: 'local_fire_department',
                    label: 'Best Streak',
                    value: `${Math.max(0, ...goalsWithMeta.map((g) => g.currentStreak))} days`,
                    accent: '#D97706',
                    bg: 'rgba(245,158,11,0.08)',
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-4 rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] px-5 py-4 shadow-e1"
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: stat.bg }}
                    >
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ color: stat.accent }}
                      >
                        {stat.icon}
                      </span>
                    </div>
                    <div>
                      <p className="text-[22px] font-bold leading-none text-[var(--ff-text-900)]">{stat.value}</p>
                      <p className="mt-1 text-xs font-medium text-[var(--ff-text-500)]">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--ff-border)] border-t-[var(--ff-primary)]" />
              </div>
            ) : (
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredGoals.map((goal, index) => {
                  const difficultyStyle = DIFFICULTY_STYLE[goal.difficultyLevel];
                  const categoryColor = goal.categoryColor?.trim() || fallbackGoalColors[index % fallbackGoalColors.length];
                  const progressDegrees = goal.progressPercent * 3.6;

                  const categoryPillStyle: React.CSSProperties = {
                    color: categoryColor,
                    backgroundColor: `${categoryColor}22`,
                    borderColor: `${categoryColor}55`,
                  };

                  return (
                    <article
                      key={goal.id}
                      className="flex h-full flex-col rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2 transition-all duration-normal ease-premium hover:border-[rgba(124,58,237,0.45)] hover:shadow-glow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="line-clamp-2 text-lg font-bold text-[var(--ff-text-900)]">{goal.title}</h4>
                          <div className="mt-2.5 flex flex-wrap gap-2">
                            <span
                              className="rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide"
                              style={categoryPillStyle}
                            >
                              {goal.category || 'General'}
                            </span>
                            <span className="rounded-full border border-orange-300/50 bg-orange-50 px-3 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                              🔥 {Math.max(goal.currentStreak, 0)} Day Streak
                            </span>
                            <span
                              className="rounded-full border px-3 py-0.5 text-xs font-semibold"
                              style={{
                                backgroundColor: difficultyStyle.background,
                                color: difficultyStyle.color,
                                borderColor: difficultyStyle.border,
                              }}
                            >
                              {goal.difficultyLevel}
                            </span>
                          </div>
                        </div>

                        {/* Progress ring */}
                        <div className="relative h-14 w-14 shrink-0">
                          <div
                            className="h-14 w-14 rounded-full"
                            style={{
                              background: `conic-gradient(var(--ff-primary) ${progressDegrees}deg, var(--ff-surface-hover) 0deg)`,
                            }}
                          />
                          <div className="absolute inset-[4px] rounded-full bg-[var(--ff-surface-elevated)]" />
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--ff-text-900)]">
                            {goal.progressPercent}%
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 line-clamp-2 flex-1 text-sm text-[var(--ff-text-700)]">
                        {goal.description?.trim() || 'No goal description provided.'}
                      </p>
                      <p className="mt-1.5 text-xs text-[var(--ff-text-500)]">
                        Daily target:{' '}
                        <span className="font-medium text-[var(--ff-text-700)]">{Math.max(goal.dailyMinimumMinutes, 0)} min</span>
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <Link
                          to={`/goals/${goal.id}`}
                          className="inline-flex items-center justify-center rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ff-text-900)] transition-[background-color] duration-normal ease-premium hover:bg-[var(--ff-surface-hover)]"
                        >
                          Details
                        </Link>
                        <button
                          type="button"
                          onClick={() => navigate(`/goals/${goal.id}/log`)}
                          disabled={!goal.isActive}
                          className="inline-flex items-center justify-center rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-e1 transition-[transform,filter,box-shadow] duration-normal ease-premium hover:brightness-105 hover:shadow-hover disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Update Progress
                        </button>
                      </div>
                    </article>
                  );
                })}

                {filteredGoals.length === 0 && (
                  <article className="col-span-full rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-12 text-center shadow-e2">
                    <span className="material-symbols-outlined mb-3 block text-4xl text-[var(--ff-text-500)]">track_changes</span>
                    <p className="text-sm font-medium text-[var(--ff-text-700)]">No goals match this view yet.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/goals/new')}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2 text-sm font-semibold text-white shadow-e1 hover:brightness-105"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add your first goal
                    </button>
                  </article>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GoalsList;
