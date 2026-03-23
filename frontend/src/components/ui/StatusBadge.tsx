import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'ff-status-badge--default',
  primary: 'ff-status-badge--primary',
  success: 'ff-status-badge--success',
  warning: 'ff-status-badge--warning',
  danger: 'ff-status-badge--danger',
  info: 'ff-status-badge--info',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
  dot = false,
}) => (
  <span
    className={`
      ff-status-badge
      ${variantClasses[variant]}
      ${className}
    `.trim()}
  >
    {dot && <span className="ff-status-badge__dot" />}
    {children}
  </span>
);

export default StatusBadge;
