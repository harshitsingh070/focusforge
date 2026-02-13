import React from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface WeeklyChartProps {
  data: Record<string, number>;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([day, minutes]) => ({ day, minutes }));

  return (
    <div className="card">
      <h3 className="font-display text-lg font-bold text-gray-900">Weekly Progress</h3>
      <div className="mt-4 h-56 sm:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="4 4" stroke="#dfe9e6" />
            <XAxis dataKey="day" tick={{ fill: '#56716c', fontSize: 12 }} axisLine={{ stroke: '#d7e6e2' }} />
            <YAxis tick={{ fill: '#56716c', fontSize: 12 }} axisLine={{ stroke: '#d7e6e2' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #d7e6e2',
                borderRadius: '12px',
                boxShadow: '0 14px 26px rgba(10,95,89,0.14)',
              }}
            />
            <Line
              type="monotone"
              dataKey="minutes"
              stroke="#0f766e"
              strokeWidth={3}
              dot={{ fill: '#0f766e', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#0f766e', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-4 text-sm text-ink-muted">Consistency matters more than intensity. Keep showing up.</p>
    </div>
  );
};

export default WeeklyChart;
