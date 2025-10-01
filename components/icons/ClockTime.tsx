import React from 'react';

interface ClockTimeProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function ClockTime({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: ClockTimeProps) {
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
      <circle cx="12" cy="12" r="10"/>
  <polyline points="12,6 12,12 16,14"/>
    </svg>
  );
}
