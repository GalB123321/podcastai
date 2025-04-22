import * as React from 'react';
import { cn } from '@/lib/utils';

interface StreakCounterProps {
  currentStreak: number;      // Number of consecutive days
  milestoneDays?: number[];   // e.g. [7, 14, 30] to trigger celebration
  className?: string;
}

const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  milestoneDays = [7, 14, 30],
  className = '',
}) => {
  // Check if current streak is a milestone
  const isMilestone = React.useMemo(() => 
    milestoneDays.includes(currentStreak),
    [currentStreak, milestoneDays]
  );

  // Container classes based on state
  const containerClasses = cn(
    'inline-flex items-center space-x-2 px-3 py-1 rounded-full transition-all duration-300',
    currentStreak > 0
      ? 'bg-green-100 dark:bg-green-900'
      : 'bg-gray-100 dark:bg-gray-800',
    isMilestone && 'animate-pulse',
    className
  );

  // Text classes based on state
  const textClasses = cn(
    'text-sm font-medium',
    currentStreak > 0
      ? 'text-green-800 dark:text-green-100'
      : 'text-gray-700 dark:text-gray-300'
  );

  // Icon classes based on state
  const iconClasses = cn(
    'text-xl',
    currentStreak > 0
      ? 'text-green-600 dark:text-green-300'
      : 'text-gray-500 dark:text-gray-400'
  );

  // Determine aria label based on state
  const ariaLabel = currentStreak > 0
    ? `Your current streak is ${currentStreak} days`
    : 'No streak yet. Start today!';

  // Determine tooltip text for milestone
  const tooltipText = isMilestone
    ? `🎉 Congrats on your ${currentStreak}-day streak!`
    : undefined;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      title={tooltipText}
      className={containerClasses}
    >
      {/* Icon */}
      <span className={iconClasses}>
        {currentStreak > 0 ? '🔥' : '📅'}
      </span>

      {/* Text */}
      <span className={textClasses}>
        {currentStreak > 0 ? (
          <>
            Streak: {currentStreak} day{currentStreak !== 1 ? 's' : ''}
          </>
        ) : (
          'Keep going—start your streak today!'
        )}
      </span>
    </div>
  );
};

export default StreakCounter; 