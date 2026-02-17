import React from 'react';
import { ActivityLog } from '../../types';

interface ActivityEntryProps {
  activity: ActivityLog;
}

const timelineTones = ['#6366F1', '#3B82F6', '#22C55E', '#84CC16', '#F97316'];

const ActivityEntry: React.FC<ActivityEntryProps> = ({ activity }) => {
  const tone = timelineTones[activity.id % timelineTones.length];
  const verified = !activity.suspicious;

  return (
    <article className="card relative overflow-hidden !p-0">
      <span className="absolute left-0 top-0 h-full w-1.5" style={{ backgroundColor: tone }} />
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-3xl font-bold tracking-tight text-slate-900">{activity.logDate}</p>
            <p className="mt-1 truncate text-lg font-semibold text-slate-700">{activity.goalTitle}</p>
          </div>
          <span className="rounded-full bg-slate-800 px-3 py-1 text-base font-semibold text-white">{activity.minutesSpent}m</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-500">
            +{activity.pointsEarned} pts
          </span>
          <span className="rounded-full border border-slate-300 px-3 py-1 font-medium text-slate-500">
            Streak {activity.currentStreak}
          </span>
          <span className={`rounded-full px-3 py-1 font-semibold ${verified ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
            {verified ? 'Verified' : 'Under Review'}
          </span>
        </div>

        {activity.notes && <p className="mt-3 text-sm text-slate-600">{activity.notes}</p>}
        {activity.message && <p className="mt-2 text-xs text-slate-400">{activity.message}</p>}
      </div>
    </article>
  );
};

export default ActivityEntry;
