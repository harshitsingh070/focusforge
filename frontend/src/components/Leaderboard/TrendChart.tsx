import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LeaderboardTrendPoint } from '../../store/enhancedLeaderboardSlice';

interface TrendChartProps {
  trends: LeaderboardTrendPoint[];
}

const labelMap: Record<LeaderboardTrendPoint['period'], string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  ALL_TIME: 'All Time',
};

const TrendChart: React.FC<TrendChartProps> = ({ trends }) => {
  if (trends.length === 0) {
    return null;
  }

  const chartData = trends.map((point) => ({
    ...point,
    label: labelMap[point.period],
  }));

  return (
    <section className="card mb-6">
      <h2 className="font-display text-xl font-bold text-gray-900">Ranking Trend Snapshot</h2>
      <p className="mt-1 text-sm text-ink-muted">Top score and participant spread across time windows.</p>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Line yAxisId="left" type="monotone" dataKey="topScore" stroke="#0f766e" strokeWidth={2.5} />
            <Line yAxisId="right" type="monotone" dataKey="participants" stroke="#2563eb" strokeWidth={2.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default TrendChart;
