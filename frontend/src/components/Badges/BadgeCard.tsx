import React from 'react';
import { Badge } from '../../types';

interface BadgeCardProps {
  badge: Badge;
}

const BadgeCard: React.FC<BadgeCardProps> = ({ badge }) => {
  const progress = Math.max(0, Math.min(100, badge.progressPercentage || 0));
  const categoryLabel = badge.category || 'General';

  return (
    <article
      className={`card overflow-hidden ${
        badge.earned
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
          : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{categoryLabel}</p>
          <h3 className="mt-1 break-words font-display text-lg font-bold text-gray-900">{badge.name}</h3>
        </div>
        <span className={`status-chip ${badge.earned ? '' : 'warn'}`}>{badge.earned ? 'Earned' : 'Locked'}</span>
      </div>

      <p className="text-sm text-gray-700">{badge.description}</p>

      {badge.ruleText && <p className="mt-2 text-xs text-ink-muted">Rule: {badge.ruleText}</p>}

      {badge.earned ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-100/70 p-3">
          <p className="text-sm font-semibold text-emerald-800">Unlocked</p>
          {badge.earnedReason && <p className="mt-1 text-xs text-emerald-700">{badge.earnedReason}</p>}
          {badge.pointsBonus ? <p className="mt-1 text-xs text-emerald-700">Bonus: +{badge.pointsBonus} points</p> : null}
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
            <span>
              {badge.currentValue || 0} / {badge.requiredValue || '-'}
            </span>
            <span className="font-semibold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div className="h-2.5 rounded-full bg-primary-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </article>
  );
};

export default BadgeCard;
