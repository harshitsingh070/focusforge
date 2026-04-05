import React from 'react';
import { Badge } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

interface BadgeCardProps {
  badge: Badge;
  onClick: () => void;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge, onClick }) => {
  const categoryLabel = badge.category || 'General';

  return (
    <article
      className={`${styles.dashboardGoalCard} group cursor-pointer overflow-hidden rounded-[1.5rem] p-5 transition-all duration-150 hover:shadow-lg hover:scale-105 active:scale-95`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wide ${styles.dashboardStatLabel}`}>
            {categoryLabel}
          </p>
          <h3 className={`mt-1 break-words text-lg font-bold ${styles.dashboardGoalTitle} group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors`}>
            {badge.name}
          </h3>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap ${
            badge.earned
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
          }`}
        >
          {badge.earned ? 'Earned' : 'Locked'}
        </span>
      </div>

      {/* Hint text */}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to view details →
      </p>
    </article>
  );
};

export default BadgeCard;
