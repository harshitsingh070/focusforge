import React from 'react';
import { ActivityFilters, Goal } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

interface DateRangeFilterProps {
  filters: ActivityFilters;
  goals: Goal[];
  onChange: (filters: ActivityFilters) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ filters, goals, onChange }) => {
  const inputCls =
    'w-full rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] ' +
    'bg-[var(--ff-dashboard-card-bottom,var(--ff-surface-soft))] px-3.5 py-2.5 text-sm ' +
    'text-[var(--ff-dashboard-text,var(--ff-text-900))] outline-none transition-all duration-200 ' +
    'focus:border-violet-500 focus:ring-1 focus:ring-violet-500/20';

  const labelCls = `mb-1.5 block text-xs font-semibold uppercase tracking-wider ${styles.dashboardStatLabel}`;

  return (
    <section className={`${styles.dashboardPanelCard} rounded-2xl p-5 sm:p-6`}>
      <h3 className={`text-lg font-bold ${styles.dashboardGoalTitle}`}>Filters</h3>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="activity-from" className={labelCls}>From</label>
          <input
            id="activity-from"
            type="date"
            className={inputCls}
            value={filters.from || ''}
            onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
          />
        </div>
        <div>
          <label htmlFor="activity-to" className={labelCls}>To</label>
          <input
            id="activity-to"
            type="date"
            className={inputCls}
            value={filters.to || ''}
            onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="activity-goal" className={labelCls}>Goal</label>
          <select
            id="activity-goal"
            className={`${inputCls} appearance-none cursor-pointer`}
            value={filters.goalId || ''}
            onChange={(e) => onChange({ ...filters, goalId: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">All Goals</option>
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>{goal.title}</option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
};

export default DateRangeFilter;
