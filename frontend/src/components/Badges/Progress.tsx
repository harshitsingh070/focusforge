import React from 'react';

interface ProgressProps {
  earnedCount: number;
  totalCount: number;
}

const Progress: React.FC<ProgressProps> = ({ earnedCount, totalCount }) => {
  const completionRate = totalCount > 0 ? Math.round((earnedCount * 100) / totalCount) : 0;

  return (
    <div className="card border-amber-200 bg-gradient-to-br from-amber-50 to-white">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink-muted">Completion</p>
          <p className="mt-2 text-3xl font-black text-amber-700">{completionRate}%</p>
          <p className="mt-1 text-xs text-amber-700">
            {earnedCount} of {totalCount} badges earned
          </p>
        </div>
        <div className="h-16 w-16 rounded-full border-4 border-amber-200 bg-white p-1">
          <div
            className="h-full rounded-full bg-amber-500 transition-all duration-300"
            style={{ clipPath: `inset(${100 - completionRate}% 0 0 0)` }}
          />
        </div>
      </div>
    </div>
  );
};

export default Progress;
