import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  accent?: string;
  onClick?: () => void;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
};

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  accent,
  onClick,
}) => {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl
        border border-slate-200/80 dark:border-slate-800
        bg-white dark:bg-slate-900
        shadow-sm
        ${hover ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800/50' : ''}
        ${onClick ? 'cursor-pointer text-left w-full' : ''}
        ${paddingClasses[padding]}
        ${className}
      `.trim()}
      style={accent ? { borderLeftWidth: 4, borderLeftColor: accent } : undefined}
    >
      {children}
    </Tag>
  );
};

export default Card;
