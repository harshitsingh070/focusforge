import React from 'react';
import { ActivityFilters, Goal } from '../../types';

interface DateRangeFilterProps {
  filters: ActivityFilters;
  goals: Goal[];
  onChange: (filters: ActivityFilters) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ filters, goals, onChange }) => (
  <div className="card">
    <h3 className="font-display text-lg font-bold text-gray-900">Filters</h3>

    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div>
        <label htmlFor="activity-from" className="mb-1 block text-sm font-semibold text-gray-700">
          From
        </label>
        <input
          id="activity-from"
          type="date"
          className="input-field"
          value={filters.from || ''}
          onChange={(event) => onChange({ ...filters, from: event.target.value || undefined })}
        />
      </div>

      <div>
        <label htmlFor="activity-to" className="mb-1 block text-sm font-semibold text-gray-700">
          To
        </label>
        <input
          id="activity-to"
          type="date"
          className="input-field"
          value={filters.to || ''}
          onChange={(event) => onChange({ ...filters, to: event.target.value || undefined })}
        />
      </div>

      <div>
        <label htmlFor="activity-goal" className="mb-1 block text-sm font-semibold text-gray-700">
          Goal
        </label>
        <select
          id="activity-goal"
          className="select-field"
          value={filters.goalId || ''}
          onChange={(event) =>
            onChange({
              ...filters,
              goalId: event.target.value ? Number(event.target.value) : undefined,
            })
          }
        >
          <option value="">All Goals</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);

export default DateRangeFilter;
