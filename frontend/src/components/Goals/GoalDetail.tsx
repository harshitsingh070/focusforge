import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchGoalById, setSelectedGoal } from '../../store/goalsSlice';

const DIFFICULTY_LABEL: Record<number, string> = { 1: 'Very Easy', 2: 'Easy', 3: 'Balanced', 4: 'Hard', 5: 'Very Hard' };

const StatCell: React.FC<{ label: string; value: React.ReactNode; icon: string; accent?: string }> = ({
  label,
  value,
  icon,
  accent = 'var(--ff-primary)',
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-4 py-4 shadow-e1 transition-shadow hover:shadow-e2">
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px]"
      style={{ background: `${accent}18` }}
    >
      <span className="material-symbols-outlined text-[20px]" style={{ color: accent }}>
        {icon}
      </span>
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-[var(--ff-text-500)]">{label}</p>
      <p className="mt-0.5 text-base font-bold text-[var(--ff-text-900)] truncate">{value}</p>
    </div>
  </div>
);

const GoalDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { selectedGoal, loading, error } = useSelector((state: RootState) => state.goals);

  useEffect(() => {
    if (id) {
      dispatch(fetchGoalById(Number(id)));
    }
    return () => {
      dispatch(setSelectedGoal(null));
    };
  }, [dispatch, id]);

  if (!id) {
    navigate('/goals');
    return null;
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Back */}
        <button
          onClick={() => navigate('/goals')}
          className="mb-6 flex items-center gap-1.5 text-sm font-medium text-[var(--ff-text-700)] transition-colors hover:text-[var(--ff-text-900)]"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Goals
        </button>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--ff-border)] border-t-[var(--ff-primary)]" />
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
            {/* Header card */}
            <div className="rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-6 shadow-e2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full border px-3 py-0.5 text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: selectedGoal.categoryColor || 'var(--ff-primary)',
                        backgroundColor: `${selectedGoal.categoryColor || '#7c3aed'}18`,
                        borderColor: `${selectedGoal.categoryColor || '#7c3aed'}40`,
                      }}
                    >
                      {selectedGoal.category || 'General'}
                    </span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${selectedGoal.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                        }`}
                    >
                      {selectedGoal.isActive ? 'Active' : 'Archived'}
                    </span>
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-semibold ${selectedGoal.isPrivate
                        ? 'bg-[var(--ff-surface-soft)] text-[var(--ff-text-700)]'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                        }`}
                    >
                      {selectedGoal.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--ff-text-900)]">
                    {selectedGoal.title}
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--ff-text-700)]">
                    {selectedGoal.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCell
                label="Difficulty"
                value={`${selectedGoal.difficulty}/5 — ${DIFFICULTY_LABEL[selectedGoal.difficulty] ?? ''}`}
                icon="signal_cellular_alt"
                accent="var(--ff-primary)"
              />
              <StatCell
                label="Daily Target"
                value={`${selectedGoal.dailyMinimumMinutes} min`}
                icon="timer"
                accent="#0ea5e9"
              />
              <StatCell
                label="Current Streak"
                value={`${selectedGoal.currentStreak} days`}
                icon="local_fire_department"
                accent="#d97706"
              />
              <StatCell
                label="Longest Streak"
                value={`${selectedGoal.longestStreak} days`}
                icon="emoji_events"
                accent="#16a34a"
              />
              <StatCell
                label="Start Date"
                value={selectedGoal.startDate}
                icon="calendar_today"
                accent="#7c3aed"
              />
              <StatCell
                label="End Date"
                value={selectedGoal.endDate || 'Open ended'}
                icon="event"
                accent="#db2777"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to={`/goals/${selectedGoal.id}/log`}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-5 py-3 text-sm font-semibold text-white shadow-e1 transition-[transform,filter,box-shadow] duration-normal ease-premium hover:brightness-105 hover:shadow-hover"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Log Activity
              </Link>
              <Link
                to={`/goals/${selectedGoal.id}/edit`}
                className="flex flex-1 items-center justify-center gap-2 rounded-[10px] border border-[var(--ff-border)] bg-[var(--ff-surface-soft)] px-5 py-3 text-sm font-semibold text-[var(--ff-text-900)] transition-colors hover:bg-[var(--ff-surface-hover)]"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Goal
              </Link>
            </div>
          </div>
        )}

        {/* Not found */}
        {!loading && !selectedGoal && !error && (
          <div className="rounded-2xl border border-[var(--ff-border)] bg-[var(--ff-surface-elevated)] p-12 text-center shadow-e2">
            <span className="material-symbols-outlined mb-3 block text-4xl text-[var(--ff-text-500)]">search_off</span>
            <p className="text-sm font-medium text-[var(--ff-text-700)]">Goal not found.</p>
            <button
              onClick={() => navigate('/goals')}
              className="mt-4 inline-flex items-center gap-2 rounded-[10px] bg-[var(--ff-primary)] [background-image:var(--ff-gradient-primary)] px-4 py-2 text-sm font-semibold text-white shadow-e1 hover:brightness-105"
            >
              Back to Goals
            </button>
          </div>
        )}
    </main>
  );
};

export default GoalDetail;
