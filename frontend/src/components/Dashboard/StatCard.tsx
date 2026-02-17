import React from 'react';
import styles from './Dashboard.module.css';

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: 'primary' | 'warning' | 'success' | 'blue' | 'coral' | 'orange' | 'purple';
  icon?: string;
}

const variants: Record<string, string> = {
  primary: 'border-primary-400 bg-gradient-to-br from-primary-500 to-primary-700 text-white',
  warning: 'border-orange-300 bg-gradient-to-br from-orange-400 to-orange-600 text-white',
  success: 'border-emerald-300 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white',
  blue: styles.blue,
  coral: styles.coral,
  orange: styles.orange,
  purple: styles.purple,
};

const StatCard: React.FC<StatCardProps> = ({ label, value, variant = 'primary', icon }) => {
  const useModernStyle = variant === 'blue' || variant === 'coral' || variant === 'orange' || variant === 'purple';

  if (useModernStyle) {
    return (
      <article className={`${styles.statCard} ${variants[variant]}`}>
        {icon && <div className={styles.statIcon}>{icon}</div>}
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </article>
    );
  }

  return (
    <article className={`card ${variants[variant]}`}>
      <p className="text-sm font-semibold text-white/85">{label}</p>
      <p className="mt-2 text-4xl font-black">{value}</p>
    </article>
  );
};

export default StatCard;
