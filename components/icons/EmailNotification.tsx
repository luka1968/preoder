import React from 'react';

interface EmailNotificationProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function EmailNotification({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: EmailNotificationProps) {
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
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
  <polyline points="22,6 12,13 2,6"/>
  <circle cx="18" cy="8" r="3" fill="currentColor"/>
    </svg>
  );
}
