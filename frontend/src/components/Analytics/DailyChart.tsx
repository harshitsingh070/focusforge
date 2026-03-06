import React from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsHeatmapPoint } from '../../types';

interface DailyChartProps {
  data: AnalyticsHeatmapPoint[];
}

const DailyChart: React.FC<DailyChartProps> = ({ data }) => {
  const chartData = data.slice(-7).map((entry) => ({
    day: entry.label,
    minutes: entry.minutes,
    points: entry.points,
  }));

  return (
    <div className="card">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">Daily Performance</h2>
      <p className="mt-1 text-sm font-medium text-slate-500">Last 7 days of focus minutes and points earned.</p>
      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="minutesArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.03} />
              </linearGradient>
              <linearGradient id="pointsArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#22C55E" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 6" stroke="#dbe6f2" />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip
              cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
              labelFormatter={(label) => `Day: ${label}`}
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
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#minutesArea)"
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="points"
              stroke="#22C55E"
              strokeWidth={3}
              fill="url(#pointsArea)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyChart;
