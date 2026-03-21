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
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 py-16 px-8 text-center animate-[ff-section-enter_200ms_ease_both]">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 mb-4">
      <span className="material-symbols-outlined text-3xl text-slate-400 dark:text-slate-500">
        {icon}
      </span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
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
