import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <div className="ff-empty-state flex flex-col items-center justify-center py-16 px-8 text-center animate-[ff-section-enter_200ms_ease_both]">
    <div
      className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.35rem] border"
      style={{
        borderColor: 'var(--ff-ui-card-border)',
        background: 'linear-gradient(180deg, var(--ff-ui-secondary-top), var(--ff-ui-secondary-bottom))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 22px rgba(15,23,42,0.06)',
      }}
    >
      <span className="material-symbols-outlined text-3xl" style={{ color: 'var(--ff-ui-link-color)' }}>
        {icon}
      </span>
    </div>
    <h3 className="text-lg font-bold tracking-[-0.03em]" style={{ color: 'var(--ff-ui-text)' }}>{title}</h3>
    <p className="mt-1.5 max-w-sm text-sm" style={{ color: 'var(--ff-ui-text-soft)' }}>{description}</p>
    {actionLabel && onAction && (
      <div className="mt-5">
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      </div>
    )}
  </div>
);

export default EmptyState;
