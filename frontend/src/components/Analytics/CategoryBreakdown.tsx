import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AnalyticsCategoryStat } from '../../types';

interface CategoryBreakdownProps {
  data: AnalyticsCategoryStat[];
}

const categoryColors: Record<string, string> = {
  coding: '#3B82F6',
  academics: '#22C55E',
  'career skills': '#F97316',
  reading: '#8B5CF6',
};

const fallbackColors = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#06B6D4', '#F43F5E'];

const getCategoryColor = (category: string, index: number) => {
  const normalized = (category || '').trim().toLowerCase();
  return categoryColors[normalized] || fallbackColors[index % fallbackColors.length];
};

const tooltipBg = 'var(--ff-analytics-tooltip-bg)';
const tooltipBorder = 'var(--ff-analytics-tooltip-border)';
const tooltipLabelColor = 'var(--ff-analytics-tooltip-label)';
const tooltipItemColor = 'var(--ff-analytics-tooltip-item)';

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => {
  const hasData = data.length > 0;
  const totalPoints = useMemo(
    () => data.reduce((sum, entry) => sum + (Number.isFinite(entry.points) ? entry.points : 0), 0),
    [data]
  );

  return (
    <article className="ff-analytics-glass ff-analytics-chart-card ff-analytics-card-hover">
      <h2 className="ff-analytics-text text-[24px] font-semibold">Category Distribution</h2>
      <p className="ff-analytics-soft mt-1 text-sm">Share of points by category.</p>

      {hasData ? (
        <>
          <div className="ff-analytics-chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="points"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={102}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {data.map((entry, index) => (
                    <Cell key={`${entry.category}-${index}`} fill={getCategoryColor(entry.category, index)} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value || 0).toLocaleString()} pts`, 'Points']}
                  contentStyle={{
                    borderRadius: 12,
                    border: `1px solid ${tooltipBorder}`,
                    background: tooltipBg,
                  }}
                  labelStyle={{ color: tooltipLabelColor, fontWeight: 700 }}
                  itemStyle={{ color: tooltipItemColor, fontWeight: 600, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="ff-analytics-legend">
            {data.map((entry, index) => {
              const share = totalPoints > 0
                ? Math.round((entry.points / totalPoints) * 100)
                : Math.round(entry.percentage || 0);

              return (
                <div key={`${entry.category}-${index}`} className="ff-analytics-legend-row">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: getCategoryColor(entry.category, index) }}
                    />
                    {entry.category}
                  </span>
                  <span className="ff-analytics-legend-meta">{share}%</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="ff-analytics-surface-muted ff-analytics-soft mt-6 rounded-xl px-4 py-6 text-center text-sm">
          No category distribution data available yet.
        </p>
      )}
    </article>
  );
};

export default CategoryBreakdown;
