import React from 'react';
import { LeaderboardPeriod } from '../../store/enhancedLeaderboardSlice';
import styles from '../Dashboard/Dashboard.module.css';

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
    <section className={`${styles.dashboardPanelCard} rounded-2xl p-5`}>
      <div className="grid gap-4 xl:grid-cols-[auto_1fr] xl:items-end">
        <div>
          <p className={`mb-2 text-xs font-bold uppercase tracking-[0.08em] ${styles.dashboardStatLabel}`}>
            Period
          </p>
          <div className="flex overflow-x-auto rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] p-1 sm:inline-flex sm:flex-wrap sm:overflow-visible"
            style={{ background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))' }}>
            {PERIOD_OPTIONS.map((period) => (
              <button
                key={period.value}
                onClick={() => onPeriodChange(period.value)}
                className={`shrink-0 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${selectedPeriod === period.value
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/25'
                  : styles.dashboardGoalMeta
                  }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={`mb-2 text-xs font-bold uppercase tracking-[0.08em] ${styles.dashboardStatLabel}`}>
            Category
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {CATEGORY_OPTIONS.map((category) => {
              const active = category.value ? selectedCategory === category.value : !selectedCategory;
              return (
                <button
                  key={category.label}
                  onClick={() => onCategoryChange(category.value)}
                  className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${active
                    ? styles.dashboardStatusChipNeutral
                    : styles.dashboardGoalMeta
                    } border-[var(--ff-dashboard-card-border,var(--ff-border))]`}
                  style={active ? {} : { background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))' }}
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
