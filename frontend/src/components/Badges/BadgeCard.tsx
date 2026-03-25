import React from 'react';
import { Badge } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const progress = Math.max(0, Math.min(100, badge.progressPercentage || 0));
  const categoryLabel = badge.category || 'General';

  return (
    <article className={`${styles.dashboardGoalCard} overflow-hidden rounded-[1.5rem] p-5`}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-xs font-semibold uppercase tracking-wide ${styles.dashboardStatLabel}`}>{categoryLabel}</p>
          <h3 className={`mt-1 break-words text-lg font-bold ${styles.dashboardGoalTitle}`}>{badge.name}</h3>
        </div>
        <span className={`${styles.dashboardStatusChip} ${badge.earned ? styles.dashboardStatusChipActive : styles.dashboardStatusChipNeutral}`}>
          {badge.earned ? 'Earned' : 'Locked'}
        </span>
      </div>

      <p className={`text-sm ${styles.dashboardGoalMeta}`}>{badge.description}</p>

      {badge.ruleText && <p className={`mt-2 text-xs ${styles.dashboardGoalMeta}`}>Rule: {badge.ruleText}</p>}

      {badge.earned ? (
        <div className={`${styles.dashboardGoalCard} mt-4 rounded-xl p-3`} style={{ borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.08)' }}>
          <p className="text-sm font-semibold" style={{ color: '#6ee7b7' }}>Unlocked</p>
          {badge.earnedReason && <p className="mt-1 text-xs" style={{ color: '#a7f3d0' }}>{badge.earnedReason}</p>}
          {badge.pointsBonus ? <p className="mt-1 text-xs" style={{ color: '#a7f3d0' }}>Bonus: +{badge.pointsBonus} points</p> : null}
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className={styles.dashboardGoalMeta}>
              {badge.currentValue || 0} / {badge.requiredValue || '-'}
            </span>
            <span className={`font-semibold ${styles.dashboardGoalTitle}`}>{Math.round(progress)}%</span>
          </div>
          <div className={styles.dashboardGoalTrack}>
            <div className={styles.dashboardGoalFill} style={{ width: `${Math.max(progress, 4)}%` }} />
          </div>
        </div>
      )}
    </article>
  );
};

export default BadgeCard;
