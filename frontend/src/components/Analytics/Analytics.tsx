import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AppDispatch, RootState } from '../../store';
import { fetchAnalytics } from '../../store/analyticsSlice';
import Navbar from '../Layout/Navbar';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

const Analytics: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data, loading, error } = useSelector((state: RootState) => state.analytics);

  useEffect(() => {
    dispatch(fetchAnalytics());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-2">Analytics failed to load</h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button onClick={() => dispatch(fetchAnalytics())} className="btn-primary">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No analytics data yet</h2>
            <p className="text-sm text-gray-600">Log a few activities and refresh to see insights.</p>
          </div>
        </main>
      </div>
    );
  }

  const weeklyProgress = data.weeklyProgress || [];
  const categoryBreakdown = data.categoryBreakdown || [];
  const consistencyMetrics = data.consistencyMetrics || {
    totalDays: 30,
    activeDays: 0,
    consistencyRate: 0,
    longestStreak: 0,
    currentStreak: 0,
  };
  const monthlyTrends = data.monthlyTrends || [];
  const streakHistory = data.streakHistory || [];
  const weeklyHeatmap = data.weeklyHeatmap || [];
  const trustMetrics = data.trustMetrics;
  const insights = data.insights || [];

  const heatmapRows: Array<
    Array<{ date: string; label: string; minutes: number; points: number; level: number }>
  > = [];
  for (let index = 0; index < weeklyHeatmap.length; index += 7) {
    heatmapRows.push(weeklyHeatmap.slice(index, index + 7));
  }

  const getHeatColor = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-green-100';
      case 2:
        return 'bg-green-300';
      case 3:
        return 'bg-green-500';
      case 4:
        return 'bg-green-700';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track consistency, momentum, and trust over time</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-white">
            <div className="text-sm text-gray-600 mb-1">Active Days (30d)</div>
            <div className="text-3xl font-bold text-blue-600">
              {consistencyMetrics.activeDays}/{consistencyMetrics.totalDays}
            </div>
            <div className="text-xs text-gray-500 mt-1">{consistencyMetrics.consistencyRate}% consistency</div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-white">
            <div className="text-sm text-gray-600 mb-1">Current Streak</div>
            <div className="text-3xl font-bold text-purple-600">🔥 {consistencyMetrics.currentStreak}</div>
            <div className="text-xs text-gray-500 mt-1">days in a row</div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-white">
            <div className="text-sm text-gray-600 mb-1">Best Streak</div>
            <div className="text-3xl font-bold text-green-600">🏆 {consistencyMetrics.longestStreak}</div>
            <div className="text-xs text-gray-500 mt-1">personal record</div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-white">
            <div className="text-sm text-gray-600 mb-1">Consistency Rate</div>
            <div className="text-3xl font-bold text-orange-600">{consistencyMetrics.consistencyRate}%</div>
            <div className="text-xs text-gray-500 mt-1">last 30 days</div>
          </div>

          <div className="card bg-gradient-to-br from-emerald-50 to-white">
            <div className="text-sm text-gray-600 mb-1">Trust Score</div>
            <div className="text-3xl font-bold text-emerald-600">{trustMetrics?.score ?? 100}</div>
            <div className="text-xs text-gray-500 mt-1">{trustMetrics?.band || 'HIGH'} trust</div>
          </div>
        </div>

        <div className="card mb-8 bg-indigo-50 border border-indigo-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3">AI Insights</h2>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <p key={`${index}-${insight}`} className="text-sm text-indigo-900">
                • {insight}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="points" fill="#6366f1" name="Points" />
                <Bar yAxisId="right" dataKey="minutes" fill="#8b5cf6" name="Minutes" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Points by Category</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="points"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`${entry.category}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {categoryBreakdown.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-gray-700">{category.category}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{category.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Streak History (30 Days)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={streakHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="streak" stroke="#f97316" strokeWidth={2} name="Daily streak" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">6-Month Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="points" stroke="#6366f1" strokeWidth={2} name="Total Points" />
              <Line yAxisId="right" type="monotone" dataKey="goals" stroke="#10b981" strokeWidth={2} name="Active Goals" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Weekly Consistency Heatmap</h2>
          <div className="overflow-x-auto">
            <div className="inline-flex gap-1">
              {heatmapRows.map((week, weekIndex) => (
                <div key={`week-${weekIndex}`} className="flex flex-col gap-1">
                  {week.map((cell) => (
                    <div
                      key={cell.date}
                      className={`w-4 h-4 rounded-sm ${getHeatColor(cell.level)}`}
                      title={`${cell.date}: ${cell.minutes} min, ${cell.points} pts`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
            <span>Low</span>
            <div className="w-3 h-3 rounded-sm bg-gray-100" />
            <div className="w-3 h-3 rounded-sm bg-green-100" />
            <div className="w-3 h-3 rounded-sm bg-green-300" />
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <div className="w-3 h-3 rounded-sm bg-green-700" />
            <span>High</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
