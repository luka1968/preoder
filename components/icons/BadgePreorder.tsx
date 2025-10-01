import React from 'react';

interface BadgePreorderProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function BadgePreorder({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: BadgePreorderProps) {
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
      <path d="M4 7a2 2 0 0 1 2-2h8.3a2 2 0 0 1 1.4.6l3.7 3.7a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z"/>
  <path d="M8 11h6"/>
  <path d="M8 15h8"/>
    </svg>
  );
}
