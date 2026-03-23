import React, { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsMonthlyTrend, AnalyticsStreakPoint } from '../../types';

interface TrendAnalysisProps {
  monthlyTrends: AnalyticsMonthlyTrend[];
  streakHistory: AnalyticsStreakPoint[];
}

const formatDateLabel = (value: string) => {
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

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ monthlyTrends, streakHistory }) => {
  const hasMonthlyData = monthlyTrends.length > 0;
  const hasStreakData = streakHistory.length > 0;

  const streakChartData = useMemo(
    () =>
      streakHistory.map((point, index, source) => {
        const sample = source.slice(Math.max(0, index - 4), index + 1);
        const average = sample.reduce((sum, value) => sum + (Number.isFinite(value.streak) ? value.streak : 0), 0) / sample.length;
        return {
          ...point,
          movingAverage: Number(average.toFixed(1)),
        };
      }),
    [streakHistory]
  );

  return (
    <>
      <article className="ff-analytics-glass ff-analytics-chart-card ff-analytics-card-hover rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="ff-analytics-text text-[24px] font-semibold">Monthly Consistency</h2>
        <p className="ff-analytics-soft mt-1 text-sm">Points, minutes, and active-day quality over recent months.</p>

        {hasMonthlyData ? (
          <>
            <div className="ff-analytics-chart-area mt-5 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="4 6" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="month"
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
                    formatter={(value, name) => {
                      const numeric = Number(value) || 0;
                      if (name === 'Active Days') {
                        return [numeric.toLocaleString(), 'Active Days'];
                      }
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
                    dataKey="activeDays"
                    name="Active Days"
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
                Active Days
              </span>
            </div>
          </>
        ) : (
          <p className="ff-analytics-surface-muted ff-analytics-soft mt-6 rounded-xl px-4 py-6 text-center text-sm">
            No monthly trend data available yet.
          </p>
        )}
      </article>

      <article className="ff-analytics-glass ff-analytics-chart-card ff-analytics-card-hover rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <h2 className="ff-analytics-text text-[24px] font-semibold">Streak Quality</h2>
        <p className="ff-analytics-soft mt-1 text-sm">Daily streak path compared with rolling average.</p>

        {hasStreakData ? (
          <>
            <div className="ff-analytics-chart-area mt-5 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streakChartData}>
                  <CartesianGrid strokeDasharray="4 6" stroke={gridColor} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDateLabel}
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
                    labelFormatter={(label) => `Date: ${formatDateLabel(String(label))}`}
                    formatter={(value, name) => {
                      const numeric = Number(value) || 0;
                      if (name === 'Moving Avg') {
                        return [numeric.toLocaleString(), 'Moving Avg'];
                      }
                      return [numeric.toLocaleString(), 'Streak'];
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
                    dataKey="streak"
                    name="Streak"
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
                    dataKey="movingAverage"
                    name="Moving Avg"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    strokeDasharray="6 4"
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
                Streak
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
                Moving Avg
              </span>
            </div>
          </>
        ) : (
          <p className="ff-analytics-surface-muted ff-analytics-soft mt-6 rounded-xl px-4 py-6 text-center text-sm">
            No streak history data available yet.
          </p>
        )}
      </article>
    </>
  );
};

export default TrendAnalysis;
