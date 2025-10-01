import React from 'react';

interface ErrorCrossProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function ErrorCross({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: ErrorCrossProps) {
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
  <path d="m15 9-6 6"/>
  <path d="m9 9 6 6"/>
    </svg>
  );
}
