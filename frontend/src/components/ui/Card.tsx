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
        card ${hover ? '' : 'card-static'}
        ${onClick ? 'cursor-pointer text-left w-full appearance-none' : ''}
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
