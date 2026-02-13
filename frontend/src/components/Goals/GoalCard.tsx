import React from 'react';
import { Link } from 'react-router-dom';
import { Goal } from '../../types';

interface GoalCardProps {
  goal: Goal;
  onDelete?: (goalId: number) => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onDelete }) => (
  <article className="card">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <span
          className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${goal.categoryColor}20`, color: goal.categoryColor }}
        >
          {goal.category}
        </span>
        <h3 className="mt-2 font-display text-xl font-bold text-gray-900">{goal.title}</h3>
      </div>
      <span className={`status-chip ${goal.isActive ? '' : 'warn'}`}>{goal.isActive ? 'Active' : 'Inactive'}</span>
    </div>

    <p className="text-sm text-gray-700">{goal.description || 'No description added.'}</p>

    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-muted">
      <p>Difficulty: {goal.difficulty}/5</p>
      <p>Daily target: {goal.dailyMinimumMinutes} min</p>
      <p>Streak: {goal.currentStreak}</p>
      <p>Best streak: {goal.longestStreak}</p>
      <p>Start: {goal.startDate}</p>
      <p>End: {goal.endDate || 'Open'}</p>
    </div>

    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Link to={`/goals/${goal.id}`} className="btn-secondary text-center">
        View
      </Link>
      <Link to={`/goals/${goal.id}/edit`} className="btn-secondary text-center">
        Edit
      </Link>
      <Link to={`/goals/${goal.id}/log`} className="btn-primary text-center">
        Log
      </Link>
      <button
        type="button"
        onClick={() => onDelete?.(goal.id)}
        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700"
      >
        Delete
      </button>
    </div>
  </article>
);

export default GoalCard;
