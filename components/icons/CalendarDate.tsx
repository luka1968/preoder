import React from 'react';

interface CalendarDateProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function CalendarDate({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: CalendarDateProps) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
  <line x1="16" x2="16" y1="2" y2="6"/>
  <line x1="8" x2="8" y1="2" y2="6"/>
  <line x1="3" x2="21" y1="10" y2="10"/>
  <path d="m9 16 2 2 4-4"/>
    </svg>
  );
}
