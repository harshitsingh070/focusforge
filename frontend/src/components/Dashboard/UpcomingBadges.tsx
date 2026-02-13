import React from 'react';
import { Badge } from '../../types';

interface UpcomingBadgesProps {
  badges: Badge[];
}

const UpcomingBadges: React.FC<UpcomingBadgesProps> = ({ badges }) => {
  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <h3 className="font-display text-lg font-bold text-gray-900">Recent Badges</h3>
      <div className="mt-4 space-y-3">
        {badges.map((badge, index) => (
          <div key={`${badge.name}-${index}`} className="rounded-xl border border-amber-100 bg-amber-50 p-3">
            <p className="font-semibold text-gray-900">{badge.name}</p>
            <p className="text-sm text-ink-muted">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingBadges;
