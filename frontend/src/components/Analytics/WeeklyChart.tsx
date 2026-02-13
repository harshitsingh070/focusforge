import React from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnalyticsWeeklyStat } from '../../types';

interface WeeklyChartProps {
  data: AnalyticsWeeklyStat[];
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => (
  <div className="card">
    <h2 className="text-xl font-bold text-gray-900">Weekly Aggregation</h2>
    <div className="mt-4 h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="points" stroke="#0f766e" strokeWidth={2.5} name="Points" />
          <Line yAxisId="right" type="monotone" dataKey="minutes" stroke="#ea580c" strokeWidth={2.5} name="Minutes" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default WeeklyChart;
