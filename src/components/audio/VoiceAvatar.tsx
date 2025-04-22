import * as React from 'react';
import { cn } from '@/lib/utils';

export interface VoiceAvatarProps {
  /** Optional image URL for the avatar */
  src?: string;
  /** Accessible description */
  alt: string;
  /** When true, show a pulsing ring to indicate "speaking" */
  isActive?: boolean;
  /** Diameter in pixels (defaults to 48) */
  size?: number;
  /** Extra Tailwind classes */
  className?: string;
}

/**
 * VoiceAvatar
 * 
 * Renders a circular avatar image (or fallback icon) for a podcast voice.
 * If `isActive` is true, shows a pulsing colored ring around it.
 */
const VoiceAvatar: React.FC<VoiceAvatarProps> = ({
  src,
  alt,
  isActive = false,
  size = 48,
  className = '',
}) => {
  // Compute inline styles for custom size
  const dimensionStyle: React.CSSProperties = {
    width: size,
    height: size,
  };

  return (
    <div
      className={cn(
        // Base styles
        'rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800',
        'transition-all duration-200',
        // Active state with pulsing ring
        isActive && 'ring-2 ring-blue-500 animate-pulse',
        className
      )}
      style={dimensionStyle}
      aria-label={alt}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
          loading="lazy"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="flex items-center justify-center w-full h-full text-gray-400 dark:text-gray-500"
        >
          {/* Simple fallback SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-1/2 h-1/2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default VoiceAvatar; 