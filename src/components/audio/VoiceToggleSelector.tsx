import * as React from 'react';
import { cn } from '@/lib/utils';

interface VoiceOption {
  id: string;
  label: string;
  avatarUrl?: string;   // optional icon or avatar image
}

interface VoiceToggleSelectorProps {
  options: VoiceOption[];
  selected: string;               // id of the current voice
  onChange: (voiceId: string) => void;
  className?: string;
}

export const VoiceToggleSelector: React.FC<VoiceToggleSelectorProps> = ({
  options,
  selected,
  onChange,
  className
}) => {
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = options.findIndex(opt => opt.id === selected);
    
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowUp': {
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
        onChange(options[prevIndex].id);
        break;
      }
      case 'ArrowRight':
      case 'ArrowDown': {
        event.preventDefault();
        const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
        onChange(options[nextIndex].id);
        break;
      }
    }
  };

  return (
    <div 
      className={cn('flex space-x-4 p-2', className)}
      role="radiogroup"
      aria-label="Voice Selection"
      onKeyDown={handleKeyDown}
    >
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          aria-pressed={selected === option.id}
          aria-label={option.label}
          className={cn(
            // Base styles
            'flex flex-col items-center p-2 rounded-lg transition-all',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
            // Hover state
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            // Selected state
            selected === option.id && [
              'ring-2 ring-blue-500',
              'bg-blue-50 dark:bg-blue-900/20'
            ]
          )}
        >
          {/* Avatar/Icon Container */}
          <div className={cn(
            'w-12 h-12 rounded-full overflow-hidden',
            'bg-gray-200 dark:bg-gray-700',
            'flex items-center justify-center mb-2'
          )}>
            {option.avatarUrl ? (
              <img
                src={option.avatarUrl}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              // Placeholder icon when no avatar is provided
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            )}
          </div>

          {/* Voice Label */}
          <span className={cn(
            'text-sm font-medium',
            'text-gray-700 dark:text-gray-200',
            selected === option.id && 'text-blue-600 dark:text-blue-400'
          )}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}; 