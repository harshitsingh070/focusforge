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
          <div className="card">
            <div className="flex justify-center py-10">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary-600" />
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
          <div className="card border-red-200 bg-red-50">
            <h2 className="text-xl font-semibold text-red-700">Analytics failed to load</h2>
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
            <h2 className="text-xl font-semibold text-gray-900">No analytics data yet</h2>
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
          <p className="status-chip">Analytics</p>
          <h1 className="section-title mt-3">Performance Insights</h1>
          <p className="section-subtitle">Consistency, streaks, category focus, and trend movement.</p>
        </section>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="card bg-gradient-to-br from-blue-50 to-white">
            <p className="text-sm text-gray-600">Active Days (30d)</p>
            <p className="mt-2 text-3xl font-black text-blue-700">
              {data.consistencyMetrics.activeDays}/{data.consistencyMetrics.totalDays}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-orange-50 to-white">
            <p className="text-sm text-gray-600">Current Streak</p>
            <p className="mt-2 text-3xl font-black text-orange-700">{data.consistencyMetrics.currentStreak}</p>
          </div>
          <div className="card bg-gradient-to-br from-emerald-50 to-white">
            <p className="text-sm text-gray-600">Best Streak</p>
            <p className="mt-2 text-3xl font-black text-emerald-700">{data.consistencyMetrics.longestStreak}</p>
          </div>
          <div className="card bg-gradient-to-br from-violet-50 to-white">
            <p className="text-sm text-gray-600">Consistency</p>
            <p className="mt-2 text-3xl font-black text-violet-700">{data.consistencyMetrics.consistencyRate}%</p>
          </div>
          <div className="card bg-gradient-to-br from-teal-50 to-white">
            <p className="text-sm text-gray-600">Trust Score</p>
            <p className="mt-2 text-3xl font-black text-teal-700">{data.trustMetrics.score}</p>
          </div>
        </section>

        <section className="card mb-8 border-indigo-200 bg-indigo-50">
          <h2 className="text-xl font-bold text-gray-900">Insights</h2>
          <div className="mt-3 space-y-2">
            {data.insights.map((insight, index) => (
              <p key={`${index}-${insight}`} className="text-sm text-indigo-900">
                - {insight}
              </p>
            ))}
          </div>
        </section>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <WeeklyChart data={data.weeklyProgress} />
          <CategoryBreakdown data={data.categoryBreakdown} />
        </div>

        <div className="mb-8">
          <DailyChart data={data.weeklyHeatmap} />
        </div>

        <TrendAnalysis monthlyTrends={data.monthlyTrends} streakHistory={data.streakHistory} />
      </main>
    </div>
  );
};

export default Analytics;
