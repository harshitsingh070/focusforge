import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  variant?: 'primary' | 'warning' | 'success';
}

const variants: Record<NonNullable<StatCardProps['variant']>, string> = {
  primary: 'border-primary-400 bg-gradient-to-br from-primary-500 to-primary-700 text-white',
  warning: 'border-orange-300 bg-gradient-to-br from-orange-400 to-orange-600 text-white',
  success: 'border-emerald-300 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, variant = 'primary' }) => (
  <article className={`card ${variants[variant]}`}>
    <p className="text-sm font-semibold text-white/85">{label}</p>
    <p className="mt-2 text-4xl font-black">{value}</p>
  </article>
);

export default StatCard;
