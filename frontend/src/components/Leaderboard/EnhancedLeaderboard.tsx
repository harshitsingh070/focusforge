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
import UserRankCard from './UserRankCard';

const AUTO_REFRESH_INTERVAL_MS = 30000;

const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: 'WEEKLY', label: 'This Week' },
  { id: 'MONTHLY', label: 'This Month' },
  { id: 'ALL_TIME', label: 'All Time' },
];

const getInitials = (value: string) => {
  const tokens = (value || '').split(/[\s@._-]+/).filter(Boolean).slice(0, 2);
  return tokens.length === 0 ? 'FF' : tokens.map((t) => t[0]?.toUpperCase() || '').join('');
};

const PodiumCard: React.FC<{
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  isMe: boolean;
}> = ({ entry, rank, isMe }) => {
  const config = {
    1: { medal: '🥇', ringClass: 'ring-2 ring-yellow-400/60', gradient: 'from-yellow-500/20 to-amber-500/10', scale: 'scale-105', label: 'Champion', labelClass: 'bg-yellow-500/20 text-yellow-400 dark:text-yellow-300' },
    2: { medal: '🥈', ringClass: 'ring-2 ring-slate-400/50', gradient: 'from-slate-400/10 to-slate-500/5', scale: 'scale-100', label: 'Runner Up', labelClass: 'bg-slate-400/15 text-slate-400' },
    3: { medal: '🥉', ringClass: 'ring-2 ring-amber-600/50', gradient: 'from-amber-600/10 to-orange-600/5', scale: 'scale-100', label: '3rd Place', labelClass: 'bg-amber-600/15 text-amber-400' },
  }[rank];
  const avatarInitials = getInitials(entry.username || '');

  return (
    <div className={`relative flex flex-col items-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b ${config.gradient} bg-white dark:bg-slate-900 p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${config.scale} ${isMe ? 'border-violet-500/50 dark:border-violet-500/50' : ''}`}>
      {isMe && <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-violet-500/30">YOU</span>}
      <span className="mb-2 text-2xl">{config.medal}</span>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-bold text-white shadow-md shadow-violet-500/30 ${config.ringClass}`}>{avatarInitials}</div>
      <p className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white leading-snug">{entry.username || `User #${entry.userId}`}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{entry.score?.toLocaleString() ?? 0} pts</p>
      <span className={`mt-2 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${config.labelClass}`}>{config.label}</span>
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
      .filter((entry) => { if (seen.has(entry.userId)) return false; seen.add(entry.userId); return true; })
      .sort((a, b) => a.rank !== b.rank ? a.rank - b.rank : b.score - a.score);
  }, [rankings]);

  useEffect(() => {
    const refreshData = () => {
      const query = { category: selectedCategory, period: selectedPeriod };
      dispatch(fetchEnhancedLeaderboard(query));
      dispatch(fetchMyRankContext(query));
      dispatch(fetchTrends({ category: selectedCategory }));
    };
    refreshData();
    const id = window.setInterval(() => { if (document.visibilityState === 'visible') refreshData(); }, AUTO_REFRESH_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [dispatch, selectedCategory, selectedPeriod]);

  const selectedUserId = myContext?.myRank?.userId;
  const participants = myContext?.totalParticipants || dedupedRankings.length;

  const getFallbackRankContextEntry = (kind: 'above' | 'below'): LeaderboardEntry | undefined => {
    if (!selectedUserId || dedupedRankings.length === 0) return undefined;
    const index = dedupedRankings.findIndex((e) => e.userId === selectedUserId);
    if (index < 0) return undefined;
    return kind === 'above' ? (index > 0 ? dedupedRankings[index - 1] : undefined) : (index < dedupedRankings.length - 1 ? dedupedRankings[index + 1] : undefined);
  };

  const aboveMe = myContext?.aboveMe || getFallbackRankContextEntry('above');
  const belowMe = myContext?.belowMe || getFallbackRankContextEntry('below');
  const top3 = dedupedRankings.slice(0, 3);

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-50 via-white to-indigo-50 p-5 shadow-[0_16px_36px_rgba(99,102,241,0.16)] dark:from-slate-900 dark:via-slate-900 dark:to-violet-950 dark:shadow-[0_24px_48px_rgba(2,6,23,0.35)] sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-violet-400/25 blur-3xl dark:bg-violet-500/20" />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">🏆 Leaderboard</h2>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">Compete on consistency, not volume. Auto-refreshes every 30s.</p>
            </div>
            <div className="flex gap-2">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150 ${selectedPeriod === p.id ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-sm shadow-violet-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <FilterBar selectedPeriod={selectedPeriod} selectedCategory={selectedCategory} onPeriodChange={setSelectedPeriod} onCategoryChange={setSelectedCategory} />
        <TrendChart trends={trends} />

        {myContext?.notRanked && !loading && (
          <div className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-5">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-500 text-xl shrink-0 mt-0.5">warning</span>
              <div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Not ranked yet</p>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">{myContext.reason}</p>
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-5">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && top3.length >= 3 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🏆</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Performers</h3>
            </div>
            <div className="grid grid-cols-3 gap-4 items-end">
              {top3[1] && <PodiumCard entry={top3[1]} rank={2} isMe={top3[1].userId === selectedUserId} />}
              {top3[0] && <div className="row-start-1 order-2"><PodiumCard entry={top3[0]} rank={1} isMe={top3[0].userId === selectedUserId} /></div>}
              {top3[2] && <PodiumCard entry={top3[2]} rank={3} isMe={top3[2].userId === selectedUserId} />}
            </div>
          </section>
        )}

        {myContext?.myRank && !myContext.notRanked && (
          <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Your Position</h3>
              {participants > 0 && <span className="text-xs text-slate-500 dark:text-slate-400">{participants} participants</span>}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <UserRankCard kind="above" entry={aboveMe} />
              <UserRankCard kind="me" entry={myContext.myRank} />
              <UserRankCard kind="below" entry={belowMe} />
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Rankings</h3>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-violet-500" />
            </div>
          ) : (
            <LeaderboardTable entries={dedupedRankings} highlightedUserId={selectedUserId} />
          )}
        </section>
      </div>
    </>
  );
};

export default EnhancedLeaderboard;
