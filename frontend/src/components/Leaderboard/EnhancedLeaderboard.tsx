import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchEnhancedLeaderboard, fetchMyRankContext } from '../../store/enhancedLeaderboardSlice';
import Navbar from '../Layout/Navbar';

const AUTO_REFRESH_INTERVAL_MS = 30000;

const EnhancedLeaderboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rankings, myContext, loading, error } = useSelector(
    (state: RootState) => state.enhancedLeaderboard
  );

  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  const categories = ['overall', 'Coding', 'Health', 'Reading', 'Academics', 'Career Skills'];

  const uniqueRankings = useMemo(() => {
    const seen = new Set<number>();
    return rankings.filter((entry) => {
      if (seen.has(entry.userId)) return false;
      seen.add(entry.userId);
      return true;
    });
  }, [rankings]);

  useEffect(() => {
    const refreshData = () => {
      dispatch(fetchEnhancedLeaderboard({ category: selectedCategory, period: selectedPeriod }));
      dispatch(fetchMyRankContext({ category: selectedCategory, period: selectedPeriod }));
    };

    refreshData();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    }, AUTO_REFRESH_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [dispatch, selectedCategory, selectedPeriod]);

  const getRankLabel = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return rank.toString();
  };

  const movementText = (movement?: number) => {
    if (!movement || movement === 0) return '';
    return movement > 0 ? `Up ${movement}` : `Down ${Math.abs(movement)}`;
  };

  const movementClass = (movement?: number) => {
    if (!movement || movement === 0) return 'text-ink-muted';
    return movement > 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const formatScore = (score: number) => Number(score || 0).toFixed(2);

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <p className="status-chip">Live Competition</p>
          <h1 className="section-title mt-3">Enhanced Leaderboard</h1>
          <p className="section-subtitle">Normalized rankings based on consistency, streaks, and activity.</p>
        </section>

        <section className="card mb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Period</p>
          <div className="scrollbar-soft flex gap-2 overflow-x-auto pb-1">
            {['WEEKLY', 'MONTHLY', 'ALL_TIME'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                  selectedPeriod === period
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'border border-slate-200 bg-white text-gray-700'
                }`}
              >
                {period === 'ALL_TIME' ? 'All Time' : period.charAt(0) + period.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <p className="mb-3 mt-5 text-xs font-semibold uppercase tracking-wide text-ink-muted">Category</p>
          <div className="scrollbar-soft flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => {
              const active = (cat === 'overall' && !selectedCategory) || selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat === 'overall' ? undefined : cat)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                    active ? 'bg-primary-100 text-primary-700' : 'border border-slate-200 bg-white text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </section>

        {myContext && !myContext.notRanked && myContext.myRank && (
          <section className="card mb-6">
            <h2 className="font-display text-xl font-bold text-gray-900">Your Position</h2>
            <div
              className={`mt-4 grid grid-cols-1 gap-4 ${
                myContext.aboveMe && myContext.belowMe ? 'md:grid-cols-3' : 'md:grid-cols-2'
              }`}
            >
              {myContext.aboveMe && (
                <div className="flex min-h-[144px] flex-col items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Above You</p>
                  <p className="mt-2 text-lg font-bold text-sky-900">
                    {getRankLabel(myContext.aboveMe.rank)} {myContext.aboveMe.username}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-sky-800">
                    Score: {formatScore(myContext.aboveMe.score)}
                  </p>
                </div>
              )}

              <div className="flex min-h-[144px] flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Your Rank</p>
                <p className="mt-2 text-4xl font-black text-emerald-900">{getRankLabel(myContext.myRank.rank)}</p>
                {myContext.myRank.rankMovement !== undefined && myContext.myRank.rankMovement !== 0 && (
                  <p className={`text-sm font-semibold ${movementClass(myContext.myRank.rankMovement)}`}>
                    {movementText(myContext.myRank.rankMovement)}
                  </p>
                )}
                <p className="mt-1 text-sm font-semibold text-emerald-800">
                  Score: {formatScore(myContext.myRank.score)}
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  {myContext.myRank.daysActive} active days | {myContext.myRank.streak} day streak
                </p>
              </div>

              {myContext.belowMe && (
                <div className="flex min-h-[144px] flex-col items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Below You</p>
                  <p className="mt-2 text-lg font-bold text-amber-900">
                    {getRankLabel(myContext.belowMe.rank)} {myContext.belowMe.username}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-800">
                    Score: {formatScore(myContext.belowMe.score)}
                  </p>
                </div>
              )}
            </div>
            {myContext.totalParticipants && myContext.totalParticipants > 1 && (
              <p className="mt-4 text-center text-sm text-ink-muted">
                Competing with {myContext.totalParticipants} participants
              </p>
            )}
          </section>
        )}

        {myContext && myContext.notRanked && !loading && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-900">
              <strong>Not ranked yet.</strong> {myContext.reason}
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <section className="card">
          <h2 className="font-display text-xl font-bold text-gray-900">Rankings</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
            </div>
          ) : uniqueRankings.length === 0 ? (
            <p className="py-8 text-center text-ink-muted">No rankings available for this period and category.</p>
          ) : (
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
                    {uniqueRankings.map((entry) => (
                      <tr
                        key={`${entry.userId}-${entry.rank}`}
                        className={myContext?.myRank?.userId === entry.userId ? 'bg-primary-50' : ''}
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
                          {formatScore(entry.score)}
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
                {uniqueRankings.map((entry) => (
                  <article
                    key={`mobile-${entry.userId}-${entry.rank}`}
                    className={`rounded-xl border p-4 ${
                      myContext?.myRank?.userId === entry.userId
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-ink-muted">{getRankLabel(entry.rank)}</p>
                        <p className="font-semibold text-gray-900">{entry.username}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-primary-700">{formatScore(entry.score)}</p>
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
          )}
        </section>
      </main>
    </div>
  );
};

export default EnhancedLeaderboard;
