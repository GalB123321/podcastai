import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, className, ...props }, ref) => {
    const id = React.useId();

    return (
      <div className="w-full">
        <label
          htmlFor={id}
          className="block text-sm font-medium text-textPrimary mb-1"
        >
          {label}
        </label>
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "w-full px-4 py-2 bg-surface border border-muted rounded-lg",
            "focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent",
            "placeholder:text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error && "border-red-500 focus:ring-red-500/20 focus:border-red-500",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField'; 