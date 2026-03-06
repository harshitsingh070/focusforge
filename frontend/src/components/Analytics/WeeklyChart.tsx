import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsWeeklyStat } from '../../types';

interface WeeklyChartProps {
  data: AnalyticsWeeklyStat[];
}

const formatWeekDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => (
  <div className="card">
    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Weekly Aggregation</h2>
    <p className="mt-1 text-sm font-medium text-slate-500">Points and focus minutes trend for recent days.</p>
    <div className="mt-4 h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="pointsStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <linearGradient id="minutesStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 6" stroke="#dbe6f2" />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={formatWeekDate} />
          <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
          <Tooltip
            cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
            labelFormatter={(label) => `Date: ${formatWeekDate(String(label))}`}
            formatter={(value, series) => {
              const numeric = Number(value) || 0;
              if (String(series).toLowerCase().includes('minute')) {
                return [`${numeric.toLocaleString()} min`, 'Focus Minutes'];
              }
              return [numeric.toLocaleString(), 'Points'];
            }}
            labelStyle={{ color: '#0f172a', fontWeight: 700, marginBottom: 4 }}
            itemStyle={{ color: '#334155', fontWeight: 600, fontSize: 12 }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.96)' }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="points"
            stroke="url(#pointsStroke)"
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
            name="Points"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="minutes"
            stroke="url(#minutesStroke)"
            strokeWidth={3}
            dot={{ r: 0 }}
            activeDot={{ r: 5 }}
            name="Minutes"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default WeeklyChart;
