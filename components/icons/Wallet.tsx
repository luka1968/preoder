import React from 'react';

interface WalletProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function Wallet({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: WalletProps) {
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
      <path d="M19 7V6a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1v2a1 1 0 0 0 1 1h1a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/>
  <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
  <circle cx="17" cy="12" r="1"/>
    </svg>
  );
}
