import React from 'react';
import styles from './Dashboard.module.css';

interface WeeklyProgressData {
  dayLabel: string;
  totalMinutes: number;
}

interface WeeklyChartProps {
  data: Record<string, number>;
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className={styles.sidebarCard}>
        <h3 className={styles.sidebarCardTitle}>Weekly Progress</h3>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', textAlign: 'center', padding: '2rem 0' }}>
          No progress data yet.
        </p>
      </div>
    );
  }

  // Convert data object to array
  const progressData: WeeklyProgressData[] = Object.entries(data).map(([dayLabel, totalMinutes]) => ({
    dayLabel,
    totalMinutes,
  }));

  const maxMinutes = Math.max(...progressData.map((d) => d.totalMinutes), 1);
  const chartHeight = 150;

  return (
    <div className={styles.sidebarCard}>
      <h3 className={styles.sidebarCardTitle}>Weekly Progress</h3>

      <div style={{ height: `${chartHeight}px`, position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '0.5rem', padding: '0.5rem 0' }}>
        {progressData.map((day, index) => {
          const barHeight = (day.totalMinutes / maxMinutes) * (chartHeight - 40);
          return (
            <div key={index} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '100%',
                  height: `${barHeight}px`,
                  background: 'linear-gradient(180deg, #34d399, #10b981)',
                  borderRadius: '0.375rem',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)',
                }}
                title={`${day.totalMinutes} min`}
              />
              <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: '500' }}>
                {day.dayLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyChart;
