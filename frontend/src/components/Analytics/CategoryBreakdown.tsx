import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AnalyticsCategoryStat } from '../../types';

interface CategoryBreakdownProps {
  data: AnalyticsCategoryStat[];
}

const COLORS = ['#3B82F6', '#22C55E', '#F97316', '#8B5CF6', '#14B8A6', '#F43F5E'];

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => (
  <div className="card">
    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Category Breakdown</h2>
    <p className="mt-1 text-sm text-slate-500">Share of points by category.</p>

    <div className="mt-4 h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="points"
            nameKey="category"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.category}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', background: 'rgba(255,255,255,0.96)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="mt-3 space-y-2">
      {data.map((entry, index) => (
        <div key={entry.category} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="font-medium text-slate-700">{entry.category}</span>
          </div>
          <span className="font-semibold text-slate-900">{entry.points} pts</span>
        </div>
      ))}
    </div>
  </div>
);

export default CategoryBreakdown;
