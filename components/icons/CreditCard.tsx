import React from 'react';

interface CreditCardProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function CreditCard({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: CreditCardProps) {
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
      <rect width="20" height="14" x="2" y="5" rx="2"/>
  <line x1="2" x2="22" y1="10" y2="10"/>
  <line x1="6" x2="10" y1="15" y2="15"/>
    </svg>
  );
}
