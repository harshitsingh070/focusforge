import React, { useEffect, useState } from 'react';
import styles from '../Dashboard/Dashboard.module.css';

interface ProgressProps {
  earnedCount: number;
  totalCount: number;
}

const Progress: React.FC<ProgressProps> = ({ earnedCount, totalCount }) => {
  const completionRate = totalCount > 0 ? Math.round((earnedCount * 100) / totalCount) : 0;
  const [displayRate, setDisplayRate] = useState(0);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setDisplayRate(completionRate);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [completionRate]);

  return (
    <div className={`${styles.dashboardStatCard} ${styles.dashboardStatCardViolet} rounded-2xl p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className={styles.dashboardStatLabel}>Completion</p>
          <p className={styles.dashboardStatValue}>{completionRate}%</p>
          <p className={`${styles.dashboardStatSub} ${styles.dashboardStatSubWarm}`}>
            {earnedCount} of {totalCount} badges earned
          </p>
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/70">
            <div
              className="ff-progress-live-bar h-full rounded-full bg-gradient-to-r from-violet-600 via-violet-500 to-purple-400 shadow-[0_0_16px_rgba(124,58,237,0.28)]"
              style={{ width: `${Math.max(displayRate, completionRate > 0 ? 10 : 0)}%` }}
            />
          </div>
        </div>
        <div className={`${styles.dashboardStatIconShell} ${styles.dashboardStatIconViolet}`}>
          <span className="material-symbols-outlined text-[20px]">trending_up</span>
        </div>
      </div>
    </div>
  );
};

export default Progress;
