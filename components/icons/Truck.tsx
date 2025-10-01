import React from 'react';

interface TruckProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function Truck({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: TruckProps) {
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
      <path d="M3 7h10v8H3z"/>
  <path d="M13 10h4l3 3v2h-7"/>
  <circle cx="7" cy="17" r="2"/>
  <circle cx="17" cy="17" r="2"/>
    </svg>
  );
}
