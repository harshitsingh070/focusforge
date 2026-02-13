import React from 'react';
import StatCard from './StatCard';

interface StreakCounterProps {
  streak: number;
}

const StreakCounter: React.FC<StreakCounterProps> = ({ streak }) => (
  <StatCard label="Global Streak" value={streak} variant="warning" />
);

export default StreakCounter;
