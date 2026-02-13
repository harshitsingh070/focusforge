import React from 'react';
import { GoalProgress } from '../../types';

interface GoalCardProps {
  goal: GoalProgress;
  deleting?: boolean;
  onLogActivity: (goalId: number) => void;
  onDeleteGoal: (goalId: number, title: string) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, deleting = false, onLogActivity, onDeleteGoal }) => {
  const safeTarget = Math.max(1, goal.dailyTarget);
  const rawProgress = Math.max(0, goal.todayProgress);
  const cappedProgress = Math.min(rawProgress, safeTarget);
  const extraMinutes = Math.max(0, rawProgress - safeTarget);
  const progressPercent = Math.min((cappedProgress / safeTarget) * 100, 100);

  return (
    <article
      className={`card relative overflow-hidden ${
        goal.completedToday ? 'border-emerald-200 bg-emerald-50/60' : ''
      } ${goal.atRisk ? 'border-red-200' : ''}`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex max-w-full truncate rounded-full px-3 py-1 text-xs font-semibold"
              style={{ backgroundColor: `${goal.categoryColor}20`, color: goal.categoryColor }}
            >
              {goal.category}
            </span>
            {goal.atRisk && <span className="status-chip danger">At Risk</span>}
          </div>
          <h3 className="mt-2 break-words font-display text-lg font-bold text-gray-900">{goal.title}</h3>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] uppercase tracking-wide text-ink-muted">Current streak</p>
          <p className="text-2xl font-black text-orange-600">{goal.currentStreak}</p>
          <p className="text-xs text-ink-muted">Best: {goal.longestStreak}</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="mb-1 flex items-center justify-between gap-2 text-sm">
          <span className="text-ink-muted">
            {cappedProgress} / {safeTarget} min
            {extraMinutes > 0 ? ` (+${extraMinutes} extra)` : ''}
          </span>
          <span className="font-semibold text-gray-700">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              goal.completedToday ? 'bg-emerald-500' : 'bg-primary-600'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {!goal.completedToday ? (
          <button onClick={() => onLogActivity(goal.goalId)} className="btn-primary w-full text-sm" disabled={deleting}>
            Log Activity
          </button>
        ) : (
          <div className="col-span-1 rounded-xl border border-emerald-200 bg-emerald-100 py-2 text-center text-sm font-semibold text-emerald-700">
            Completed
          </div>
        )}

        <button
          onClick={() => onDeleteGoal(goal.goalId, goal.title)}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Goal'}
        </button>
      </div>
    </article>
  );
};

export default GoalCard;
