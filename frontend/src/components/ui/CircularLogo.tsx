import React from 'react';

interface CircularLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const CircularLogo: React.FC<CircularLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-14 w-14',
  };

  return (
    <div
      className={`
        flex items-center justify-center rounded-full
        transition-transform duration-300 hover:scale-110
        ${sizeMap[size]}
        ${className}
      `}
    >
      <img
        src="/logo-no-bg.png"
        alt="Discipify"
        className="h-full w-full object-cover rounded-full"
      />
    </div>
  );
};

export default CircularLogo;
