import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { useFeedback } from '../../contexts/FeedbackContext';
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
import styles from '../Dashboard/Dashboard.module.css';

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
  const liveClassName = entry?.isNew
    ? 'ff-podium-live ff-podium-live--new'
    : (entry?.rankMovement || 0) > 0
      ? 'ff-podium-live ff-podium-live--rise'
      : (entry?.rankMovement || 0) < 0
        ? 'ff-podium-live ff-podium-live--drop'
        : '';
  const sizeClass =
    rank === 1
      ? 'h-28 w-28 sm:h-32 sm:w-32'
      : 'h-24 w-24 sm:h-28 sm:w-28';
  const initials = getInitials(entry?.username || '');

  return (
    <div className={`flex flex-col items-center ${liveClassName}`}>
      {/* Avatar with medal badge */}
      <div className={`relative ${sizeClass} rounded-full bg-white dark:bg-slate-900 p-1.5 shadow-lg ${config.ring}`}>
        <div
          className="flex h-full w-full items-center justify-center rounded-full text-lg font-extrabold text-white shadow-inner sm:text-xl"
          style={{ backgroundImage: entry ? getAvatarGradient(entry.userId) : 'linear-gradient(135deg,#64748b 0%,#94a3b8 100%)' }}
        >
          {entry ? initials : '?'}
        </div>
        {/* Medal badge */}
        <span className={`absolute -bottom-2 -right-2 inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-black text-white shadow-lg ${config.medalBg}`}>
          {rank}
        </span>
      </div>

      {/* User info - only show if entry exists */}
      {entry ? (
        <>
          <p className={`mt-3 text-base font-bold tracking-tight ${config.nameTone}`}>
            {entry.username}
          </p>
          <p className={`mt-1 rounded-full px-3 py-1 text-xs font-bold ${config.pointsTone} bg-slate-100 dark:bg-slate-800`}>
            {formatCount(entry.rawPoints)} XP
          </p>
        </>
      ) : null}

      {/* Pedestal - subtle background only */}
      <div
        className={`mt-3 flex w-full max-w-[200px] items-end justify-center rounded-t-xl ${
          rank === 1
            ? 'h-24 sm:h-28'
            : rank === 2
              ? 'h-20 sm:h-24'
              : 'h-16 sm:h-20'
        } border border-slate-200/40 dark:border-slate-700/40 bg-gradient-to-t ${config.pedestal}`}
      />

      {/* YOU badge */}
      {isMe && (
        <span className="mt-2.5 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-3 py-1 text-[10px] font-bold text-white shadow-md">
          YOU
        </span>
      )}
    </div>
  );
};

const EnhancedLeaderboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { pushToast, showReward } = useFeedback();
  const { rankings, myContext, trends, loading, error } = useSelector((state: RootState) => state.enhancedLeaderboard);

  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const hasAnnouncedRankRef = useRef(false);

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
    
    // Initial fetch immediately
    refreshData();
    
    // Then refresh every 10 seconds for more responsive data
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    }, 10000);
    
    // Also refresh when window gains focus
    const handleFocus = () => refreshData();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', handleFocus);
    };
  }, [dispatch, selectedCategory, selectedPeriod]);

  const selectedUserId = myContext?.myRank?.userId;
  const participants = myContext?.totalParticipants || dedupedRankings.length;
  const myRank = myContext?.myRank;
  const myLeaderboardEntry = useMemo(
    () => dedupedRankings.find((entry) => entry.userId === selectedUserId),
    [dedupedRankings, selectedUserId]
  );

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
        threshold: 7,
        progress: Math.min(100, (streak / 7) * 100),
        active: streak >= 7,
        chipClass: styles.dashboardStatusChipFocus,
      },
      {
        id: 'consistency',
        icon: 'task_alt',
        label: 'Consistency',
        value: `${days}d`,
        threshold: 15,
        progress: Math.min(100, (days / 15) * 100),
        active: days >= 15,
        chipClass: styles.dashboardStatusChipActive,
      },
      {
        id: 'points',
        icon: 'bolt',
        label: 'Power Score',
        value: `${formatCount(points)}`,
        threshold: 2500,
        progress: Math.min(100, (points / 2500) * 100),
        active: points >= 2500,
        chipClass: styles.dashboardStatusChipNeutral,
      },
    ];
  }, [myRank]);

  useEffect(() => {
    if (!myLeaderboardEntry) {
      return;
    }

    if (!hasAnnouncedRankRef.current) {
      hasAnnouncedRankRef.current = true;
      return;
    }

    if (myLeaderboardEntry.isNew) {
      pushToast({
        tone: 'violet',
        icon: 'leaderboard',
        title: 'You entered the leaderboard',
        message: `You are now ranked #${myLeaderboardEntry.rank}.`,
      });
      return;
    }

    if ((myLeaderboardEntry.rankMovement || 0) > 0) {
      const climb = myLeaderboardEntry.rankMovement || 0;
      pushToast({
        tone: 'emerald',
        icon: 'trending_up',
        title: `Up ${climb} place${climb === 1 ? '' : 's'}`,
        message: `You moved to #${myLeaderboardEntry.rank} this refresh.`,
      });

      if (climb >= 3) {
        showReward({
          tone: 'emerald',
          icon: 'emoji_events',
          eyebrow: 'Leaderboard Climb',
          title: `Rank #${myLeaderboardEntry.rank}`,
          message: `You jumped ${climb} places and now sit inside the live standings.`,
          statLabel: 'Score',
          statValue: formatCount(myLeaderboardEntry.rawPoints),
        });
      }
      return;
    }

    if ((myLeaderboardEntry.rankMovement || 0) < 0) {
      pushToast({
        tone: 'amber',
        icon: 'notifications_active',
        title: 'Leaderboard moved',
        message: `You slipped to #${myLeaderboardEntry.rank}. One more session can swing it back.`,
      });
    }
  }, [myLeaderboardEntry, pushToast, showReward]);

  return (
    <div className={`${styles.dashboardThemeScope} mx-auto flex w-full max-w-[1280px] flex-col gap-6 p-4 sm:p-8`}>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
        {/* Left column */}
        <div className="space-y-6">
          {/* Hero header */}
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
                <div className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>
                  Auto-refresh every 10s
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

          {error && !loading && (
            <div className={`${styles.dashboardPanelCard} rounded-2xl p-5`}>
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Top 3 Podium */}
          <section className={`${styles.dashboardPanelCard} rounded-2xl p-6`}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className={`text-xl font-black tracking-tight ${styles.dashboardGoalTitle}`}>Top 3 Podium</h3>
              <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>
                {PERIODS.find((p) => p.id === selectedPeriod)?.label || 'Selected period'}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="md:order-1 md:pt-8">
                <PodiumCard entry={top3[1]} rank={2} isMe={top3[1] && top3[1].userId === selectedUserId} />
              </div>
              <div className="md:order-2">
                <PodiumCard entry={top3[0]} rank={1} isMe={top3[0] && top3[0].userId === selectedUserId} />
              </div>
              <div className="md:order-3 md:pt-16">
                <PodiumCard entry={top3[2]} rank={3} isMe={top3[2] && top3[2].userId === selectedUserId} />
              </div>
            </div>
          </section>

          {/* Leaderboard Table */}
          <section className={`${styles.dashboardPanelCard} rounded-2xl p-6`}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className={`text-xl font-black tracking-tight ${styles.dashboardGoalTitle}`}>Leaderboard Table</h3>
              <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>
                {participants.toLocaleString()} participants
              </span>
            </div>

            {loading && dedupedRankings.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-[var(--ff-dashboard-track,var(--ff-border))] border-t-violet-500" />
              </div>
            ) : (
              <LeaderboardTable entries={dedupedRankings} highlightedUserId={selectedUserId} />
            )}
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-6 xl:sticky xl:top-8">
          {/* Your Status */}
          <section className={`${styles.dashboardPanelCard} relative overflow-hidden rounded-2xl p-5`}>
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="relative">
              <div className="mb-6 flex items-center justify-between">
                <h3 className={`text-lg font-black ${styles.dashboardGoalTitle}`}>Your Status</h3>
                <span className={`${styles.dashboardStatusChip} ${styles.dashboardStatusChipNeutral}`}>Global</span>
              </div>

              {myRank ? (
                <>
                  <div className="mb-6">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Current Rank</p>
                    <p className={`text-6xl font-black tracking-tight ${styles.dashboardGoalTitle}`}>
                      #{myRank.rank}
                    </p>
                  </div>
                  
                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-slate-500/10 to-slate-600/10 p-3 border border-slate-500/20 dark:border-slate-600/30">
                      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">XP Points</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{formatCount(myRank.rawPoints)}</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/10 p-3 border border-amber-500/20 dark:border-amber-600/30">
                      <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Percentile</p>
                      <p className="text-lg font-black text-amber-700 dark:text-amber-300">{percentile}%</p>
                    </div>
                  </div>

                  <div className="mb-6 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 p-3 border border-orange-500/20 dark:border-orange-600/30">
                      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-1">Streak</p>
                      <p className="text-lg font-black text-orange-700 dark:text-orange-300">{myRank.streak}d</p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 p-3 border border-emerald-500/20 dark:border-emerald-600/30">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Active Days</p>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{myRank.daysActive}d</p>
                    </div>
                  </div>

                  {/* Progress to next rank */}
                  {pointsToNextRank > 0 && (
                    <div className="rounded-lg border border-slate-200/60 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/20 p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400">Progress to Rank #{myRank.rank - 1}</span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{formatCount(pointsToNextRank)} XP needed</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-slate-300/20 dark:bg-slate-600/30">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg"
                          style={{
                            width: aboveMe ? `${Math.min(100, ((myRank.rawPoints || 0) / (aboveMe.rawPoints || 1)) * 100)}%` : '0%',
                            transition: 'width 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Sparkline with title */}
                  <div className={`rounded-xl border border-[var(--ff-dashboard-card-border,var(--ff-border))] p-4`}
                    style={{ background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))' }}>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-400 mb-2">Score Trend</p>
                    {sparklinePath ? (
                      <svg viewBox="0 0 240 56" className="h-12 w-full" preserveAspectRatio="none">
                        <path d={sparklinePath} fill="none" stroke="url(#ff-leaderboard-sparkline)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <defs>
                          <linearGradient id="ff-leaderboard-sparkline" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#7c3aed" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                    ) : (
                      <p className="py-2 text-center text-xs" style={{ color: 'var(--ff-dashboard-text-muted, var(--ff-text-500))' }}>Building score history...</p>
                    )}
                  </div>

                  {pointsToNextRank === 0 && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10 p-4 text-center">
                      <span className="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400 block mb-2">emoji_events</span>
                      <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">You are at the top!</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-400/30 p-6 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-400 dark:text-slate-500 block mb-3">trending_up</span>
                  <p className={`text-sm font-semibold ${styles.dashboardGoalMeta}`}>Start logging activity</p>
                  <p className={`text-xs mt-1 ${styles.dashboardGoalMeta}`}>Complete goals to earn points and climb the leaderboard</p>
                </div>
              )}

              {/* Status Badges */}
            </div>
          </section>

          <section className={`${styles.dashboardPanelCard} rounded-2xl p-5`}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className={`text-lg font-black ${styles.dashboardGoalTitle}`}>Achievement Badges</h3>
              <span className={`text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400`}>Progress</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {statusBadges.map((badge, index) => (
                <div
                  key={badge.id}
                  className={`rounded-xl p-4 border transition-all duration-300 ${
                    badge.active
                      ? `${badge.chipClass} shadow-sm`
                      : 'border-slate-200/60 bg-slate-50/50 dark:border-slate-700/40 dark:bg-slate-800/20'
                  }`}
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`material-symbols-outlined text-2xl ${badge.active ? 'text-current' : 'text-slate-400 dark:text-slate-500'}`}>
                      {badge.icon}
                    </span>
                    {badge.active && (
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-current/20">
                        <span className="material-symbols-outlined text-xs -ml-0.5">check</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest">{badge.label}</p>
                  <p className={`mt-2 text-2xl font-black ${badge.active ? 'text-current' : 'text-slate-700 dark:text-slate-300'}`}>
                    {badge.value}
                  </p>
                  
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-slate-300/20 dark:bg-slate-600/20">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        badge.active
                          ? 'bg-current shadow-lg'
                          : 'bg-gradient-to-r from-slate-400 to-slate-300 dark:from-slate-600 dark:to-slate-500'
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-right text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    {Math.round(badge.progress)}%
                  </p>
                </div>
              ))}
            </div>

            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(8px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </section>

          {/* Rivals */}
          <section className={`${styles.dashboardPanelCard} rounded-2xl p-5`}>
            <h3 className={`mb-4 text-lg font-black ${styles.dashboardGoalTitle}`}>Rivals</h3>
            <div className="space-y-3">
              {rivalEntries.map((entry) => {
                const isSelf = entry.userId === selectedUserId;
                return (
                  <div
                    key={`rival-${entry.userId}-${entry.rank}`}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${isSelf
                      ? 'border-violet-300 bg-violet-50 dark:border-violet-500/50 dark:bg-violet-500/10'
                      : ''
                    }`}
                    style={!isSelf ? {
                      border: '1px solid var(--ff-dashboard-card-border, var(--ff-border))',
                      background: 'var(--ff-dashboard-card-bottom, var(--ff-surface-soft))',
                    } : {}}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundImage: getAvatarGradient(entry.userId) }}
                      >
                        {getInitials(entry.username)}
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelf ? 'text-violet-400' : styles.dashboardGoalTitle}`}>
                          {isSelf ? 'You' : entry.username}
                        </p>
                        <p className={`text-xs ${styles.dashboardGoalMeta}`}>#{entry.rank}</p>
                      </div>
                    </div>
                    <p className={`text-sm font-black ${isSelf ? 'text-violet-400' : styles.dashboardGoalTitle}`}>
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
