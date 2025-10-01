import React from 'react';

interface BadgeOutOfStockProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function BadgeOutOfStock({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: BadgeOutOfStockProps) {
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
      <circle cx="12" cy="12" r="8"/>
  <path d="M8 8l8 8"/>
    </svg>
  );
}
