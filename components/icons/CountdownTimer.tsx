import React from 'react';

interface CountdownTimerProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function CountdownTimer({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: CountdownTimerProps) {
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
      <circle cx="12" cy="13" r="8"/>
  <path d="m12 9-2 3h4l-2 3"/>
  <path d="M9 4.5h6"/>
  <path d="m12 2 1.5 2.5L12 7 10.5 4.5 12 2Z"/>
    </svg>
  );
}
