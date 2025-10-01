import React from 'react';

interface PriceTagProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function PriceTag({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: PriceTagProps) {
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
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/>
  <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>
    </svg>
  );
}
