import React from 'react';
import { Badge } from '../../types';

interface EarnedBadgesProps {
  badges: Badge[];
}

const EarnedBadges: React.FC<EarnedBadgesProps> = ({ badges }) => {
  if (badges.length === 0) {
    return (
      <div className="card">
        <h3 className="font-display text-lg font-bold text-gray-900">Earned Badges</h3>
        <p className="mt-3 text-sm text-ink-muted">No badges earned yet. Keep logging consistent activity.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-display text-lg font-bold text-gray-900">Earned Badges</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {badges.map((badge, index) => (
          <article key={`${badge.id || badge.name}-${index}`} className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-sm font-semibold text-emerald-900">{badge.name}</p>
            <p className="mt-1 text-xs text-emerald-700">{badge.description}</p>
            {badge.earnedAt && <p className="mt-2 text-xs text-emerald-700">Earned: {badge.earnedAt}</p>}
          </article>
        ))}
      </div>
    </div>
  );
};

export default EarnedBadges;
