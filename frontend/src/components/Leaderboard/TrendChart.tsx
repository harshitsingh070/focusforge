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
      <p className="mt-1 text-sm font-medium text-ink-muted">Top score and participant spread across time windows.</p>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dbe6f2" />
            <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip
              cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
              labelFormatter={(label) => `Period: ${label}`}
              formatter={(value, series) => {
                const numeric = Number(value) || 0;
                if (String(series).toLowerCase().includes('participant')) {
                  return [numeric.toLocaleString(), 'Participants'];
                }
                return [numeric.toLocaleString(), 'Top Score'];
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 700, marginBottom: 4 }}
              itemStyle={{ color: '#334155', fontWeight: 600, fontSize: 12 }}
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.96)' }}
            />
            <Line yAxisId="left" type="monotone" dataKey="topScore" name="Top Score" stroke="#0f766e" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line yAxisId="right" type="monotone" dataKey="participants" name="Participants" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default TrendChart;
