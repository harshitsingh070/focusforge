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

const axisColor = 'var(--ff-analytics-axis)';
const axisLineColor = 'var(--ff-analytics-axis-line)';
const gridColor = 'var(--ff-analytics-grid)';
const tooltipBg = 'var(--ff-analytics-tooltip-bg)';
const tooltipBorder = 'var(--ff-analytics-tooltip-border)';
const tooltipLabelColor = 'var(--ff-analytics-tooltip-label)';
const tooltipItemColor = 'var(--ff-analytics-tooltip-item)';

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const hasData = data.length > 0;

  return (
    <article className="ff-analytics-glass ff-analytics-chart-card ff-analytics-card-hover">
      <h2 className="ff-analytics-text text-[24px] font-semibold">Weekly Trend</h2>
      <p className="ff-analytics-soft mt-1 text-sm">Points and focus minutes trend for recent days.</p>

      {hasData ? (
        <>
          <div className="ff-analytics-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="4 6" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatWeekDate}
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor }}
                />
                <YAxis
                  yAxisId="points"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor }}
                />
                <YAxis
                  yAxisId="minutes"
                  orientation="right"
                  tick={{ fill: axisColor, fontSize: 12 }}
                  tickLine={false}
                  axisLine={{ stroke: axisLineColor }}
                />
                <Tooltip
                  cursor={{ stroke: axisLineColor, strokeDasharray: '4 4' }}
                  labelFormatter={(label) => `Date: ${formatWeekDate(String(label))}`}
                  formatter={(value, name) => {
                    const numeric = Number(value) || 0;
                    if (name === 'Minutes') {
                      return [`${numeric.toLocaleString()} min`, 'Minutes'];
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
                  yAxisId="points"
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
                  yAxisId="minutes"
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
          </div>
        </>
      ) : (
        <p className="ff-analytics-surface-muted ff-analytics-soft mt-6 rounded-xl px-4 py-6 text-center text-sm">
          No weekly trend data available yet.
        </p>
      )}
    </article>
  );
};

export default WeeklyChart;
