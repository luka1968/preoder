import React from 'react';

export interface IconProps {
  className?: string;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export interface IconWrapperProps extends IconProps {
  children: React.ReactNode;
  viewBox?: string;
}

/**
 * 图标包装器组件
 * 提供统一的图标属性和样式
 */
export default function IconWrapper({
  children,
  className = '',
  size = 24,
  color = 'currentColor',
  strokeWidth = 1.5,
  viewBox = '0 0 24 24'
}: IconWrapperProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`}
      role="img"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * 图标尺寸预设
 */
export const IconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 48
} as const;

/**
 * 图标颜色预设
 */
export const IconColors = {
  primary: 'var(--color-primary-600)',
  secondary: '#6b7280',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  current: 'currentColor'
} as const;

export type IconSize = keyof typeof IconSizes | number | string;
export type IconColor = keyof typeof IconColors | string;
