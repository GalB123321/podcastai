import * as React from 'react';
import { cn } from '@/lib/utils';

interface Badge {
  id: string;
  name: string;
  icon: React.ReactNode;    // an SVG or icon component
  description: string;
  unlockedAt: string;       // ISO timestamp
}

interface BadgeDisplayProps {
  badges: Badge[];
  className?: string;
}

/**
 * Formats a date string to a more readable format
 */
const formatDate = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  className = ''
}) => {
  // State for the tooltip
  const [activeTooltip, setActiveTooltip] = React.useState<string | null>(null);

  return (
    <div className={cn('space-y-6', className)}>
      {badges.length === 0 ? (
        <div className={cn(
          'text-center p-8',
          'bg-white dark:bg-gray-800',
          'rounded-lg shadow-sm',
          'text-gray-600 dark:text-gray-300'
        )}>
          <p className="text-lg">No badges yet—start creating episodes to earn your first one! 🎯</p>
        </div>
      ) : (
        <div className={cn(
          'grid gap-4',
          'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
        )}>
          {badges.map((badge) => (
            <div
              key={badge.id}
              role="button"
              tabIndex={0}
              aria-label={`${badge.name}: ${badge.description}`}
              className={cn(
                'relative flex flex-col items-center',
                'p-4 bg-white dark:bg-gray-800',
                'rounded-lg shadow',
                'hover:scale-105 transform transition',
                'focus:outline-none focus:ring-2 focus:ring-blue-500'
              )}
              onMouseEnter={() => setActiveTooltip(badge.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              onFocus={() => setActiveTooltip(badge.id)}
              onBlur={() => setActiveTooltip(null)}
            >
              {/* Icon */}
              <div className="text-4xl mb-2">
                {badge.icon}
              </div>

              {/* Badge Name */}
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                {badge.name}
              </h3>

              {/* Tooltip */}
              {activeTooltip === badge.id && (
                <div
                  role="tooltip"
                  className={cn(
                    'absolute bottom-full mb-2 w-48 p-2',
                    'bg-gray-700 text-white',
                    'text-xs rounded shadow-lg',
                    'transform -translate-x-1/2 left-1/2',
                    'z-10'
                  )}
                >
                  <div className="font-medium mb-1">{badge.description}</div>
                  <div className="text-gray-300">
                    Unlocked on {formatDate(badge.unlockedAt)}
                  </div>
                  {/* Tooltip Arrow */}
                  <div className={cn(
                    'absolute -bottom-1 left-1/2',
                    'w-2 h-2 bg-gray-700',
                    'transform -translate-x-1/2 rotate-45'
                  )} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay; 