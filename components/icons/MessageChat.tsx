import React from 'react';

interface MessageChatProps {
  className?: string;
  size?: number | string;
  color?: string;
}

export default function MessageChat({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}: MessageChatProps) {
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
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  <path d="M8 10h8"/>
  <path d="M8 14h6"/>
    </svg>
  );
}
