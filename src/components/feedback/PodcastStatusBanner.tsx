import * as React from 'react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PodcastStatusBannerProps {
  status: "idle" | "generatingScript" | "generatingAudio" | "ready";
  onCancel?: () => void;
  onRetry?: () => void;
  className?: string;
}

const PodcastStatusBanner: React.FC<PodcastStatusBannerProps> = ({
  status,
  onCancel,
  onRetry,
  className = "",
}) => {
  // Return null for idle state
  if (status === "idle") return null;

  // Define status-specific content
  const statusConfig = {
    generatingScript: {
      icon: "⏳",
      text: "Generating script...",
      bgColor: "bg-blue-600",
      showCancel: true,
    },
    generatingAudio: {
      icon: "🎙️",
      text: "Rendering audio...",
      bgColor: "bg-indigo-600",
      showCancel: true,
    },
    ready: {
      icon: "✓",
      text: "Your episode is ready!",
      bgColor: "bg-green-600",
      showCancel: false,
    },
  };

  const config = statusConfig[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        // Base styles
        'flex items-center justify-between',
        'w-full px-4 py-2',
        'rounded-b-lg',
        'text-white',
        'shadow-md dark:shadow-none',
        'transition-all duration-300 ease-in-out',
        // Status-specific background
        config.bgColor,
        // Optional extra styles
        className
      )}
    >
      {/* Status Icon and Text */}
      <div className="flex items-center space-x-2">
        <span className="text-lg" aria-hidden="true">
          {config.icon}
        </span>
        <span className="font-medium">
          {config.text}
        </span>
      </div>

      {/* Action Button */}
      {config.showCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className={cn(
            'bg-white bg-opacity-20 hover:bg-opacity-30',
            'px-3 py-1 rounded-md',
            'text-sm font-medium',
            'focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-1',
            'transition-colors duration-200',
            'flex items-center space-x-1'
          )}
          aria-label="Cancel generation"
        >
          <span>Cancel</span>
          <XMarkIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default PodcastStatusBanner; 