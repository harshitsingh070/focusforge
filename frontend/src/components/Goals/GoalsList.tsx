import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { deleteGoal, fetchGoalById, fetchGoals, updateGoal } from '../../store/goalsSlice';
import { Goal, GoalRequest } from '../../types';
import LogActivityModal from '../Activity/LogActivityModal';

type GoalTab = 'ACTIVE' | 'ALL' | 'COMPLETED' | 'ARCHIVED';
type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

interface GoalWithMeta extends Goal {
  progressPercent: number;
  completed: boolean;
  difficultyLevel: DifficultyLevel;
}



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



const GoalsList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { goals, loading, error } = useSelector((state: RootState) => state.goals);


  const [activeTab, setActiveTab] = useState<GoalTab>('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Overlay state: which goal + which panel is open
  type OverlayType = 'log' | 'detail' | 'edit';
  const [overlay, setOverlay] = useState<{ type: OverlayType; goal: Goal } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState<'delete' | 'archive' | null>(null);
  const [actionMsg, setActionMsg] = useState('');

  const closeOverlay = () => { setOverlay(null); setDeleteConfirm(false); setActionMsg(''); };

  const { selectedGoal } = useSelector((state: RootState) => state.goals);

  // Fetch goals on mount only. Subsequent refreshes (after actions) are triggered explicitly.
  // This avoids the loading spinner re-appearing every time the user navigates to this page.
  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);



  // Fetch full goal detail when detail/edit overlay opens
  useEffect(() => {
    if (overlay && (overlay.type === 'detail' || overlay.type === 'edit')) {
      dispatch(fetchGoalById(overlay.goal.id));
    }
  }, [dispatch, overlay]);



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
    <>
      {/* ── Content area ── */}
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-6 sm:p-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />

          {/* Row 1: title + actions */}
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Goals</h2>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Track your progress and crush your targets.</p>
            </div>

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
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/30 transition-all duration-200 hover:from-violet-500 hover:to-purple-500 hover:scale-[1.02]"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Goal
              </button>
            </div>
          </div>

          {/* Row 2: Filter tabs + category dropdown */}
          <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

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
        </section>

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
                    className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm transition-all duration-200 hover:shadow-md"
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
              <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
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
                      className="group ff-section-enter flex h-full flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800/50"
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
                        <button
                          type="button"
                          onClick={() => setOverlay({ type: 'detail', goal })}
                          className="inline-flex items-center justify-center rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ff-text-900)] transition-[background-color] duration-normal ease-premium hover:bg-[var(--ff-surface-hover)]"
                        >
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => setOverlay({ type: 'log', goal })}
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
                  <article className="col-span-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center">
                    <span className="material-symbols-outlined mb-3 block text-4xl text-slate-300 dark:text-slate-600">track_changes</span>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No goals match this view yet.</p>
                    <button
                      type="button"
                      onClick={() => navigate('/goals/new')}
                      className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-500/30 hover:from-violet-500 hover:to-purple-500"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                      Add your first goal
                    </button>
                  </article>
                )}
              </section>
            )}
      </div>

      {/* ══════════════════════════════════════════
          OVERLAY PANELS — rendered over the Goals page
          ══════════════════════════════════════════ */}
      {overlay && (
        <div
          className="ff-backdrop fixed inset-0 z-50 flex items-end justify-center bg-black/35 backdrop-blur-md sm:items-center p-0 sm:p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeOverlay(); }}
        >
          {/* ── Log Activity panel ── */}
          {overlay.type === 'log' && (
            <div className="ff-sheet-enter sm:ff-modal-enter w-full sm:max-w-md" onClick={(e) => e.stopPropagation()}>
              <LogActivityModal
                goalId={overlay.goal.id}
                goalTitle={overlay.goal.title}
                dailyTarget={overlay.goal.dailyMinimumMinutes}
                onClose={() => { closeOverlay(); dispatch(fetchGoals()); }}
              />
            </div>
          )}

          {/* ── Goal Detail panel ── */}
          {overlay.type === 'detail' && (
            <div
              className="ff-sheet-enter sm:ff-modal-enter w-full max-h-[92vh] overflow-y-auto sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-[var(--ff-text-900)]">Goal Detail</h2>
                <button onClick={closeOverlay} className="rounded-[8px] border border-[var(--ff-border)] p-1.5 text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide"
                  style={{ color: overlay.goal.categoryColor || 'var(--ff-primary)', backgroundColor: `${overlay.goal.categoryColor || '#7c3aed'}18`, borderColor: `${overlay.goal.categoryColor || '#7c3aed'}40` }}>
                  {overlay.goal.category || 'General'}
                </span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${overlay.goal.isActive ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400' : 'bg-amber-100 text-amber-700'}`}>
                  {overlay.goal.isActive ? 'Active' : 'Archived'}
                </span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${overlay.goal.isPrivate ? 'bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)]' : 'bg-blue-50 text-blue-700'}`}>
                  {overlay.goal.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-[var(--ff-text-900)]">{overlay.goal.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ff-text-700)]">{overlay.goal.description || 'No description provided.'}</p>
              {/* Stat grid */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { label: 'Difficulty', value: `${overlay.goal.difficulty}/5`, icon: 'signal_cellular_alt', accent: 'var(--ff-primary)' },
                  { label: 'Daily Target', value: `${overlay.goal.dailyMinimumMinutes} min`, icon: 'timer', accent: '#0ea5e9' },
                  { label: 'Current Streak', value: `${overlay.goal.currentStreak} days`, icon: 'local_fire_department', accent: '#d97706' },
                  { label: 'Longest Streak', value: `${overlay.goal.longestStreak} days`, icon: 'emoji_events', accent: '#16a34a' },
                  { label: 'Start Date', value: overlay.goal.startDate, icon: 'calendar_today', accent: '#7c3aed' },
                  { label: 'End Date', value: overlay.goal.endDate || 'Open ended', icon: 'event', accent: '#db2777' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-3 rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-3 shadow-e1">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]" style={{ background: `${s.accent}18` }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: s.accent }}>{s.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-[var(--ff-text-500)]">{s.label}</p>
                      <p className="mt-0.5 truncate text-sm font-bold text-[var(--ff-text-900)]">{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={!overlay.goal.isActive}
                  onClick={() => setOverlay({ type: 'log', goal: overlay.goal })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-e1 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Log Activity
                </button>
                <button
                  onClick={() => setOverlay({ type: 'edit', goal: overlay.goal })}
                  className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-2.5 text-sm font-semibold text-[var(--ff-text-900)] hover:bg-[var(--ff-surface-hover)]"
                >
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit Goal
                </button>
              </div>
            </div>
          )}

          {/* ── Edit Goal panel ── */}
          {overlay.type === 'edit' && (() => {
            const g = selectedGoal?.id === overlay.goal.id ? selectedGoal : overlay.goal;
            const isArchived = !g.isActive;

            const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault();
              const form = e.currentTarget;
              const fd = new FormData(form);
              const payload: GoalRequest = {
                categoryId: 1,
                title: fd.get('title') as string,
                description: fd.get('description') as string,
                difficulty: Number(fd.get('difficulty')),
                dailyMinimumMinutes: Number(fd.get('dailyMinimumMinutes')),
                startDate: fd.get('startDate') as string,
                endDate: (fd.get('endDate') as string) || undefined,
                isPrivate: fd.get('isPrivate') === 'true',
              };
              setActionLoading('archive'); // reuse to show saving state
              await dispatch(updateGoal({ id: g.id, goalRequest: payload }));
              setActionLoading(null);
              dispatch(fetchGoals());
              setActionMsg('Changes saved!');
              setTimeout(closeOverlay, 900);
            };

            const handleArchive = async () => {
              setActionLoading('archive');
              const payload = { ...g, categoryId: 1, isActive: !g.isActive, endDate: g.endDate || undefined } as unknown as GoalRequest;
              await dispatch(updateGoal({ id: g.id, goalRequest: payload }));
              setActionLoading(null);
              dispatch(fetchGoals());
              setActionMsg(g.isActive ? 'Goal archived.' : 'Goal unarchived.');
              setTimeout(closeOverlay, 900);
            };

            const handleDelete = async () => {
              setActionLoading('delete');
              await dispatch(deleteGoal(g.id));
              setActionLoading(null);
              dispatch(fetchGoals());
              closeOverlay();
            };

            return (
              <div
                className="ff-sheet-enter sm:ff-modal-enter w-full max-h-[92vh] overflow-y-auto sm:max-w-xl rounded-t-2xl sm:rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-[var(--ff-text-900)]">Edit Goal</h2>
                  <button onClick={closeOverlay} className="rounded-[8px] border border-[var(--ff-border)] p-1.5 text-[var(--ff-text-700)] hover:bg-[var(--ff-surface-hover)]">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>

                {actionMsg && (
                  <div className="mb-4 rounded-xl border border-green-300/50 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300">
                    {actionMsg}
                  </div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">Title</label>
                    <input name="title" defaultValue={g.title} className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none focus:border-[rgba(var(--ff-primary-rgb),0.55)]" required />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">Description</label>
                    <textarea name="description" defaultValue={g.description || ''} rows={3} className="w-full resize-none rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none focus:border-[rgba(var(--ff-primary-rgb),0.55)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">Difficulty (1–5)</label>
                      <input name="difficulty" type="number" min={1} max={5} defaultValue={g.difficulty} className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none focus:border-[rgba(var(--ff-primary-rgb),0.55)]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">Daily Minutes</label>
                      <input name="dailyMinimumMinutes" type="number" min={10} max={600} defaultValue={g.dailyMinimumMinutes} className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none focus:border-[rgba(var(--ff-primary-rgb),0.55)]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">Start Date</label>
                      <input name="startDate" type="date" defaultValue={g.startDate} className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none focus:border-[rgba(var(--ff-primary-rgb),0.55)]" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-[var(--ff-text-900)]">End Date <span className="font-normal text-[var(--ff-text-500)]">(optional)</span></label>
                      <input name="endDate" type="date" defaultValue={g.endDate || ''} className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm text-[var(--ff-text-900)] outline-none focus:border-[rgba(var(--ff-primary-rgb),0.55)]" />
                    </div>
                  </div>
                  <input type="hidden" name="isPrivate" value={String(g.isPrivate)} />
                  <button type="submit" disabled={!!actionLoading} className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2.5 text-sm font-semibold text-white shadow-e1 hover:brightness-105 disabled:opacity-60">
                    {actionLoading === 'archive' ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Saving…</> : 'Save Changes'}
                  </button>
                </form>

                {/* Danger zone */}
                <div className="mt-5 rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] p-4">
                  <p className="mb-3 text-xs font-semibold text-[var(--ff-text-700)]">Danger Zone</p>
                  {!deleteConfirm ? (
                    <div className="flex gap-3">
                      <button onClick={handleArchive} disabled={!!actionLoading} className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm font-semibold text-[var(--ff-text-900)] hover:bg-[var(--ff-surface-hover)] disabled:opacity-60">
                        {actionLoading === 'archive' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--ff-border)] border-t-[var(--ff-primary)]" /> : <span className="material-symbols-outlined text-[16px]">{isArchived ? 'unarchive' : 'archive'}</span>}
                        {isArchived ? 'Unarchive' : 'Archive'}
                      </button>
                      <button onClick={() => setDeleteConfirm(true)} disabled={!!actionLoading} className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] border border-rose-300/60 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                        <span className="material-symbols-outlined text-[16px]">delete</span> Delete
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-[var(--ff-text-700)]">Delete <strong>"{g.title}"</strong>? This cannot be undone.</p>
                      <div className="flex gap-3">
                        <button onClick={() => setDeleteConfirm(false)} className="flex-1 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-3 py-2 text-sm font-semibold text-[var(--ff-text-900)] hover:bg-[var(--ff-surface-hover)]">Cancel</button>
                        <button onClick={handleDelete} disabled={actionLoading === 'delete'} className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                          {actionLoading === 'delete' ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <span className="material-symbols-outlined text-[16px]">delete</span>} Yes, Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
};

export default GoalsList;
