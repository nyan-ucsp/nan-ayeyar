import React from 'react';
import { cn } from '../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-secondary-700 mb-1"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'block w-full rounded-md border border-secondary-300 px-3 py-2',
          'placeholder:text-secondary-400',
          'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
          'disabled:bg-secondary-50 disabled:text-secondary-500',
          'resize-vertical',
          error && 'border-error-500 focus:border-error-500 focus:ring-error-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-error-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
};
