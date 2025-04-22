import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

interface DarkModeToggleProps {
  isDark: boolean;
  onChange: (isDark: boolean) => void;
  className?: string;
}

export function DarkModeToggle({
  isDark,
  onChange,
  className = ''
}: DarkModeToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={isDark}
      onClick={() => onChange(!isDark)}
      className={`
        relative inline-flex h-8 w-14
        items-center rounded-full
        transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${isDark ? 'bg-blue-600' : 'bg-gray-200'}
        ${className}
      `}
    >
      {/* Track */}
      <span className="sr-only">
        {isDark ? 'Disable dark mode' : 'Enable dark mode'}
      </span>

      {/* Thumb */}
      <span
        className={`
          inline-flex h-6 w-6
          transform items-center justify-center rounded-full
          bg-white shadow-lg ring-0
          transition duration-300 ease-in-out
          ${isDark ? 'translate-x-7' : 'translate-x-1'}
        `}
      >
        {isDark ? (
          <MoonIcon className="h-4 w-4 text-blue-600" />
        ) : (
          <SunIcon className="h-4 w-4 text-yellow-500" />
        )}
      </span>
    </button>
  );
} 