import React, { useMemo } from 'react';
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

const getInitials = (value: string) => {
  const tokens = (value || '').split(/[\s@._-]+/).filter(Boolean).slice(0, 2);
  return tokens.length === 0 ? 'FF' : tokens.map((t) => t[0]?.toUpperCase() || '').join('');
};

const getAvatarGradient = (seed: number) => {
  const gradients = [
    'linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)',
    'linear-gradient(135deg,#2563eb 0%,#06b6d4 100%)',
    'linear-gradient(135deg,#16a34a 0%,#14b8a6 100%)',
    'linear-gradient(135deg,#ea580c 0%,#f59e0b 100%)',
    'linear-gradient(135deg,#db2777 0%,#8b5cf6 100%)',
  ];
  return gradients[Math.abs(seed) % gradients.length];
};

const getBadgeMeta = (entry: LeaderboardEntry) => {
  if ((entry.streak || 0) >= 14) {
    return {
      icon: 'local_fire_department',
      label: '14d Streak',
      className: 'border-orange-200 bg-orange-100/80 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300',
    };
  }
  if ((entry.streak || 0) >= 7) {
    return {
      icon: 'local_fire_department',
      label: '7d Streak',
      className: 'border-amber-200 bg-amber-100/80 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300',
    };
  }
  if ((entry.daysActive || 0) >= 15) {
    return {
      icon: 'task_alt',
      label: 'Taskmaster',
      className: 'border-emerald-200 bg-emerald-100/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300',
    };
  }
  if ((entry.rawPoints || 0) >= 3000) {
    return {
      icon: 'speed',
      label: 'Speedster',
      className: 'border-blue-200 bg-blue-100/80 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300',
    };
  }
  return {
    icon: 'military_tech',
    label: 'Rising',
    className: 'border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700/40 dark:text-slate-200',
  };
};

const movementMeta = (movement?: number) => {
  if (!movement || movement === 0) {
    return {
      label: '0',
      icon: 'horizontal_rule',
      className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300',
    };
  }
  if (movement > 0) {
    return {
      label: `${movement}`,
      icon: 'arrow_upward',
      className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    };
  }
  return {
    label: `${Math.abs(movement)}`,
    icon: 'arrow_downward',
    className: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  };
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ entries, highlightedUserId }) => {
  const maxScore = useMemo(
    () => Math.max(...entries.map((entry) => Number(entry.score || 0)), 1),
    [entries]
  );

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-slate-50 py-8 text-center text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300">
        No rankings available for this period and category.
      </p>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-[960px] w-full border-separate border-spacing-0">
          <thead>
            <tr className="rounded-xl bg-slate-100 text-xs uppercase tracking-[0.08em] text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
              <th className="px-4 py-3 text-center font-bold">Rank</th>
              <th className="px-4 py-3 text-left font-bold">Athlete</th>
              <th className="px-4 py-3 text-left font-bold">Performance</th>
              <th className="px-4 py-3 text-right font-bold">Score</th>
              <th className="px-4 py-3 text-left font-bold">Top Badge</th>
              <th className="px-4 py-3 text-center font-bold">Trend</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => {
              const isSelf = highlightedUserId === entry.userId;
              const badge = getBadgeMeta(entry);
              const trend = movementMeta(entry.rankMovement);
              const score = Number(entry.score || 0);
              const progressPercent = Math.max(8, Math.round((score / maxScore) * 100));

              return (
                <tr
                  key={`${entry.userId}-${entry.rank}`}
                  className={`transition-colors ${isSelf ? 'bg-violet-50/80 dark:bg-violet-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                >
                  <td className="border-b border-slate-200/80 px-4 py-4 text-center dark:border-slate-800">
                    <span className={`inline-flex min-w-8 items-center justify-center rounded-full px-2 py-1 text-sm font-black ${entry.rank === 1
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300'
                        : entry.rank === 2
                          ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          : entry.rank === 3
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                      {getRankLabel(entry.rank)}
                    </span>
                  </td>

                  <td className="border-b border-slate-200/80 px-4 py-4 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundImage: getAvatarGradient(entry.userId) }}
                      >
                        {getInitials(entry.username)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {entry.username}
                          {isSelf && (
                            <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                              Me
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {entry.daysActive} active days • {entry.streak} day streak
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="border-b border-slate-200/80 px-4 py-4 dark:border-slate-800">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className={`h-full rounded-full ${isSelf ? 'bg-gradient-to-r from-violet-600 to-purple-500 shadow-[0_0_14px_rgba(124,58,237,0.45)]' : 'bg-gradient-to-r from-sky-500 to-blue-500'}`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </td>

                  <td className="border-b border-slate-200/80 px-4 py-4 text-right dark:border-slate-800">
                    <p className={`font-mono text-lg font-black tabular-nums ${isSelf ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-white'}`}>
                      {Number(entry.rawPoints || 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">index {score.toFixed(1)}</p>
                  </td>

                  <td className="border-b border-slate-200/80 px-4 py-4 dark:border-slate-800">
                    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${badge.className}`}>
                      <span className="material-symbols-outlined text-[15px]">{badge.icon}</span>
                      {badge.label}
                    </span>
                  </td>

                  <td className="border-b border-slate-200/80 px-4 py-4 text-center dark:border-slate-800">
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black ${trend.className}`}>
                      <span className="material-symbols-outlined text-[14px]">{trend.icon}</span>
                      {trend.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 lg:hidden">
        {entries.map((entry) => {
          const isSelf = highlightedUserId === entry.userId;
          const badge = getBadgeMeta(entry);
          const trend = movementMeta(entry.rankMovement);
          const score = Number(entry.score || 0);
          const progressPercent = Math.max(8, Math.round((score / maxScore) * 100));

          return (
            <article
              key={`mobile-${entry.userId}-${entry.rank}`}
              className={`rounded-xl border p-4 ${isSelf
                  ? 'border-violet-300 bg-violet-50 dark:border-violet-500/40 dark:bg-violet-500/10'
                  : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900'
                }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {getRankLabel(entry.rank)}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {entry.username}
                      {isSelf && (
                        <span className="ml-2 rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Me
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{entry.daysActive}d active • {entry.streak}d streak</p>
                  </div>
                </div>
                <p className={`font-mono text-lg font-black ${isSelf ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-white'}`}>
                  {Number(entry.rawPoints || 0).toLocaleString()}
                </p>
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className={`h-full rounded-full ${isSelf ? 'bg-gradient-to-r from-violet-600 to-purple-500' : 'bg-gradient-to-r from-sky-500 to-blue-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold ${badge.className}`}>
                  <span className="material-symbols-outlined text-[15px]">{badge.icon}</span>
                  {badge.label}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-black ${trend.className}`}>
                  <span className="material-symbols-outlined text-[14px]">{trend.icon}</span>
                  {trend.label}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
};

export default LeaderboardTable;
