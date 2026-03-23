import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchEnhancedLeaderboard,
  fetchMyRankContext,
  fetchTrends,
  LeaderboardEntry,
  LeaderboardPeriod,
} from '../../store/enhancedLeaderboardSlice';
import FilterBar from './FilterBar';
import LeaderboardTable from './LeaderboardTable';
import TrendChart from './TrendChart';

const AUTO_REFRESH_INTERVAL_MS = 30000;

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'WEEKLY', label: 'This Week' },
  { id: 'MONTHLY', label: 'This Month' },
  { id: 'ALL_TIME', label: 'All Time' },
];

const podiumConfig: Record<
  1 | 2 | 3,
  {
    ring: string;
    medalBg: string;
    nameTone: string;
    pointsTone: string;
    pedestal: string;
  }
> = {
  1: {
    ring: 'ring-2 ring-yellow-400/70',
    medalBg: 'bg-gradient-to-br from-yellow-400 to-amber-500',
    nameTone: 'text-slate-900 dark:text-yellow-100',
    pointsTone: 'text-yellow-700 dark:text-yellow-300',
    pedestal: 'from-yellow-300/40 to-amber-300/10 dark:from-yellow-400/30 dark:to-amber-300/10',
  },
  2: {
    ring: 'ring-2 ring-slate-400/60',
    medalBg: 'bg-gradient-to-br from-slate-300 to-slate-500',
    nameTone: 'text-slate-900 dark:text-slate-100',
    pointsTone: 'text-slate-700 dark:text-slate-300',
    pedestal: 'from-slate-300/40 to-slate-300/10 dark:from-slate-400/25 dark:to-slate-300/10',
  },
  3: {
    ring: 'ring-2 ring-orange-500/60',
    medalBg: 'bg-gradient-to-br from-orange-400 to-amber-700',
    nameTone: 'text-slate-900 dark:text-orange-100',
    pointsTone: 'text-orange-700 dark:text-orange-300',
    pedestal: 'from-orange-300/40 to-amber-300/10 dark:from-orange-400/25 dark:to-amber-300/10',
  },
};

const getInitials = (value: string) => {
  const tokens = (value || '').split(/[\s@._-]+/).filter(Boolean).slice(0, 2);
  return tokens.length === 0 ? 'FF' : tokens.map((t) => t[0]?.toUpperCase() || '').join('');
};

const formatCount = (value: number | undefined) =>
  Number.isFinite(value) ? Number(value).toLocaleString() : '0';

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

const getPercentile = (rank: number, total: number) => {
  if (!Number.isFinite(rank) || !Number.isFinite(total) || total <= 0) return null;
  return Math.max(1, Math.round((1 - (rank - 1) / total) * 100));
};

const buildSparklinePath = (values: number[], width: number, height: number) => {
  if (values.length === 0) return '';
  if (values.length === 1) {
    const y = height / 2;
    return `M 0 ${y} L ${width} ${y}`;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(' ');
};

const PodiumCard: React.FC<{
  entry?: LeaderboardEntry;
  rank: 1 | 2 | 3;
  isMe: boolean;
}> = ({ entry, rank, isMe }) => {
  const config = podiumConfig[rank];
  const sizeClass =
    rank === 1
      ? 'h-28 w-28 sm:h-32 sm:w-32'
      : 'h-24 w-24 sm:h-28 sm:w-28';
  const pedestalClass =
    rank === 1 ? 'h-28 sm:h-32' : rank === 2 ? 'h-24 sm:h-28' : 'h-20 sm:h-24';
  const initials = getInitials(entry?.username || '');

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${sizeClass} rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-lg ${config.ring}`}>
        <div
          className="flex h-full w-full items-center justify-center rounded-full text-lg font-extrabold text-white shadow-inner sm:text-xl"
          style={{ backgroundImage: getAvatarGradient(entry?.userId || rank) }}
        >
          {entry ? initials : '--'}
        </div>
        <span className={`absolute -bottom-1.5 -right-1.5 inline-flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-black text-white shadow-md ${config.medalBg}`}>
          #{rank}
        </span>
      </div>
      <p className={`mt-3 text-base font-black tracking-tight ${config.nameTone}`}>
        {entry?.username || 'Waiting...'}
      </p>
      <p className={`mt-0.5 rounded-full px-3 py-1 text-xs font-bold ${config.pointsTone} bg-slate-100 dark:bg-slate-800`}>
        {entry ? `${formatCount(entry.rawPoints)} XP` : 'No score yet'}
      </p>
      <div
        className={`mt-3 flex w-full max-w-[220px] items-end justify-center rounded-t-2xl border border-slate-200/80 bg-gradient-to-t ${config.pedestal} dark:border-slate-700/70 ${pedestalClass}`}
      >
        <span className="mb-2 text-3xl font-black text-slate-500/35 dark:text-slate-200/20">{rank}</span>
      </div>
      {isMe && (
        <span className="mt-2 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
          YOU
        </span>
      )}
    </div>
  );
};

const EnhancedLeaderboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rankings, myContext, trends, loading, error } = useSelector((state: RootState) => state.enhancedLeaderboard);

  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const dedupedRankings = useMemo(() => {
    const seen = new Set<number>();
    return rankings
      .filter((entry) => {
        if (seen.has(entry.userId)) return false;
        seen.add(entry.userId);
        return true;
      })
      .sort((a, b) => (a.rank !== b.rank ? a.rank - b.rank : b.score - a.score));
  }, [rankings]);

  useEffect(() => {
    const refreshData = () => {
      const query = { category: selectedCategory, period: selectedPeriod };
      dispatch(fetchEnhancedLeaderboard(query));
      dispatch(fetchMyRankContext(query));
      dispatch(fetchTrends({ category: selectedCategory }));
    };
    refreshData();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshData();
    }, AUTO_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [dispatch, selectedCategory, selectedPeriod]);

  const selectedUserId = myContext?.myRank?.userId;
  const participants = myContext?.totalParticipants || dedupedRankings.length;
  const myRank = myContext?.myRank;

  const getFallbackRankContextEntry = (kind: 'above' | 'below'): LeaderboardEntry | undefined => {
    if (!selectedUserId || dedupedRankings.length === 0) return undefined;
    const index = dedupedRankings.findIndex((e) => e.userId === selectedUserId);
    if (index < 0) return undefined;
    return kind === 'above'
      ? (index > 0 ? dedupedRankings[index - 1] : undefined)
      : (index < dedupedRankings.length - 1 ? dedupedRankings[index + 1] : undefined);
  };

  const aboveMe = myContext?.aboveMe || getFallbackRankContextEntry('above');
  const belowMe = myContext?.belowMe || getFallbackRankContextEntry('below');
  const top3 = dedupedRankings.slice(0, 3);

  const percentile = myRank ? getPercentile(myRank.rank, participants) : null;
  const pointsToNextRank = myRank && aboveMe
    ? Math.max((aboveMe.rawPoints || 0) - (myRank.rawPoints || 0), 0)
    : 0;

  const sparklineValues = useMemo(() => {
    if (trends.length > 0) return trends.map((point) => Number(point.topScore || 0));
    return dedupedRankings.slice(0, 5).reverse().map((entry) => Number(entry.score || 0));
  }, [trends, dedupedRankings]);

  const sparklinePath = useMemo(
    () => buildSparklinePath(sparklineValues, 240, 56),
    [sparklineValues]
  );

  const rivalEntries = useMemo(() => {
    const source = [aboveMe, myRank, belowMe].filter(Boolean) as LeaderboardEntry[];
    if (source.length === 0) return top3;
    const seen = new Set<number>();
    return source.filter((entry) => {
      if (seen.has(entry.userId)) return false;
      seen.add(entry.userId);
      return true;
    });
  }, [aboveMe, belowMe, myRank, top3]);

  const statusBadges = useMemo(() => {
    const streak = myRank?.streak || 0;
    const days = myRank?.daysActive || 0;
    const points = myRank?.rawPoints || 0;

    return [
      {
        id: 'streak',
        icon: 'local_fire_department',
        label: '7D Streak',
        value: `${streak}d`,
        active: streak >= 7,
        activeTone: 'text-orange-600 dark:text-orange-300 bg-orange-100 dark:bg-orange-500/15 border-orange-200 dark:border-orange-500/30',
      },
      {
        id: 'consistency',
        icon: 'task_alt',
        label: 'Consistency',
        value: `${days}d`,
        active: days >= 15,
        activeTone: 'text-emerald-600 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15 border-emerald-200 dark:border-emerald-500/30',
      },
      {
        id: 'points',
        icon: 'bolt',
        label: 'Power Score',
        value: `${formatCount(points)}`,
        active: points >= 2500,
        activeTone: 'text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-500/15 border-violet-200 dark:border-violet-500/30',
      },
    ];
  }, [myRank]);

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-6 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
            <div className="relative">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                    Global Rankings
                  </h2>
                  <p className="mt-1 text-base text-slate-600 dark:text-slate-300">
                    Real-time performance metrics and standings.
                  </p>
                </div>
                <div className="rounded-xl border border-violet-200/70 bg-white/70 px-3 py-2 text-sm font-semibold text-violet-700 dark:border-violet-500/30 dark:bg-slate-900/50 dark:text-violet-300">
                  Auto-refresh every 30s
                </div>
              </div>
            </div>
          </section>

          <FilterBar
            selectedPeriod={selectedPeriod}
            selectedCategory={selectedCategory}
            onPeriodChange={setSelectedPeriod}
            onCategoryChange={setSelectedCategory}
          />

          <TrendChart trends={trends} />

          {myContext?.notRanked && !loading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-amber-500">warning</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Not ranked yet</p>
                  <p className="mt-1 text-sm text-amber-700 dark:text-amber-200">{myContext.reason}</p>
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-500/30 dark:bg-red-500/10">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Top 3 Podium</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {PERIODS.find((p) => p.id === selectedPeriod)?.label || 'Selected period'}
              </span>
            </div>
            <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-3">
              <div className="md:order-1">
                <PodiumCard entry={top3[1]} rank={2} isMe={top3[1]?.userId === selectedUserId} />
              </div>
              <div className="md:order-2">
                <PodiumCard entry={top3[0]} rank={1} isMe={top3[0]?.userId === selectedUserId} />
              </div>
              <div className="md:order-3">
                <PodiumCard entry={top3[2]} rank={3} isMe={top3[2]?.userId === selectedUserId} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Leaderboard Table</h3>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                {participants.toLocaleString()} participants
              </span>
            </div>

            {loading && dedupedRankings.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-violet-500 dark:border-slate-700 dark:border-t-violet-400" />
              </div>
            ) : (
              <LeaderboardTable entries={dedupedRankings} highlightedUserId={selectedUserId} />
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-violet-500/15 blur-2xl" />
            <div className="relative">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Your Status</h3>
                <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Global
                </span>
              </div>

              <p className="text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                {myRank ? `#${myRank.rank}` : '--'}
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {percentile
                  ? <>Top <strong className="text-violet-600 dark:text-violet-300">{percentile}%</strong> of all athletes this period.</>
                  : 'Start logging activity to appear in the leaderboard.'}
              </p>

              <div className="mt-5 rounded-xl border border-slate-200/80 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/70">
                {sparklinePath ? (
                  <svg viewBox="0 0 240 56" className="h-14 w-full" preserveAspectRatio="none">
                    <path d={sparklinePath} fill="none" stroke="url(#ff-leaderboard-sparkline)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="ff-leaderboard-sparkline" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                ) : (
                  <p className="py-3 text-center text-xs text-slate-500 dark:text-slate-400">Trend data will appear soon.</p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800/70">
                <span className="text-slate-500 dark:text-slate-400">Next rank up</span>
                <span className="font-bold text-violet-600 dark:text-violet-300">
                  {pointsToNextRank > 0 ? `+ ${formatCount(pointsToNextRank)} XP` : 'You are at the top'}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">Badges</h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {statusBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-xl border p-2.5 text-center transition-colors ${badge.active
                      ? badge.activeTone
                      : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                >
                  <span className="material-symbols-outlined text-[22px]">{badge.icon}</span>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide">{badge.label}</p>
                  <p className="mt-0.5 text-[11px] font-black">{badge.value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-lg font-black text-slate-900 dark:text-white">Rivals</h3>
            <div className="space-y-3">
              {rivalEntries.map((entry) => {
                const isSelf = entry.userId === selectedUserId;
                return (
                  <div
                    key={`rival-${entry.userId}-${entry.rank}`}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${isSelf
                        ? 'border-violet-300 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-500/10'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/60'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundImage: getAvatarGradient(entry.userId) }}
                      >
                        {getInitials(entry.username)}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelf ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-white'}`}>
                          {isSelf ? 'You' : entry.username}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">#{entry.rank}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${isSelf ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-200'}`}>
                      {formatCount(entry.rawPoints)}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default EnhancedLeaderboard;
