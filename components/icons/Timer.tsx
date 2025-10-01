import React from 'react';

interface TimerProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function Timer({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: TimerProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="13" r="7"/>
  <path d="M12 10v4l2 2"/>
  <path d="M9 3h6"/>
    </svg>
  );
}
