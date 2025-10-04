import React from 'react'

interface InputProps {
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  className?: string
  type?: string
  disabled?: boolean
}

export function Input({ 
  value, 
  onChange, 
  placeholder, 
  className = '', 
  type = 'text',
  disabled = false
}: InputProps) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    />
  )
}
