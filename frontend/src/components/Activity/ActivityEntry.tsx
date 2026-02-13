import React from 'react';
import { ActivityLog } from '../../types';

interface ActivityEntryProps {
  activity: ActivityLog;
}

const ActivityEntry: React.FC<ActivityEntryProps> = ({ activity }) => (
  <article className="rounded-xl border border-slate-200 bg-white/80 p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-semibold text-gray-900">{activity.goalTitle}</p>
        <p className="mt-1 text-xs text-ink-muted">{activity.logDate}</p>
      </div>
      <span className="status-chip">{activity.minutesSpent}m</span>
    </div>

    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-ink-muted sm:grid-cols-4">
      <p>Points: {activity.pointsEarned}</p>
      <p>Streak: {activity.currentStreak}</p>
      <p>Total: {activity.totalPoints}</p>
      <p className={activity.suspicious ? 'text-red-700' : ''}>{activity.suspicious ? 'Under review' : 'Verified'}</p>
    </div>

    {activity.notes && <p className="mt-2 text-sm text-gray-700">{activity.notes}</p>}
    {activity.message && <p className="mt-2 text-xs text-ink-muted">{activity.message}</p>}
  </article>
);

export default ActivityEntry;
