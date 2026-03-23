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

const axisColor = 'var(--ff-text-500)';
const axisLine = 'var(--ff-border)';
const gridColor = 'rgba(148,163,184,0.28)';
const tooltipBg = 'var(--ff-surface-elevated)';
const tooltipBorder = 'var(--ff-border)';
const tooltipLabel = 'var(--ff-text-900)';
const tooltipItem = 'var(--ff-text-700)';

const TrendChart: React.FC<TrendChartProps> = ({ trends }) => {
  const chartData = trends.map((point) => ({
    ...point,
    label: labelMap[point.period],
  }));

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Ranking Trend Snapshot</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Top score and participant spread across leaderboard windows.
      </p>

      {chartData.length === 0 ? (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400">
          Trend data is not available yet.
        </p>
      ) : (
        <div className="mt-4 h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="label"
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: axisLine }}
              />
              <YAxis
                yAxisId="left"
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: axisLine }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: axisLine }}
              />
              <Tooltip
                cursor={{ stroke: axisLine, strokeDasharray: '4 4' }}
                labelFormatter={(label) => `Period: ${label}`}
                formatter={(value, series) => {
                  const numeric = Number(value) || 0;
                  if (String(series).toLowerCase().includes('participant')) {
                    return [numeric.toLocaleString(), 'Participants'];
                  }
                  return [numeric.toLocaleString(), 'Top Score'];
                }}
                labelStyle={{ color: tooltipLabel, fontWeight: 700, marginBottom: 4 }}
                itemStyle={{ color: tooltipItem, fontWeight: 600, fontSize: 12 }}
                contentStyle={{
                  borderRadius: 12,
                  border: `1px solid ${tooltipBorder}`,
                  background: tooltipBg,
                }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="topScore"
                name="Top Score"
                stroke="#7c3aed"
                strokeWidth={2.8}
                dot={false}
                activeDot={{ r: 5, fill: '#7c3aed' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="participants"
                name="Participants"
                stroke="#2563eb"
                strokeWidth={2.6}
                dot={false}
                activeDot={{ r: 5, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
};

export default TrendChart;
