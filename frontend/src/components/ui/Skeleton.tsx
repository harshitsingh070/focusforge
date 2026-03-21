import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-700/50';
  const variantClass = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded-md',
  }[variant];

  return (
    <div
      className={`${baseClass} ${variantClass} ${className}`}
      style={{ width, height }}
    />
  );
};

/** Pre-built skeleton layouts */
export const CardSkeleton: React.FC = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton variant="text" className="h-4 w-24" />
      <Skeleton variant="circular" className="h-10 w-10" />
    </div>
    <Skeleton variant="text" className="h-8 w-32" />
    <Skeleton variant="text" className="h-3 w-20" />
  </div>
);

export const TableRowSkeleton: React.FC = () => (
  <div className="flex items-center gap-4 py-4 px-4">
    <Skeleton variant="circular" className="h-9 w-9 shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton variant="text" className="h-4 w-40" />
      <Skeleton variant="text" className="h-3 w-24" />
    </div>
    <Skeleton variant="text" className="h-5 w-16" />
  </div>
);

export default Skeleton;
