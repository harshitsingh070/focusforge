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
  { label: 'Overall', value: undefined },
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
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid gap-4 xl:grid-cols-[auto_1fr] xl:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Period
          </p>
          <div className="inline-flex flex-wrap rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period.value}
                onClick={() => onPeriodChange(period.value)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${selectedPeriod === period.value
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/25'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((category) => {
              const active = category.value ? selectedCategory === category.value : !selectedCategory;
              return (
                <button
                  key={category.label}
                  onClick={() => onCategoryChange(category.value)}
                  className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${active
                      ? 'border-violet-300 bg-violet-50 text-violet-700 shadow-sm dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white'
                    }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterBar;
