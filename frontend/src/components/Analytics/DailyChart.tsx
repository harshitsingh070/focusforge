import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsHeatmapPoint } from '../../types';

interface DailyChartProps {
  data: AnalyticsHeatmapPoint[];
}

const axisColor = 'var(--ff-analytics-axis)';
const axisLineColor = 'var(--ff-analytics-axis-line)';
const gridColor = 'var(--ff-analytics-grid)';
const tooltipBg = 'var(--ff-analytics-tooltip-bg)';
const tooltipBorder = 'var(--ff-analytics-tooltip-border)';
const tooltipLabelColor = 'var(--ff-analytics-tooltip-label)';
const tooltipItemColor = 'var(--ff-analytics-tooltip-item)';

const DailyChart: React.FC<DailyChartProps> = ({ data }) => {
  const chartData = data.slice(-10).map((entry) => ({
    day: entry.label,
    minutes: entry.minutes,
    points: entry.points,
    intensity: Math.round(Math.max(0, Math.min(entry.level, 4)) * 25),
  }));
  const hasData = chartData.length > 0;

  return (
    <article className="ff-analytics-glass ff-analytics-chart-card ff-analytics-card-hover rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <h2 className="ff-analytics-text text-[24px] font-semibold">Daily Performance</h2>
      <p className="ff-analytics-soft mt-1 text-sm">Last 10 sessions: points, minutes, and intensity.</p>

      {hasData ? (
        <>
          <div className="ff-analytics-chart-area mt-5 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="4 6" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor }}
                />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor }}
                />
                <Tooltip
                  cursor={{ stroke: axisLineColor, strokeDasharray: '4 4' }}
                  labelFormatter={(label) => `Day: ${String(label)}`}
                  formatter={(value, name) => {
                    const numeric = Number(value) || 0;
                    if (name === 'Minutes') {
                      return [`${numeric.toLocaleString()} min`, 'Minutes'];
                    }
                    if (name === 'Intensity') {
                      return [`${numeric.toLocaleString()}%`, 'Intensity'];
                    }
                    return [numeric.toLocaleString(), 'Points'];
                  }}
                  labelStyle={{ color: tooltipLabelColor, fontWeight: 700, marginBottom: 4 }}
                  itemStyle={{ color: tooltipItemColor, fontWeight: 600, fontSize: 12 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${tooltipBorder}`,
                    background: tooltipBg,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  name="Points"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, fill: '#8B5CF6' }}
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="Minutes"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, fill: '#3B82F6' }}
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                />
                <Line
                  type="monotone"
                  dataKey="intensity"
                  name="Intensity"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22C55E' }}
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="ff-analytics-soft mt-3 flex flex-wrap gap-4 text-xs">
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#8B5CF6]" />
              Points
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              Minutes
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              Intensity
            </span>
          </div>
        </>
      ) : (
        <p className="ff-analytics-surface-muted ff-analytics-soft mt-6 rounded-xl px-4 py-6 text-center text-sm">
          No daily performance data available yet.
        </p>
      )}
    </article>
  );
};

export default DailyChart;
