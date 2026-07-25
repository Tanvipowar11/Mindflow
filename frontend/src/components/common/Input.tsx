import React from 'react';

interface InputProps {
  placeholder?: string;
  type?: 'text' | 'email' | 'password';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  'aria-label'?: string;
}

export const Input: React.FC<InputProps> = ({
  placeholder,
  type = 'text',
  value,
  onChange,
  disabled = false,
  required = false,
  'aria-label': ariaLabel
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      aria-label={ariaLabel}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
    />
  );
};