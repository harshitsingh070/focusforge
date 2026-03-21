import React from 'react';
import { ActivityLog } from '../../types';

interface ActivityEntryProps {
  activity: ActivityLog;
}

const timelineTones = ['#8B5CF6', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444'];

const ActivityEntry: React.FC<ActivityEntryProps> = ({ activity }) => {
  const tone = timelineTones[activity.id % timelineTones.length];
  const verified = !activity.suspicious;

  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <span className="absolute left-0 top-0 h-full w-1.5 rounded-l-2xl" style={{ backgroundColor: tone }} />
      <div className="p-4 sm:p-5 pl-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{activity.logDate}</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">{activity.goalTitle}</p>
          </div>
          <span className="shrink-0 rounded-xl bg-slate-900 dark:bg-slate-700 px-3 py-1.5 text-sm font-bold text-white">
            {activity.minutesSpent}m
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-600 dark:text-slate-400">
            +{activity.pointsEarned} pts
          </span>
          <span className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 font-semibold text-slate-600 dark:text-slate-400">
            🔥 Streak {activity.currentStreak}
          </span>
          <span className={`rounded-full px-2.5 py-1 font-semibold ${
            verified
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
              : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
          }`}>
            {verified ? '✓ Verified' : '⏳ Under Review'}
          </span>
        </div>

        {activity.notes && <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{activity.notes}</p>}
        {activity.message && <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">{activity.message}</p>}
      </div>
    </article>
  );
};

export default ActivityEntry;
