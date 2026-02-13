import React from 'react';
import { LeaderboardEntry } from '../../store/enhancedLeaderboardSlice';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  highlightedUserId?: number;
}

const getRankLabel = (rank: number) => {
  if (rank === 1) return '1st';
  if (rank === 2) return '2nd';
  if (rank === 3) return '3rd';
  return String(rank);
};

const movementText = (movement?: number) => {
  if (!movement || movement === 0) return '';
  return movement > 0 ? `Up ${movement}` : `Down ${Math.abs(movement)}`;
};

const movementClass = (movement?: number) => {
  if (!movement || movement === 0) return 'text-ink-muted';
  return movement > 0 ? 'text-emerald-600' : 'text-red-600';
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, highlightedUserId }) => {
  if (entries.length === 0) {
    return <p className="py-8 text-center text-ink-muted">No rankings available for this period and category.</p>;
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="data-table table-fixed">
          <colgroup>
            <col className="w-[12%]" />
            <col className="w-[22%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[16%]" />
            <col className="w-[18%]" />
          </colgroup>
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th className="text-right">Score</th>
              <th className="text-right">Points</th>
              <th className="text-right">Streak</th>
              <th className="text-right">Days Active</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={`${entry.userId}-${entry.rank}`}
                className={highlightedUserId === entry.userId ? 'bg-primary-50' : ''}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold">{getRankLabel(entry.rank)}</span>
                    {entry.rankMovement !== undefined && entry.rankMovement !== 0 && (
                      <span className={`text-xs font-semibold ${movementClass(entry.rankMovement)}`}>
                        {movementText(entry.rankMovement)}
                      </span>
                    )}
                    {entry.isNew && (
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                        NEW
                      </span>
                    )}
                  </div>
                </td>
                <td className="font-semibold">{entry.username}</td>
                <td className="text-right font-bold text-primary-700 tabular-nums">
                  {Number(entry.score || 0).toFixed(2)}
                </td>
                <td className="text-right tabular-nums">{entry.rawPoints}</td>
                <td className="text-right tabular-nums">{entry.streak}</td>
                <td className="text-right tabular-nums">{entry.daysActive}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 lg:hidden">
        {entries.map((entry) => (
          <article
            key={`mobile-${entry.userId}-${entry.rank}`}
            className={`rounded-xl border p-4 ${
              highlightedUserId === entry.userId ? 'border-primary-200 bg-primary-50' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink-muted">{getRankLabel(entry.rank)}</p>
                <p className="font-semibold text-gray-900">{entry.username}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-primary-700">{Number(entry.score || 0).toFixed(2)}</p>
                {entry.rankMovement !== undefined && entry.rankMovement !== 0 && (
                  <p className={`text-xs font-semibold ${movementClass(entry.rankMovement)}`}>
                    {movementText(entry.rankMovement)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-ink-muted">
              <p className="tabular-nums">Points: {entry.rawPoints}</p>
              <p className="tabular-nums">Streak: {entry.streak}</p>
              <p className="tabular-nums">Days: {entry.daysActive}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
};

export default LeaderboardTable;
