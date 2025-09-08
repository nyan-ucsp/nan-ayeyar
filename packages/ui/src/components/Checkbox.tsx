import React from 'react';
import { cn } from '../utils/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id={checkboxId}
            type="checkbox"
            className={cn(
              'h-4 w-4 rounded border-secondary-300 text-primary-600',
              'focus:ring-primary-500 focus:ring-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-error-500 focus:ring-error-500',
              className
            )}
            {...props}
          />
        </div>
        {label && (
          <div className="ml-3 text-sm">
            <label
              htmlFor={checkboxId}
              className="font-medium text-secondary-700 cursor-pointer"
            >
              {label}
            </label>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
};
