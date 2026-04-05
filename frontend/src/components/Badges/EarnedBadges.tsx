import React from 'react';
import { Badge } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

interface EarnedBadgesProps {
  badges: Badge[];
  onBadgeClick?: (badge: Badge) => void;
}

const EarnedBadges: React.FC<EarnedBadgesProps> = ({ badges, onBadgeClick }) => {
  if (badges.length === 0) {
    return (
      <div className={`${styles.dashboardPanelCard} rounded-2xl p-6`}>
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Earned Badges</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">No badges earned yet. Keep logging consistent activity.</p>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboardPanelCard} rounded-2xl p-6`}>
      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4">Earned Badges</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge, index) => (
          <article
            key={`${badge.id || badge.name}-${index}`}
            className="group cursor-pointer rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 transition-all duration-150 hover:shadow-md hover:border-emerald-300 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-slate-900 dark:hover:border-emerald-400/50"
            onClick={() => onBadgeClick?.(badge)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onBadgeClick?.(badge);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-200 transition-colors">
                  {badge.name}
                </p>
              </div>
              <span className="material-symbols-outlined text-lg text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                verified
              </span>
            </div>
            {badge.earnedAt && (
              <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-400">
                {new Date(badge.earnedAt).toLocaleDateString()}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};

export default EarnedBadges;
