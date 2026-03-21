import React from 'react';
import { ActivityFilters, Goal } from '../../types';
import Card from '../ui/Card';

interface DateRangeFilterProps {
  filters: ActivityFilters;
  goals: Goal[];
  onChange: (filters: ActivityFilters) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ filters, goals, onChange }) => (
  <Card>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>

    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label htmlFor="activity-from" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">From</label>
        <input
          id="activity-from"
          type="date"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          value={filters.from || ''}
          onChange={(e) => onChange({ ...filters, from: e.target.value || undefined })}
        />
      </div>
      <div>
        <label htmlFor="activity-to" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">To</label>
        <input
          id="activity-to"
          type="date"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
          value={filters.to || ''}
          onChange={(e) => onChange({ ...filters, to: e.target.value || undefined })}
        />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="activity-goal" className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-300">Goal</label>
        <select
          id="activity-goal"
          className="w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none transition-all duration-200 focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 cursor-pointer"
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
  </Card>
);

export default DateRangeFilter;
