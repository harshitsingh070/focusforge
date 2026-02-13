import React from 'react';
import { LeaderboardPeriod } from '../../store/enhancedLeaderboardSlice';

interface FilterBarProps {
  selectedPeriod: LeaderboardPeriod;
  selectedCategory?: string;
  onPeriodChange: (period: LeaderboardPeriod) => void;
  onCategoryChange: (category?: string) => void;
}

const PERIOD_OPTIONS: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'All Time', value: 'ALL_TIME' },
];

const CATEGORY_OPTIONS = [
  { label: 'overall', value: undefined },
  { label: 'Coding', value: 'Coding' },
  { label: 'Health', value: 'Health' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Academics', value: 'Academics' },
  { label: 'Career Skills', value: 'Career Skills' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  selectedPeriod,
  selectedCategory,
  onPeriodChange,
  onCategoryChange,
}) => {
  return (
    <section className="card mb-6 border-slate-200">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Period</p>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto pb-1">
        {PERIOD_OPTIONS.map((period) => (
          <button
            key={period.value}
            onClick={() => onPeriodChange(period.value)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              selectedPeriod === period.value
                ? 'bg-primary-600 text-white shadow-soft'
                : 'border border-slate-200 bg-white text-gray-700'
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Category</p>
      <div className="scrollbar-soft flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_OPTIONS.map((category) => {
          const active = category.value ? selectedCategory === category.value : !selectedCategory;
          return (
            <button
              key={category.label}
              onClick={() => onCategoryChange(category.value)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                active ? 'bg-primary-100 text-primary-700' : 'border border-slate-200 bg-white text-gray-700'
              }`}
            >
              {category.label}
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default FilterBar;
