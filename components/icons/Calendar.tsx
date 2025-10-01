import React from 'react';

interface CalendarProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function Calendar({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: CalendarProps) {
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
      <rect x="3" y="5" width="18" height="16" rx="2"/>
  <path d="M8 3v4M16 3v4M3 9h18"/>
    </svg>
  );
}
