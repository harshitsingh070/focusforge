import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchEnhancedLeaderboard,
  fetchMyRankContext,
  LeaderboardEntry,
  LeaderboardPeriod,
} from '../../store/enhancedLeaderboardSlice';
import Navbar from '../Layout/Navbar';

const AUTO_REFRESH_INTERVAL_MS = 30000;

const periodOptions: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'All Time', value: 'ALL_TIME' },
];

const podiumHeight: Record<number, string> = {
  1: 'h-28',
  2: 'h-20',
  3: 'h-20',
};

const avatarTone = ['#F59E0B', '#60A5FA', '#FB7185'];

const getOrdinal = (value: number) => {
  if (value === 1) return '1st';
  if (value === 2) return '2nd';
  if (value === 3) return '3rd';
  return `${value}th`;
};

const getInitials = (username: string) => {
  return username
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
};

const EnhancedLeaderboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rankings, myContext, loading, error } = useSelector((state: RootState) => state.enhancedLeaderboard);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('MONTHLY');

  const dedupedRankings = useMemo(() => {
    const seen = new Set<number>();
    return rankings
      .filter((entry) => {
        if (seen.has(entry.userId)) {
          return false;
        }
        seen.add(entry.userId);
        return true;
      })
      .sort((a, b) => a.rank - b.rank);
  }, [rankings]);

  useEffect(() => {
    const refreshData = () => {
      const query = { period: selectedPeriod };
      dispatch(fetchEnhancedLeaderboard(query));
      dispatch(fetchMyRankContext(query));
    };

    refreshData();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [dispatch, selectedPeriod]);

  const highlightedUserId = myContext?.myRank?.userId;
  const topOne = dedupedRankings.find((entry) => entry.rank === 1);
  const topTwo = dedupedRankings.find((entry) => entry.rank === 2);
  const topThree = dedupedRankings.find((entry) => entry.rank === 3);
  const podiumEntries = [topTwo, topOne, topThree].filter(Boolean) as LeaderboardEntry[];

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <h1 className="section-title">Global Rankings</h1>
          <p className="section-subtitle">Compete with consistency, quality streaks, and focused effort.</p>
        </section>

        <section className="card mb-6 bg-gradient-to-br from-white/90 to-white/70">
          <div className="mb-4 flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`ff-pill ${selectedPeriod === option.value ? 'active' : ''}`}
                onClick={() => setSelectedPeriod(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          {podiumEntries.length > 0 ? (
            <div className="grid grid-cols-1 items-end gap-5 md:grid-cols-3">
              {podiumEntries.map((entry, index) => (
                <article key={entry.userId} className="text-center">
                  <div
                    className="mx-auto mb-3 grid h-28 w-28 place-items-center rounded-full border-4 border-white text-2xl font-extrabold text-white shadow-soft"
                    style={{ backgroundColor: avatarTone[index % avatarTone.length] }}
                  >
                    {getInitials(entry.username)}
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {getOrdinal(entry.rank)} {entry.username}
                  </p>
                  <p className="text-sm font-semibold text-slate-600">{entry.rawPoints} pts</p>
                  <div className={`mx-auto mt-3 w-full max-w-[180px] rounded-t-2xl bg-white/90 ${podiumHeight[entry.rank] || 'h-16'}`} />
                </article>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-slate-500">No podium data available yet.</p>
          )}
        </section>

        <section className="card">
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Rankings</h2>

          {error && !loading && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="data-table">
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
                  {dedupedRankings.map((entry) => (
                    <tr
                      key={`${entry.userId}-${entry.rank}`}
                      className={highlightedUserId === entry.userId ? 'bg-sky-50/70' : undefined}
                    >
                      <td className="font-bold">{entry.rank}</td>
                      <td className="font-semibold text-slate-900">{entry.username}</td>
                      <td className="text-right font-bold">{Number(entry.score || 0).toFixed(2)}</td>
                      <td className="text-right">{entry.rawPoints}</td>
                      <td className="text-right">
                        <span className="inline-flex items-center gap-1 font-semibold text-orange-600">
                          <span>ST</span>
                          {entry.streak}
                        </span>
                      </td>
                      <td className="text-right">{entry.daysActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dedupedRankings.length === 0 && <p className="py-8 text-center text-slate-500">No rankings available.</p>}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EnhancedLeaderboard;
