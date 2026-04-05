import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoalById, setSelectedGoal } from '../../store/goalsSlice';
import styles from '../Dashboard/Dashboard.module.css';

const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Very Easy', 2: 'Easy', 3: 'Balanced', 4: 'Hard', 5: 'Very Hard' };

const StatCell: React.FC<{ label: string; value: React.ReactNode; icon: string; accent?: string }> = ({
  label,
  value,
  icon,
  accent = '#7c3aed',
}) => (
  <div className={`${styles.dashboardGoalCard} flex items-center gap-3 rounded-xl px-4 py-4 transition-shadow hover:shadow-lg`}>
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"
      style={{ background: `${accent}20` }}
    >
      <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className={`text-xs font-medium ${styles.dashboardStatLabel}`}>{label}</p>
      <p className={`mt-0.5 text-base font-bold truncate ${styles.dashboardGoalTitle}`}>{value}</p>
    </div>
  </div>
);

const GoalDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGoal, loading, error } = useSelector((state: RootState) => state.goals);

  useEffect(() => {
    if (id) dispatch(fetchGoalById(Number(id)));
    return () => { dispatch(setSelectedGoal(null)); };
  }, [dispatch, id]);

  if (!id) {
    navigate('/goals');
    return null;
  }

  return (
    <main className={`${styles.dashboardThemeScope} mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10`}>
      {/* Back button */}
      <button
        onClick={() => navigate('/goals')}
        className={`mb-6 flex items-center gap-1.5 text-sm font-medium ${styles.dashboardGoalMeta} transition-colors hover:text-violet-400`}
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Goals
      </button>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--ff-dashboard-track,var(--ff-border))] border-t-violet-500" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-rose-300/50 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {!loading && selectedGoal && (
        <div className="flex flex-col gap-6">
          {/* Hero header card */}
          <section className={`${styles.dashboardPanelCard} rounded-2xl p-6`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={styles.dashboardStatusChip}
                    style={{
                      color: selectedGoal.categoryColor || '#a78bfa',
                      background: `${selectedGoal.categoryColor || '#7c3aed'}18`,
                      borderColor: `${selectedGoal.categoryColor || '#7c3aed'}40`,
                    }}
                  >
                    {selectedGoal.category || 'General'}
                  </span>
                  <span className={`${styles.dashboardStatusChip} ${selectedGoal.isActive ? styles.dashboardStatusChipActive : styles.dashboardStatusChipFocus}`}>
                    {selectedGoal.isActive ? 'Active' : 'Archived'}
                  </span>
                  <span className={`${styles.dashboardStatusChip} ${selectedGoal.isPrivate ? styles.dashboardStatusChipNeutral : ''}`}
                    style={!selectedGoal.isPrivate ? { background: 'rgba(59,130,246,0.12)', color: '#60a5fa', borderColor: 'rgba(59,130,246,0.25)' } : {}}>
                    {selectedGoal.isPrivate ? 'Private' : 'Public'}
                  </span>
                </div>
                <h1 className={`mt-3 text-2xl font-bold tracking-tight ${styles.dashboardGoalTitle}`}>
                  {selectedGoal.title}
                </h1>
                <p className={`mt-2 text-sm leading-relaxed ${styles.dashboardGoalMeta}`}>
                  {selectedGoal.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </section>

          {/* Stats grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCell label="Difficulty" value={`${selectedGoal.difficulty}/5 — ${DIFFICULTY_LABEL[selectedGoal.difficulty] ?? ''}`} icon="signal_cellular_alt" accent="#a78bfa" />
            <StatCell label="Daily Target" value={`${selectedGoal.dailyMinimumMinutes} min`} icon="timer" accent="#38bdf8" />
            <StatCell label="Current Streak" value={`${selectedGoal.currentStreak} days`} icon="local_fire_department" accent="#f59e0b" />
            <StatCell label="Longest Streak" value={`${selectedGoal.longestStreak} days`} icon="emoji_events" accent="#34d399" />
            <StatCell label="Start Date" value={selectedGoal.startDate} icon="calendar_today" accent="#7c3aed" />
            <StatCell label="End Date" value={selectedGoal.endDate || 'Open ended'} icon="event" accent="#ec4899" />
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to={`/goals/${selectedGoal.id}/log`}
              className={`${styles.dashboardGoalButtonPrimary} flex flex-1 items-center justify-center gap-2`}
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              Log Activity
            </Link>
            <Link
              to={`/goals/${selectedGoal.id}/edit`}
              className={`${styles.dashboardGoalButtonSecondary} flex flex-1 items-center justify-center gap-2`}
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              Edit Goal
            </Link>
          </div>
        </div>
      )}

      {/* Not found */}
      {!loading && !selectedGoal && !error && (
        <div className={`${styles.dashboardPanelCard} rounded-2xl p-12 text-center`}>
          <span className={`material-symbols-outlined mb-3 block text-4xl ${styles.dashboardGoalMeta}`}>search_off</span>
          <p className={`text-sm font-medium ${styles.dashboardGoalMeta}`}>Goal not found.</p>
          <button
            onClick={() => navigate('/goals')}
            className={`${styles.dashboardGoalButtonPrimary} mt-4 inline-flex items-center gap-2`}
          >
            Back to Goals
          </button>
        </div>
      )}
    </main>
  );
};

export default GoalDetail;
