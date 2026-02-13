import React from 'react';
import { LeaderboardEntry } from '../../store/enhancedLeaderboardSlice';

interface UserRankCardProps {
  kind: 'above' | 'me' | 'below';
  entry?: LeaderboardEntry;
}

const getRankLabel = (rank: number) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return String(rank);
};

const movementText = (movement?: number) => {
  if (!movement || movement === 0) return 'No change';
  return movement > 0 ? `Up ${movement}` : `Down ${Math.abs(movement)}`;
};

const cardTone: Record<UserRankCardProps['kind'], string> = {
  above: 'border-slate-200 bg-white/70',
  me: 'border-emerald-200 bg-emerald-50',
  below: 'border-amber-200 bg-amber-50',
};

const headingTone: Record<UserRankCardProps['kind'], string> = {
  above: 'text-ink-muted',
  me: 'text-emerald-700',
  below: 'text-amber-700',
};

const label: Record<UserRankCardProps['kind'], string> = {
  above: 'Above You',
  me: 'Your Rank',
  below: 'Below You',
};

const UserRankCard: React.FC<UserRankCardProps> = ({ kind, entry }) => {
  if (!entry) {
    return (
      <div className={`flex min-h-[158px] flex-col items-center justify-center rounded-2xl border p-4 text-center ${cardTone[kind]}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${headingTone[kind]}`}>{label[kind]}</p>
        <p className="mt-3 text-2xl font-bold text-gray-900">No competitor</p>
      </div>
    );
  }

  if (kind === 'me') {
    return (
      <div className={`flex min-h-[158px] flex-col items-center justify-center rounded-2xl border p-4 text-center ${cardTone[kind]}`}>
        <p className={`text-xs font-semibold uppercase tracking-wide ${headingTone[kind]}`}>{label[kind]}</p>
        <p className="mt-2 text-5xl font-black text-emerald-900">{getRankLabel(entry.rank)}</p>
        <p className="mt-1 text-sm font-semibold text-emerald-700">{movementText(entry.rankMovement)}</p>
        <p className="mt-1 text-sm font-semibold text-emerald-800">Score: {Number(entry.score || 0).toFixed(2)}</p>
        <p className="mt-1 text-xs text-emerald-700">
          {entry.daysActive} active days | {entry.streak} day streak
        </p>
      </div>
    );
  }

  return (
    <div className={`flex min-h-[158px] flex-col items-center justify-center rounded-2xl border p-4 text-center ${cardTone[kind]}`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${headingTone[kind]}`}>{label[kind]}</p>
      <p className="mt-3 text-3xl font-bold text-gray-900">
        {getRankLabel(entry.rank)} {entry.username}
      </p>
      <p className="mt-1 text-lg font-semibold text-gray-700">Score: {Number(entry.score || 0).toFixed(2)}</p>
    </div>
  );
};

export default UserRankCard;
