import { SelectHTMLAttributes } from 'react';

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectorProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  errorMessage?: string;
  id: string;
}

export function DropdownSelector({
  label,
  options,
  errorMessage,
  id,
  className = '',
  required = false,
  ...props
}: DropdownSelectorProps) {
  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <select
        id={id}
        className={`
          w-full
          px-4 py-2
          rounded-lg
          border
          text-base
          bg-white
          appearance-none
          cursor-pointer
          ${errorMessage
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          transition-colors duration-200
          ${className}
        `}
        aria-invalid={errorMessage ? 'true' : 'false'}
        aria-describedby={errorMessage ? `${id}-error` : undefined}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {errorMessage && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-red-500"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
} 