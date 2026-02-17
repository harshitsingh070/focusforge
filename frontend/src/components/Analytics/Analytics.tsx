import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchAnalytics } from '../../store/analyticsSlice';
import Navbar from '../Layout/Navbar';
import CategoryBreakdown from './CategoryBreakdown';
import DailyChart from './DailyChart';
import TrendAnalysis from './TrendAnalysis';
import WeeklyChart from './WeeklyChart';

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-container">
          <div className="card text-center">
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-container max-w-4xl">
          <div className="card text-center">
            <h2 className="text-3xl font-semibold text-slate-900">Analytics failed to load</h2>
            <p className="mt-2 text-sm text-red-600">{error}</p>
            <button onClick={() => dispatch(fetchAnalytics())} className="btn-primary mt-4">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="page-shell">
        <Navbar />
        <main className="page-container max-w-4xl">
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900">No analytics data yet</h2>
            <p className="mt-2 text-sm text-gray-600">Log activity for a few days and refresh to see insights.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <Navbar />

      <main className="page-container">
        <section className="section-heading">
          <h1 className="section-title">Performance Insights</h1>
          <p className="section-subtitle">Consistency, streak quality, trust score, and category distribution.</p>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="card border-transparent text-white" style={{ background: 'linear-gradient(135deg,#5B8CFF,#7B4BFF)' }}>
            <p className="text-sm text-white/80">Active Days</p>
            <p className="mt-2 text-5xl font-extrabold">
              {data.consistencyMetrics.activeDays}/{data.consistencyMetrics.totalDays}
            </p>
            <p className="mt-1 text-xs font-semibold text-white/75">Last 30 days</p>
          </div>
          <div className="card border-transparent text-white" style={{ background: 'linear-gradient(135deg,#ff8f57,#f9557a)' }}>
            <p className="text-sm text-white/80">Current Streak</p>
            <p className="mt-2 text-5xl font-extrabold">{data.consistencyMetrics.currentStreak}</p>
            <p className="mt-1 text-xs font-semibold text-white/75">Days active in a row</p>
          </div>
          <div className="card border-transparent text-white" style={{ background: 'linear-gradient(135deg,#f8cd40,#f59e0b)' }}>
            <p className="text-sm text-white/80">Best Streak</p>
            <p className="mt-2 text-5xl font-extrabold">{data.consistencyMetrics.longestStreak}</p>
            <p className="mt-1 text-xs font-semibold text-white/75">Longest run</p>
          </div>
          <div className="card border-transparent text-white" style={{ background: 'linear-gradient(135deg,#53d46f,#20b2aa)' }}>
            <p className="text-sm text-white/80">Consistency</p>
            <p className="mt-2 text-5xl font-extrabold">{data.consistencyMetrics.consistencyRate}%</p>
            <p className="mt-1 text-xs font-semibold text-white/75">Execution quality</p>
          </div>
          <div className="card border-transparent text-white" style={{ background: 'linear-gradient(135deg,#6980af,#96a5bf)' }}>
            <p className="text-sm text-white/80">Trust Score</p>
            <p className="mt-2 text-5xl font-extrabold">{data.trustMetrics.score}</p>
            <p className="mt-1 text-xs font-semibold text-white/75">{data.trustMetrics.band} confidence</p>
          </div>
        </section>

        <section className="card mb-6 border-slate-200 bg-white/90">
          <h2 className="text-3xl font-bold text-slate-900">AI Insights</h2>
          <div className="mt-3 space-y-2">
            {data.insights.map((insight, index) => (
              <p key={`${index}-${insight}`} className="text-sm text-slate-700">
                {insight}
              </p>
            ))}
          </div>
        </section>

        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <WeeklyChart data={data.weeklyProgress} />
          <CategoryBreakdown data={data.categoryBreakdown} />
        </div>

        <div className="mb-6">
          <DailyChart data={data.weeklyHeatmap} />
        </div>

        <TrendAnalysis monthlyTrends={data.monthlyTrends} streakHistory={data.streakHistory} />
      </main>
    </div>
  );
};

export default Analytics;
