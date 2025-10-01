import React from 'react';

interface WarningAlertProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function WarningAlert({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: WarningAlertProps) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
  <path d="M12 9v4"/>
  <path d="m12 17.02.01 0"/>
    </svg>
  );
}
