import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsMonthlyTrend, AnalyticsStreakPoint } from '../../types';

interface TrendAnalysisProps {
  monthlyTrends: AnalyticsMonthlyTrend[];
  streakHistory: AnalyticsStreakPoint[];
}

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ monthlyTrends, streakHistory }) => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div className="card">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">6-Month Trends</h2>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyTrends}>
            <CartesianGrid strokeDasharray="4 6" stroke="#dbe6f2" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.96)' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="points" stroke="#3B82F6" strokeWidth={3} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="goals" stroke="#F97316" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="card">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Streak History</h2>
      <div className="mt-4 h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={streakHistory}>
            <CartesianGrid strokeDasharray="4 6" stroke="#dbe6f2" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.96)' }}
            />
            <Line type="monotone" dataKey="streak" stroke="#8B5CF6" strokeWidth={3} name="Streak" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default TrendAnalysis;
