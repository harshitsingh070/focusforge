import React from 'react';

interface ProgressProps {
  earnedCount: number;
  totalCount: number;
}

const Progress: React.FC<ProgressProps> = ({ earnedCount, totalCount }) => {
  const completionRate = totalCount > 0 ? Math.round((earnedCount * 100) / totalCount) : 0;
  const ringStyle = {
    ['--ring-value' as string]: `${completionRate}%`,
    ['--ring-color' as string]: '#8B5CF6',
  } as React.CSSProperties;

  return (
    <div className="card ff-glow-vibrant border-transparent text-white" style={{ background: 'linear-gradient(135deg,#A855F7,#6D28D9)' }}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white/80">Completion</p>
          <p className="mt-2 text-6xl font-black">{completionRate}%</p>
          <p className="mt-1 text-xs text-white/80">
            {earnedCount} of {totalCount} badges earned
          </p>
        </div>
        <div>
          <div className="ff-ring !h-24 !w-24" style={ringStyle} />
          <p className="mt-2 text-center text-xs font-semibold text-white/80">Completion</p>
        </div>
      </div>
    </div>
  );
};

export default Progress;
