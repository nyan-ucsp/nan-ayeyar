import React from 'react';
import { cn } from '../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-secondary-200 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-secondary-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('px-6 py-4 border-t border-secondary-200', className)}
      {...props}
    >
      {children}
    </div>
  );
};
