import React from 'react';

interface ShoppingCartPreorderProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function ShoppingCartPreorder({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: ShoppingCartPreorderProps) {
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
      <circle cx="9" cy="21" r="1"/>
  <circle cx="20" cy="21" r="1"/>
  <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  <path d="M12 8v4"/>
  <path d="M10 10h4"/>
    </svg>
  );
}
