import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import {
  fetchEnhancedLeaderboard,
  fetchMyRankContext,
  LeaderboardPeriod,
} from '../../store/enhancedLeaderboardSlice';
import { enhancedLeaderboardAPI } from '../../services/api';
import Navbar from '../Layout/Navbar';
import './EnhancedLeaderboard.css';

const AUTO_REFRESH_INTERVAL_MS = 30000;

const periodOptions: Array<{ label: string; value: LeaderboardPeriod }> = [
  { label: 'Weekly', value: 'WEEKLY' },
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'All Time', value: 'ALL_TIME' },
];

const fallbackCategoryOptions: Array<{ label: string; value?: string }> = [
  { label: 'Overall' },
  { label: 'Coding', value: 'Coding' },
  { label: 'Health', value: 'Health' },
  { label: 'Reading', value: 'Reading' },
  { label: 'Academics', value: 'Academics' },
  { label: 'Career Skills', value: 'Career Skills' },
];

const podiumOrder: Array<1 | 2 | 3> = [2, 1, 3];
const avatarTone: Array<[string, string]> = [
  ['#fb923c', '#f97316'],
  ['#60a5fa', '#2563eb'],
  ['#a78bfa', '#7c3aed'],
  ['#34d399', '#059669'],
  ['#f472b6', '#db2777'],
];

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

const getAvatarGradient = (username: string) => {
  const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const [from, to] = avatarTone[hash % avatarTone.length];
  return `linear-gradient(145deg, ${from}, ${to})`;
};

const formatScore = (score: number) => {
  const numeric = Number(score || 0);
  return Number.isInteger(numeric) ? numeric.toString() : numeric.toFixed(2);
};

const formatPoints = (points: number) => {
  return new Intl.NumberFormat('en-US').format(Number(points || 0));
};

const getMovementText = (movement?: number) => {
  if (!movement || movement === 0) {
    return 'No change';
  }
  return movement > 0 ? `Up ${movement}` : `Down ${Math.abs(movement)}`;
};

const getRankChipClass = (rank: number) => {
  if (rank === 1) return 'ff-rank-chip ff-rank-chip--gold';
  if (rank === 2) return 'ff-rank-chip ff-rank-chip--silver';
  if (rank === 3) return 'ff-rank-chip ff-rank-chip--bronze';
  return 'ff-rank-chip ff-rank-chip--default';
};

const EnhancedLeaderboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { rankings, myContext, loading, error } = useSelector((state: RootState) => state.enhancedLeaderboard);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('MONTHLY');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ label: string; value?: string }>>(
    fallbackCategoryOptions
  );

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

  const podiumByRank = useMemo(
    () => ({
      1: dedupedRankings.find((entry) => entry.rank === 1),
      2: dedupedRankings.find((entry) => entry.rank === 2),
      3: dedupedRankings.find((entry) => entry.rank === 3),
    }),
    [dedupedRankings]
  );

  useEffect(() => {
    let active = true;

    const loadCategories = async () => {
      try {
        const response = await enhancedLeaderboardAPI.getCategories();
        const payload = response.data?.categories;
        const categories: string[] = Array.isArray(payload)
          ? payload
              .filter((value: unknown): value is string => typeof value === 'string')
              .map((value) => value.trim())
              .filter((value) => value.length > 0)
          : [];

        if (!active || categories.length === 0) {
          return;
        }

        const unique = Array.from(new Map(categories.map((name) => [name.toLowerCase(), name])).values());
        setCategoryOptions([{ label: 'Overall' }, ...unique.map((name) => ({ label: name, value: name }))]);
      } catch {
        // Keep fallback categories when the endpoint is unavailable.
      }
    };

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      return;
    }

    const categoryStillAvailable = categoryOptions.some((option) => option.value === selectedCategory);
    if (!categoryStillAvailable) {
      setSelectedCategory(undefined);
    }
  }, [categoryOptions, selectedCategory]);

  useEffect(() => {
    const refreshData = () => {
      const query = { category: selectedCategory, period: selectedPeriod };
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
  }, [dispatch, selectedCategory, selectedPeriod]);

  const highlightedUserId = myContext?.myRank?.userId;
  const podiumEntries = podiumOrder
    .map((rank) => ({ rank, entry: podiumByRank[rank] }))
    .filter(({ entry }) => Boolean(entry));
  const participantCount = myContext?.totalParticipants ?? dedupedRankings.length;
  const selectedCategoryLabel = selectedCategory || 'Overall';

  return (
    <div className="page-shell ff-leaderboard-page">
      <Navbar />

      <main className="page-container ff-leaderboard-container">
        <section className="card ff-leaderboard-hero">
          <div className="ff-leaderboard-hero__head">
            <div>
              <h1 className="section-title">Global Rankings</h1>
              <p className="section-subtitle">Compete with consistency, quality streaks, and focused effort.</p>
            </div>

            <div className="ff-leaderboard-pills" role="tablist" aria-label="Leaderboard period">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`ff-pill ${selectedPeriod === option.value ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod(option.value)}
                  aria-selected={selectedPeriod === option.value}
                  role="tab"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ff-leaderboard-filter-row">
            <span className="ff-leaderboard-filter-row__label">Category</span>
            <div className="ff-category-pills" role="tablist" aria-label="Leaderboard category">
              {categoryOptions.map((option) => {
                const isActive = option.value ? selectedCategory === option.value : !selectedCategory;
                return (
                  <button
                    key={option.label}
                    type="button"
                    className={`ff-category-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(option.value)}
                    aria-selected={isActive}
                    role="tab"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && !loading && <div className="ff-leaderboard-error">{error}</div>}

          {loading ? (
            <div className="ff-leaderboard-loader-wrap">
              <div className="ff-leaderboard-loader" />
            </div>
          ) : podiumEntries.length > 0 ? (
            <div className="ff-podium-grid">
              {podiumOrder.map((rank) => {
                const entry = podiumByRank[rank];

                return (
                  <article key={`podium-${rank}`} className={`ff-podium-slot ff-podium-slot--rank-${rank}`}>
                    {entry ? (
                      <>
                        <div className="ff-podium-avatar-ring">
                          <div className="ff-podium-avatar" style={{ backgroundImage: getAvatarGradient(entry.username) }}>
                            {getInitials(entry.username)}
                          </div>
                          <span className={`ff-podium-medal ff-podium-medal--${rank}`}>{rank}</span>
                        </div>
                        <p className="ff-podium-name">
                          <span>{getOrdinal(entry.rank)}</span>
                          {entry.username}
                        </p>
                        <p className="ff-podium-points">{formatPoints(entry.rawPoints)} pts</p>
                      </>
                    ) : (
                      <div className="ff-podium-empty">Waiting for contender</div>
                    )}
                    <div className="ff-podium-base" />
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="ff-podium-empty-state">No podium data available yet.</p>
          )}
        </section>

        <section className="card ff-leaderboard-table">
          <header className="ff-leaderboard-table__head">
            <h2 className="ff-leaderboard-table__title">Rankings</h2>
            <p className="ff-leaderboard-table__meta">
              {myContext?.myRank
                ? `${selectedCategoryLabel}: you are ${getOrdinal(myContext.myRank.rank)} out of ${participantCount}`
                : `${selectedCategoryLabel}: ${participantCount} participants`}
            </p>
          </header>

          {loading ? (
            <div className="ff-leaderboard-loader-wrap ff-leaderboard-loader-wrap--compact">
              <div className="ff-leaderboard-loader" />
            </div>
          ) : (
            <div className="ff-leaderboard-table-wrap scrollbar-soft">
              <table className="data-table ff-leaderboard-data-table">
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
                      className={highlightedUserId === entry.userId ? 'ff-leaderboard-row-self' : undefined}
                    >
                      <td>
                        <span className={getRankChipClass(entry.rank)}>{entry.rank}</span>
                      </td>
                      <td>
                        <div className="ff-leaderboard-user">
                          <span className="ff-avatar" style={{ backgroundImage: getAvatarGradient(entry.username) }}>
                            {getInitials(entry.username)}
                          </span>
                          <div>
                            <p className="ff-leaderboard-user__name">{entry.username}</p>
                            <p
                              className={`ff-leaderboard-user__move ${
                                !entry.rankMovement || entry.rankMovement === 0
                                  ? 'ff-leaderboard-user__move--muted'
                                  : entry.rankMovement > 0
                                    ? 'ff-leaderboard-user__move--up'
                                    : 'ff-leaderboard-user__move--down'
                              }`}
                            >
                              {getMovementText(entry.rankMovement)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right ff-leaderboard-score">{formatScore(entry.score)}</td>
                      <td className="text-right ff-leaderboard-points-cell">{formatPoints(entry.rawPoints)}</td>
                      <td className="text-right">
                        <span className="ff-streak-pill">
                          <span className="ff-streak-pill__dot" />
                          {entry.streak}
                        </span>
                      </td>
                      <td className="text-right ff-leaderboard-days">{entry.daysActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dedupedRankings.length === 0 && (
                <p className="ff-leaderboard-empty">
                  No rankings available for {selectedCategoryLabel.toLowerCase()} in this period yet.
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EnhancedLeaderboard;
