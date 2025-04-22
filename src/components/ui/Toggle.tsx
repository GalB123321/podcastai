interface ToggleProps {
  isChecked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  name: string;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  isChecked,
  onChange,
  label,
  name,
  disabled = false,
  className = '',
}: ToggleProps) {
  const id = `toggle-${name}`;

  return (
    <label
      htmlFor={id}
      className={`
        inline-flex items-center gap-3 cursor-pointer
        ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        ${className}
      `}
    >
      <button
        type="button"
        role="switch"
        id={id}
        name={name}
        aria-checked={isChecked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!isChecked)}
        className={`
          relative inline-flex h-6 w-11
          items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isChecked ? 'bg-green-500' : 'bg-gray-200'}
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="sr-only">{label}</span>
        <span
          className={`
            inline-block h-4 w-4 rounded-full
            bg-white shadow
            transform transition-transform duration-200 ease-in-out
            ${isChecked ? 'translate-x-6' : 'translate-x-1'}
          `}
          aria-hidden="true"
        />
      </button>
      <span className="text-sm font-medium text-gray-900">
        {label}
      </span>
    </label>
  );
} 