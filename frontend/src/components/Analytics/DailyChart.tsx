import React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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
      <h2 className="text-xl font-bold text-gray-900">Daily Performance (Last 7 Days)</h2>
      <div className="mt-4 h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="minutes" fill="#0f766e" radius={[6, 6, 0, 0]} />
            <Bar dataKey="points" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyChart;
