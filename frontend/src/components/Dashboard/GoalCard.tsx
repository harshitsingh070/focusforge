import React from 'react';
import { GoalProgress } from '../../types';
import styles from './Dashboard.module.css';

interface GoalCardProps {
  goal: GoalProgress;
  deleting?: boolean;
  onLogActivity: (goalId: number) => void;
  onDeleteGoal: (goalId: number, title: string) => void;
}

const categoryColors: Record<string, { bg: string; text: string; className: string }> = {
  Coding: { bg: 'rgba(99, 102, 241, 0.12)', text: '#6366f1', className: styles.coding },
  Health: { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', className: styles.health },
  Reading: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', className: styles.reading },
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, deleting = false, onLogActivity, onDeleteGoal }) => {
  const safeTarget = Math.max(1, goal.dailyTarget);
  const rawProgress = Math.max(0, goal.todayProgress);
  const cappedProgress = Math.min(rawProgress, safeTarget);
  const progressPercent = Math.min((cappedProgress / safeTarget) * 100, 100);

  const categoryStyle = categoryColors[goal.category] || {
    bg: `${goal.categoryColor}20`,
    text: goal.categoryColor,
    className: '',
  };

  return (
    <article className={styles.goalCard}>
      <div className={styles.goalHeader}>
        <div className={styles.goalInfo}>
          <span
            className={`${styles.goalCategory} ${categoryStyle.className}`}
            style={!categoryStyle.className ? { backgroundColor: categoryStyle.bg, color: categoryStyle.text } : {}}
          >
            {goal.category}
          </span>
          <h3 className={styles.goalTitle}>{goal.title}</h3>
        </div>

        <div className={styles.goalStreak}>
          <div className={styles.streakIcon}>🔥</div>
          <p className={styles.streakValue}>{goal.currentStreak}</p>
          <p className={styles.streakLabel}>day streak</p>
        </div>
      </div>

      <div className={styles.goalProgress}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={styles.progressText}>
          <span>{Math.round(progressPercent)}%</span>
          <span>{cappedProgress} / {safeTarget} min</span>
        </div>
      </div>

      <button
        onClick={() => onLogActivity(goal.goalId)}
        className={styles.logButton}
        disabled={deleting || goal.completedToday}
      >
        {goal.completedToday ? '✓ Completed' : 'Log Activity'}
      </button>
    </article>
  );
};

export default GoalCard;
