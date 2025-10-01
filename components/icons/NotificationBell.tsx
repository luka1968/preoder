import React from 'react';

interface NotificationBellProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function NotificationBell({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: NotificationBellProps) {
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
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
  <path d="m13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  );
}
