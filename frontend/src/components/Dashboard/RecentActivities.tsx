import React from 'react';
import { RecentActivity } from '../../types';

interface RecentActivitiesProps {
  activities: RecentActivity[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities }) => {
  return (
    <div className="card">
      <h3 className="font-display text-lg font-bold text-gray-900">Recent Activity</h3>
      <div className="mt-4 space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white/80 p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-gray-900">{activity.goalTitle}</p>
              <p className="text-xs text-ink-muted">{activity.date}</p>
            </div>
            <span
              className="status-chip"
              style={{
                backgroundColor: `${activity.categoryColor}20`,
                color: activity.categoryColor,
              }}
            >
              {activity.minutes}m
            </span>
          </div>
        ))}

        {activities.length === 0 && <p className="text-sm text-ink-muted">No recent activity yet.</p>}
      </div>
    </div>
  );
};

export default RecentActivities;
