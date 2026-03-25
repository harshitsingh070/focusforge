import React from 'react';
import { ActivityLog } from '../../types';
import styles from '../Dashboard/Dashboard.module.css';

interface ActivityEntryProps {
  activity: ActivityLog;
}

const timelineTones = ['#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];

const ActivityEntry: React.FC<ActivityEntryProps> = ({ activity }) => {
  const tone = timelineTones[activity.id % timelineTones.length];
  const verified = !activity.suspicious;

  return (
    <article className={`${styles.dashboardGoalCard} relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-0.5`}
      style={{ boxShadow: 'var(--ff-dashboard-shadow, 0 2px 12px rgba(0,0,0,0.08))' }}>
      {/* Color accent bar */}
      <span className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl" style={{ backgroundColor: tone }} />

      <div className="p-4 sm:p-5 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={`text-xl font-bold tracking-tight ${styles.dashboardGoalTitle}`}>{activity.logDate}</p>
            <p className={`mt-0.5 truncate text-sm font-semibold ${styles.dashboardGoalMeta}`}>{activity.goalTitle}</p>
          </div>
          <span
            className="shrink-0 rounded-xl px-3 py-1.5 text-sm font-bold text-white"
            style={{ background: tone }}
          >
            {activity.minutesSpent}m
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>
            +{activity.pointsEarned} pts
          </span>
          <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipFocus}`}>
            🔥 Streak {activity.currentStreak}
          </span>
          <span className={`${styles.dashboardStatusChip} ${verified ? styles.dashboardStatusChipActive : ''}`}
            style={!verified ? { borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)', color: '#f59e0b' } : {}}>
            {verified ? '✓ Verified' : '⏳ Under Review'}
          </span>
        </div>

        {activity.notes && (
          <p className={`mt-3 text-sm leading-relaxed ${styles.dashboardGoalMeta}`}>{activity.notes}</p>
        )}
        {activity.message && (
          <p className={`mt-1.5 text-xs ${styles.dashboardGoalMeta}`} style={{ opacity: 0.7 }}>{activity.message}</p>
        )}
      </div>
    </article>
  );
};

export default ActivityEntry;
