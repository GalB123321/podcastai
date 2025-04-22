import { SparklesIcon } from '@heroicons/react/24/outline';

interface GenAlphaModeToggleProps {
  isActive: boolean;
  onChange: (isActive: boolean) => void;
  className?: string;
}

export function GenAlphaModeToggle({
  isActive,
  onChange,
  className = ''
}: GenAlphaModeToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={isActive}
      onClick={() => onChange(!isActive)}
      className={`
        group
        relative inline-flex h-8
        items-center gap-2
        rounded-full px-4
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
        ${isActive 
          ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white'
          : 'bg-gray-100 text-gray-500'
        }
        ${className}
      `}
    >
      {/* Icon */}
      <SparklesIcon className={`
        h-4 w-4
        transition-all duration-300
        ${isActive 
          ? 'animate-pulse text-yellow-300'
          : 'text-gray-400'
        }
      `} />

      {/* Label */}
      <span className={`
        text-sm font-bold
        transition-all duration-300
        ${isActive
          ? 'font-comic tracking-wider'
          : 'font-normal'
        }
      `}>
        Gen Alpha Mode {isActive ? '✨' : ''}
      </span>

      {/* Screen Reader Text */}
      <span className="sr-only">
        {isActive ? 'Disable Gen Alpha Mode' : 'Enable Gen Alpha Mode'}
      </span>

      {/* Background Animation */}
      <span
        className={`
          absolute inset-0
          rounded-full
          transition-opacity duration-300
          ${isActive
            ? 'opacity-100 animate-gradient bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500'
            : 'opacity-0'
          }
        `}
        aria-hidden="true"
      />
    </button>
  );
}

// Add this to your global CSS or a style tag
const styles = `
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  .animate-gradient {
    background-size: 200% 200%;
    animation: gradient 3s ease infinite;
  }

  .font-comic {
    font-family: "Comic Sans MS", "Comic Sans", cursive;
  }
`; 