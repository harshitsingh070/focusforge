import React from 'react';
import { Badge } from '../../types';
import BadgeCard from './BadgeCard';

interface BadgeGridProps {
  badges: Badge[];
  emptyMessage?: string;
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, emptyMessage = 'No badges found for this filter.' }) => {
  if (badges.length === 0) {
    return (
      <div className="card text-center">
        <p className="text-ink-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {badges.map((badge, index) => (
        <BadgeCard key={`${badge.id || badge.name}-${index}`} badge={badge} />
      ))}
    </section>
  );
};

export default BadgeGrid;
