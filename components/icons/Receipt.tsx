import React from 'react';

interface ReceiptProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function Receipt({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: ReceiptProps) {
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
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
  <path d="M12 6V4"/>
  <path d="M12 20v-2"/>
    </svg>
  );
}
