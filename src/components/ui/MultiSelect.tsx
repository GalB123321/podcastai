import { useState, useRef, useEffect } from 'react';
import { CheckIcon, ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  name: string;
  id: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: string;
}

export function MultiSelect({
  options,
  value,
  onChange,
  name,
  id,
  label,
  placeholder = 'Select options...',
  disabled = false,
  className = '',
  error,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle option toggle
  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  // Get selected options' labels
  const selectedLabels = options
    .filter(option => value.includes(option.value))
    .map(option => option.label);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}

      {/* Main Button */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          relative w-full
          min-h-[42px]
          px-4 py-2
          text-left
          bg-white
          rounded-lg
          border
          ${error ? 'border-red-500' : 'border-gray-300'}
          ${disabled
            ? 'bg-gray-50 cursor-not-allowed'
            : 'hover:border-gray-400'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          transition-colors duration-200
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-disabled={disabled}
      >
        <div className="flex flex-wrap gap-1">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label) => (
              <span
                key={label}
                className="
                  inline-flex items-center
                  px-2 py-0.5
                  rounded
                  text-sm
                  bg-blue-100 text-blue-800
                "
              >
                {label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const optionToRemove = options.find(opt => opt.label === label);
                    if (optionToRemove) {
                      toggleOption(optionToRemove.value);
                    }
                  }}
                  className="ml-1 hover:text-blue-900"
                  aria-label={`Remove ${label}`}
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDownIcon
          className={`
            absolute right-4 top-1/2 -translate-y-1/2
            h-5 w-5 text-gray-400
            transition-transform duration-200
            ${isOpen ? 'transform rotate-180' : ''}
          `}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute z-10 w-full mt-1
            bg-white
            rounded-lg
            border border-gray-300
            shadow-lg
            max-h-60 overflow-auto
          "
        >
          {/* Search Input */}
          <div className="sticky top-0 bg-white p-2 border-b">
            <input
              type="text"
              className="
                w-full
                px-3 py-1.5
                text-sm
                rounded-md
                border border-gray-300
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              "
              placeholder="Search options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Options List */}
          <ul
            className="py-2"
            role="listbox"
            aria-multiselectable="true"
            tabIndex={-1}
          >
            {filteredOptions.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={value.includes(option.value)}
                onClick={() => toggleOption(option.value)}
                className={`
                  flex items-center
                  px-4 py-2
                  cursor-pointer
                  hover:bg-gray-50
                  ${value.includes(option.value) ? 'bg-blue-50' : ''}
                `}
              >
                <div className={`
                  w-5 h-5
                  border rounded
                  flex items-center justify-center
                  mr-3
                  ${value.includes(option.value)
                    ? 'bg-blue-500 border-blue-500'
                    : 'border-gray-300'
                  }
                `}>
                  {value.includes(option.value) && (
                    <CheckIcon className="h-4 w-4 text-white" />
                  )}
                </div>
                {option.label}
              </li>
            ))}
            {filteredOptions.length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500">
                No options found
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
} 