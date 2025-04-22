import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
}

export function InputField({
  label,
  error,
  multiline,
  rows = 3,
  className,
  ...props
}: InputFieldProps) {
  const inputClasses = cn(
    'block w-full rounded-md',
    'border-gray-300 dark:border-gray-600',
    'focus:border-blue-500 focus:ring-blue-500',
    'dark:bg-gray-800',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    className
  );

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          rows={rows}
          className={inputClasses}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          className={inputClasses}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 