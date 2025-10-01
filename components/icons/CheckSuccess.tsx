import React from 'react';

interface CheckSuccessProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function CheckSuccess({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: CheckSuccessProps) {
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
  <path d="m9 12 2 2 4-4"/>
    </svg>
  );
}
