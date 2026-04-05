import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGoalComposer } from '../../contexts/GoalComposerContext';
import { AppDispatch, RootState } from '../../store';
import { deleteGoal, fetchGoalById, fetchGoals, updateGoal } from '../../store/goalsSlice';
import { Goal, GoalRequest } from '../../types';
import LogActivityModal from '../Activity/LogActivityModal';
import styles from '../Dashboard/Dashboard.module.css';

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
  const { openGoalComposer } = useGoalComposer();

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
      <div className={`${styles.dashboardThemeScope} mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8`}>
        {/* ── Hero / Header banner ── */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />

          {/* Row 1: title + actions */}
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Goals</h2>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Track your progress and crush your targets.</p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap lg:w-auto">
              <div className="relative w-full sm:w-auto">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-[var(--ff-text-500)]">
                  search
                </span>
                <input
                  id="goals-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search goals..."
                  className="w-full rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] py-2 pl-10 pr-3 text-sm text-[var(--ff-text-900)] outline-none transition-all duration-fast ease-premium placeholder:text-[var(--ff-text-500)] focus:border-[rgba(var(--ff-primary-rgb),0.55)] sm:w-52 sm:focus:w-64"
                />
              </div>
              <button
                type="button"
                onClick={openGoalComposer}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/30 transition-all duration-200 hover:from-violet-500 hover:to-purple-500 hover:scale-[1.02] sm:w-auto"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Goal
              </button>
            </div>
          </div>

          {/* Row 2: Filter tabs + category dropdown */}
          <div className="relative mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-auto">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--ff-text-500)]">
                category
              </span>
              <select
                id="goals-category-filter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] py-1.5 pl-9 pr-8 text-sm font-medium text-[var(--ff-text-900)] outline-none transition-colors duration-fast ease-premium focus:border-[rgba(var(--ff-primary-rgb),0.55)] cursor-pointer sm:w-auto"
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

        {/* ── Summary stat cards (dashboard style) ── */}
        {!loading && (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: 'track_changes',
                label: 'Total Goals',
                value: goalsWithMeta.length.toLocaleString(),
                cardClass: styles.dashboardStatCardViolet,
                iconClass: styles.dashboardStatIconViolet,
                sub: 'All time',
                subColor: styles.dashboardStatSubNeutral ?? styles.dashboardStatSubPositive,
              },
              {
                icon: 'check_circle',
                label: 'Completed',
                value: goalsWithMeta.filter((g) => g.completed).length.toLocaleString(),
                cardClass: styles.dashboardStatCardEmerald,
                iconClass: styles.dashboardStatIconEmerald,
                sub: 'Goals hit 90%+',
                subColor: styles.dashboardStatSubPositive,
              },
              {
                icon: 'local_fire_department',
                label: 'Best Streak',
                value: `${Math.max(0, ...goalsWithMeta.map((g) => g.currentStreak))} days`,
                cardClass: styles.dashboardStatCardAmber,
                iconClass: styles.dashboardStatIconAmber,
                sub: 'Active streak',
                subColor: styles.dashboardStatSubWarm,
              },
            ].map((stat) => (
              <div key={stat.label} className={`${styles.dashboardStatCard} ${stat.cardClass} rounded-2xl p-6`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={styles.dashboardStatLabel}>{stat.label}</p>
                    <p className={styles.dashboardStatValue}>{stat.value}</p>
                    <p className={`${styles.dashboardStatSub} ${stat.subColor}`}>{stat.sub}</p>
                  </div>
                  <div className={`${styles.dashboardStatIconShell} ${stat.iconClass}`}>
                    <span className="material-symbols-outlined text-[20px]">{stat.icon}</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
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
                  className={`${styles.dashboardGoalCard} group ff-section-enter flex h-full flex-col rounded-[1.5rem] p-4`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h4 className={`${styles.dashboardGoalTitle} line-clamp-2`}>{goal.title}</h4>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className={`${styles.dashboardGoalBadge} rounded-full border px-3 py-0.5`}
                          style={categoryPillStyle}
                        >
                          {goal.category || 'General'}
                        </span>
                        <span className="rounded-full border border-orange-300/50 bg-orange-50 px-3 py-0.5 text-xs font-semibold text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                          🔥 {Math.max(goal.currentStreak, 0)} Day Streak
                        </span>
                        <span
                          className={`${styles.dashboardGoalBadge} rounded-full border px-3 py-0.5`}
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
                    <div className="relative h-12 w-12 shrink-0">
                      <div
                        className="h-12 w-12 rounded-full"
                        style={{
                          background: `conic-gradient(${categoryColor} ${progressDegrees}deg, var(--ff-dashboard-track, var(--ff-surface-hover)) 0deg)`,
                        }}
                      />
                      <div className="absolute inset-[4px] rounded-full" style={{ background: 'var(--ff-dashboard-card-top, var(--ff-surface-elevated))' }} />
                      <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-bold ${styles.dashboardGoalPercent}`} style={{ fontSize: '11px' }}>
                        {goal.progressPercent}%
                      </span>
                    </div>
                  </div>

                  <p className={`${styles.dashboardGoalMeta} mt-2 line-clamp-2 flex-1`}>
                    {goal.description?.trim() || 'No goal description provided.'}
                  </p>
                  <p className="mt-1.5 text-xs" style={{ color: 'var(--ff-dashboard-text-muted, var(--ff-text-500))' }}>
                    Daily target:{' '}
                    <span className="font-medium" style={{ color: 'var(--ff-dashboard-text-soft, var(--ff-text-700))' }}>{Math.max(goal.dailyMinimumMinutes, 0)} min</span>
                  </p>

                  {/* Progress bar */}
                  <div className={`${styles.dashboardGoalTrack} mt-3`}>
                    <div
                      className={styles.dashboardGoalFill}
                      style={{ width: `${Math.max(goal.progressPercent, 8)}%`, background: categoryColor }}
                    />
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOverlay({ type: 'detail', goal })}
                      className={`${styles.dashboardGoalButtonSecondary} inline-flex items-center justify-center rounded-[10px] border px-4 py-2.5 text-sm font-semibold transition-[background-color] duration-normal ease-premium`}
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setOverlay({ type: 'log', goal })}
                      disabled={!goal.isActive}
                      className={`${styles.dashboardGoalButtonPrimary} inline-flex items-center justify-center rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      Update Progress
                    </button>
                  </div>
                </article>
              );
            })}

            {filteredGoals.length === 0 && (
              <article className={`${styles.dashboardGoalCard} col-span-full rounded-[1.5rem] p-12 text-center`}>
                <span className="material-symbols-outlined mb-3 block text-4xl" style={{ color: 'var(--ff-dashboard-track, var(--ff-text-500))' }}>track_changes</span>
                <p className="text-sm font-medium" style={{ color: 'var(--ff-dashboard-text-muted, var(--ff-text-500))' }}>No goals match this view yet.</p>
                <button
                  type="button"
                  onClick={openGoalComposer}
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
              className={`${styles.dashboardThemeScope} ff-sheet-enter sm:ff-modal-enter w-full max-h-[92vh] overflow-y-auto sm:max-w-2xl rounded-t-2xl sm:rounded-2xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] bg-[var(--ff-dashboard-card-top,var(--ff-surface-elevated))] p-6 shadow-e2`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className={`text-xl font-bold ${styles.dashboardGoalTitle}`}>Goal Detail</h2>
                <button onClick={closeOverlay} className="rounded-[8px] border border-[var(--ff-dashboard-card-border,var(--ff-border))] p-1.5 hover:bg-[var(--ff-surface-hover)]" style={{ color: 'var(--ff-dashboard-text-soft, var(--ff-text-700))' }}>
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`${styles.dashboardGoalBadge} rounded-full border px-3 py-0.5`}
                  style={{ color: overlay.goal.categoryColor || 'var(--ff-primary)', backgroundColor: `${overlay.goal.categoryColor || '#7c3aed'}18`, borderColor: `${overlay.goal.categoryColor || '#7c3aed'}40` }}>
                  {overlay.goal.category || 'General'}
                </span>
                <span className={`${styles.dashboardStatusChip} ${overlay.goal.isActive ? styles.dashboardStatusChipActive : styles.dashboardStatusChipFocus}`}>
                  {overlay.goal.isActive ? 'Active' : 'Archived'}
                </span>
                <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>
                  {overlay.goal.isPrivate ? 'Private' : 'Public'}
                </span>
              </div>
              <h3 className={`${styles.dashboardSummaryTitle} mt-3`}>{overlay.goal.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--ff-dashboard-text-soft, var(--ff-text-700))' }}>{overlay.goal.description || 'No description provided.'}</p>
              {/* Stat grid */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Difficulty', value: `${overlay.goal.difficulty}/5`, icon: 'signal_cellular_alt', accent: 'var(--ff-primary)' },
                  { label: 'Daily Target', value: `${overlay.goal.dailyMinimumMinutes} min`, icon: 'timer', accent: '#0ea5e9' },
                  { label: 'Current Streak', value: `${overlay.goal.currentStreak} days`, icon: 'local_fire_department', accent: '#d97706' },
                  { label: 'Longest Streak', value: `${overlay.goal.longestStreak} days`, icon: 'emoji_events', accent: '#16a34a' },
                  { label: 'Start Date', value: overlay.goal.startDate, icon: 'calendar_today', accent: '#7c3aed' },
                  { label: 'End Date', value: overlay.goal.endDate || 'Open ended', icon: 'event', accent: '#db2777' },
                ].map((s) => (
                  <div key={s.label} className={`${styles.dashboardSummaryCard} flex items-center gap-3 rounded-xl px-3 py-3`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]" style={{ background: `${s.accent}18` }}>
                      <span className="material-symbols-outlined text-[18px]" style={{ color: s.accent }}>{s.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className={`${styles.dashboardStatLabel} text-[10px]`}>{s.label}</p>
                      <p className={`${styles.dashboardGoalTitle} mt-0.5 truncate text-sm`}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Actions */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  disabled={!overlay.goal.isActive}
                  onClick={() => setOverlay({ type: 'log', goal: overlay.goal })}
                  className={`${styles.dashboardGoalButtonPrimary} flex flex-1 items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span> Log Activity
                </button>
                <button
                  onClick={() => setOverlay({ type: 'edit', goal: overlay.goal })}
                  className={`${styles.dashboardGoalButtonSecondary} flex flex-1 items-center justify-center gap-2 rounded-[10px] border px-4 py-2.5 text-sm font-semibold`}
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
                className={`${styles.dashboardThemeScope} ff-sheet-enter sm:ff-modal-enter w-full max-h-[90vh] overflow-y-auto sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl`}
                style={{
                  background: 'var(--ff-dashboard-card-top, var(--ff-surface-elevated))',
                  border: '1px solid var(--ff-dashboard-card-border, var(--ff-border))',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4"
                  style={{ borderBottom: '1px solid var(--ff-dashboard-card-border, var(--ff-border))' }}>
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-500/15">
                      <span className="material-symbols-outlined text-[18px] text-violet-400">edit</span>
                    </div>
                    <div>
                      <h2 className={`text-base font-bold ${styles.dashboardGoalTitle}`}>Edit Goal</h2>
                      <p className={`text-[11px] truncate max-w-[160px] ${styles.dashboardGoalMeta}`}>{g.title}</p>
                    </div>
                  </div>
                  <button onClick={closeOverlay} className={`${styles.dashboardGoalButtonSecondary} !px-2 !py-2`} aria-label="Close">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>

                <div className="p-5">

                {actionMsg && (
                    <div className="mb-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-400">
                      {actionMsg}
                    </div>
                  )}

                  <form onSubmit={handleSave} className="space-y-3.5">
                    {/* Title */}
                    <div>
                      <label className={`mb-1 block text-[10px] font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`}>Title</label>
                      <input name="title" defaultValue={g.title}
                        className="w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2 text-sm text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20"
                        required />
                    </div>
                    {/* Description */}
                    <div>
                      <label className={`mb-1 block text-[10px] font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`}>Description</label>
                      <textarea name="description" defaultValue={g.description || ''} rows={2}
                        className="w-full resize-none rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2 text-sm text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20" />
                    </div>
                    {/* Difficulty + Minutes + Dates */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className={`mb-1 block text-[10px] font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`}>Difficulty (1–5)</label>
                        <input name="difficulty" type="number" min={1} max={5} defaultValue={g.difficulty}
                          className="w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2 text-sm text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors focus:border-violet-500" />
                      </div>
                      <div>
                        <label className={`mb-1 block text-[10px] font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`}>Daily Minutes</label>
                        <input name="dailyMinimumMinutes" type="number" min={10} max={600} defaultValue={g.dailyMinimumMinutes}
                          className="w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2 text-sm text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors focus:border-violet-500" />
                      </div>
                      <div>
                        <label className={`mb-1 block text-[10px] font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`}>Start Date</label>
                        <input name="startDate" type="date" defaultValue={g.startDate}
                          className="w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2 text-sm text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors focus:border-violet-500" />
                      </div>
                      <div>
                        <label className={`mb-1 block text-[10px] font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`}>
                          End Date <span className={`font-normal normal-case tracking-normal ${styles.dashboardGoalMeta}`}>(opt.)</span>
                        </label>
                        <input name="endDate" type="date" defaultValue={g.endDate || ''}
                          className="w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3 py-2 text-sm text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-colors focus:border-violet-500" />
                      </div>
                    </div>
                    <input type="hidden" name="isPrivate" value={String(g.isPrivate)} />

                    {/* Save button */}
                    <button type="submit" disabled={!!actionLoading}
                      className={`${styles.dashboardGoalButtonPrimary} flex w-full items-center justify-center gap-2`}>
                      {actionLoading === 'archive'
                        ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Saving…</>
                        : <><span className="material-symbols-outlined text-[16px]">save</span> Save Changes</>
                      }
                    </button>
                  </form>

                  {/* Danger zone */}
                  <div className="mt-4 rounded-xl p-3.5"
                    style={{ background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))', border: '1px solid rgba(239,68,68,0.15)' }}>
                    <p className={`mb-2.5 text-[10px] font-bold uppercase tracking-widest ${styles.dashboardStatLabel}`}>Danger Zone</p>
                    {!deleteConfirm ? (
                      <div className="flex gap-2.5">
                        <button onClick={handleArchive} disabled={!!actionLoading}
                          className={`${styles.dashboardGoalButtonSecondary} flex flex-1 items-center justify-center gap-1.5 !py-2 text-xs`}>
                          {actionLoading === 'archive'
                            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--ff-border)] border-t-violet-400" />
                            : <span className="material-symbols-outlined text-[15px]">{isArchived ? 'unarchive' : 'archive'}</span>
                          }
                          {isArchived ? 'Unarchive' : 'Archive'}
                        </button>
                        <button onClick={() => setDeleteConfirm(true)} disabled={!!actionLoading}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-60">
                          <span className="material-symbols-outlined text-[15px]">delete</span> Delete
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        <p className={`text-xs ${styles.dashboardGoalMeta}`}>
                          Delete <strong className="text-rose-400">"{g.title}"</strong>? This cannot be undone.
                        </p>
                        <div className="flex gap-2.5">
                          <button onClick={() => setDeleteConfirm(false)}
                            className={`${styles.dashboardGoalButtonSecondary} flex-1 !py-2 text-xs`}>Cancel</button>
                          <button onClick={handleDelete} disabled={actionLoading === 'delete'}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-60">
                            {actionLoading === 'delete'
                              ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                              : <span className="material-symbols-outlined text-[15px]">delete</span>
                            }
                            Yes, Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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
