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
import Navbar from '../Layout/Navbar';
import FilterBar from './FilterBar';
import LeaderboardTable from './LeaderboardTable';
import TrendChart from './TrendChart';
import UserRankCard from './UserRankCard';

const AUTO_REFRESH_INTERVAL_MS = 30000;

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
      .sort((left, right) => {
        if (left.rank !== right.rank) {
          return left.rank - right.rank;
        }
        return right.score - left.score;
      });
  }, [rankings]);

  useEffect(() => {
    const refreshData = () => {
      const query = { category: selectedCategory, period: selectedPeriod };
      dispatch(fetchEnhancedLeaderboard(query));
      dispatch(fetchMyRankContext(query));
      dispatch(fetchTrends({ category: selectedCategory }));
    };

    refreshData();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [dispatch, selectedCategory, selectedPeriod]);

  const selectedUserId = myContext?.myRank?.userId;
  const participants = myContext?.totalParticipants || dedupedRankings.length;

  const getFallbackRankContextEntry = (kind: 'above' | 'below'): LeaderboardEntry | undefined => {
    if (!selectedUserId || dedupedRankings.length === 0) {
      return undefined;
    }
    const index = dedupedRankings.findIndex((entry) => entry.userId === selectedUserId);
    if (index < 0) {
      return undefined;
    }
    if (kind === 'above') {
      return index > 0 ? dedupedRankings[index - 1] : undefined;
    }
    return index < dedupedRankings.length - 1 ? dedupedRankings[index + 1] : undefined;
  };

  const aboveMe = myContext?.aboveMe || getFallbackRankContextEntry('above');
  const belowMe = myContext?.belowMe || getFallbackRankContextEntry('below');

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <p className="status-chip">Live Competition</p>
          <h1 className="section-title mt-3">Enhanced Leaderboard</h1>
          <p className="section-subtitle">Normalized rankings based on consistency, streaks, and activity.</p>
          <p className="mt-1 text-sm text-ink-muted">Auto-refreshes every 30 seconds</p>
        </section>

        <FilterBar
          selectedPeriod={selectedPeriod}
          selectedCategory={selectedCategory}
          onPeriodChange={setSelectedPeriod}
          onCategoryChange={setSelectedCategory}
        />

        <TrendChart trends={trends} />

        {myContext?.notRanked && !loading && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <strong>Not ranked yet.</strong> {myContext.reason}
            </p>
          </div>
        )}

        {myContext?.myRank && !myContext.notRanked && (
          <section className="card mb-6">
            <h2 className="font-display text-3xl font-bold text-gray-900">Your Position</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <UserRankCard kind="above" entry={aboveMe} />
              <UserRankCard kind="me" entry={myContext.myRank} />
              <UserRankCard kind="below" entry={belowMe} />
            </div>
            {participants > 0 && (
              <p className="mt-4 text-center text-sm text-ink-muted">Competing with {participants} participants</p>
            )}
          </section>
        )}

        {error && !loading && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <section className="card">
          <h2 className="font-display text-3xl font-bold text-gray-900">Rankings</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
            </div>
          ) : (
            <LeaderboardTable entries={dedupedRankings} highlightedUserId={selectedUserId} />
          )}
        </section>
      </main>
    </div>
  );
};

export default EnhancedLeaderboard;
