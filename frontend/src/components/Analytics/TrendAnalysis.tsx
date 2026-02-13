import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsMonthlyTrend, AnalyticsStreakPoint } from '../../types';

interface TrendAnalysisProps {
  monthlyTrends: AnalyticsMonthlyTrend[];
  streakHistory: AnalyticsStreakPoint[];
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ monthlyTrends, streakHistory }) => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div className="card">
      <h2 className="text-xl font-bold text-gray-900">6-Month Trends</h2>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="points" stroke="#0f766e" strokeWidth={2.5} />
            <Line yAxisId="right" type="monotone" dataKey="goals" stroke="#2563eb" strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="card">
      <h2 className="text-xl font-bold text-gray-900">Streak History (30 Days)</h2>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={streakHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="streak" stroke="#ea580c" strokeWidth={2.5} name="Streak" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default TrendAnalysis;
