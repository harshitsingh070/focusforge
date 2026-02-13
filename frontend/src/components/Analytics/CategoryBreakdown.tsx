import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AnalyticsCategoryStat } from '../../types';

interface CategoryBreakdownProps {
  data: AnalyticsCategoryStat[];
}

const COLORS = ['#0f766e', '#2563eb', '#ea580c', '#16a34a', '#be185d', '#0ea5e9'];

const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ data }) => (
  <div className="card">
    <h2 className="text-xl font-bold text-gray-900">Category Breakdown</h2>

    <div className="mt-4 h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="points" nameKey="category" cx="50%" cy="50%" outerRadius={90} label>
            {data.map((entry, index) => (
              <Cell key={`${entry.category}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>

    <div className="mt-3 space-y-2">
      {data.map((entry, index) => (
        <div key={entry.category} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-gray-700">{entry.category}</span>
          </div>
          <span className="font-semibold text-gray-900">{entry.points} pts</span>
        </div>
      ))}
    </div>
  </div>
);

export default CategoryBreakdown;
