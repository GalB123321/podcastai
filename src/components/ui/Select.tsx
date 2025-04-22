import { SelectHTMLAttributes, forwardRef, ReactElement } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption<T> {
  value: T;
  label: string;
}

export interface SelectProps<T> extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  options: SelectOption<T>[];
  value?: SelectOption<T>;
  onChange?: (option: SelectOption<T> | null) => void;
  error?: string;
  placeholder?: string;
}

function SelectComponent<T>(
  {
    className,
    options,
    value,
    onChange,
    error,
    placeholder,
    ...props
  }: SelectProps<T>,
  ref: React.ForwardedRef<HTMLSelectElement>
) {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          className
        )}
        ref={ref}
        value={value ? String(value.value) : ''}
        onChange={(e) => {
          const selectedOption = options.find(opt => String(opt.value) === e.target.value) || null;
          onChange?.(selectedOption);
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}

export const Select = forwardRef(SelectComponent) as <T>(
  props: SelectProps<T> & { ref?: React.ForwardedRef<HTMLSelectElement> }
) => ReactElement; 