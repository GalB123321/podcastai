import * as React from 'react';
import { cn } from '@/lib/utils';

interface CreditMeterProps {
  credits: number;               // current credit balance
  maxCredits?: number;          // optional maximum for the meter (default 100)
  lowThreshold?: number;        // triggers warning when credits ≤ this (default 10)
  onBuyMore: () => void;        // callback when user clicks "Buy More"
  className?: string;
}

const CreditMeter: React.FC<CreditMeterProps> = ({
  credits,
  maxCredits = 100,
  lowThreshold = 10,
  onBuyMore,
  className = '',
}) => {
  // Calculate meter fill percentage
  const fillPercentage = React.useMemo(() => 
    Math.min((credits / maxCredits) * 100, 100),
    [credits, maxCredits]
  );

  // Determine if credits are low
  const isLow = credits <= lowThreshold;

  return (
    <div
      className={cn(
        'flex items-center space-x-4 p-2 bg-white dark:bg-gray-800 rounded',
        className
      )}
    >
      {/* Credit Badge */}
      <div
        role="status"
        aria-label={`Current credits: ${credits}`}
        className={cn(
          'px-3 py-1 font-medium text-sm rounded-full transition-colors',
          isLow 
            ? 'bg-red-500 text-white' 
            : 'bg-blue-600 text-white'
        )}
      >
        {credits} Cr
      </div>

      {/* Meter Container */}
      <div className="flex-1">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            role="progressbar"
            aria-valuenow={credits}
            aria-valuemin={0}
            aria-valuemax={maxCredits}
            className={cn(
              'h-full transition-all duration-300',
              isLow ? 'bg-red-500' : 'bg-blue-500'
            )}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>

        {/* Low Credits Warning */}
        {isLow && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">
            Low credits! Consider topping up.
          </p>
        )}
      </div>

      {/* Buy More Button */}
      <button
        type="button"
        onClick={onBuyMore}
        className={cn(
          'px-4 py-1 text-sm font-semibold rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          isLow
            ? 'text-red-600 hover:text-red-700 focus:ring-red-500'
            : 'text-blue-600 hover:text-blue-700 focus:ring-blue-500'
        )}
        aria-label="Buy more credits"
      >
        Buy More
      </button>
    </div>
  );
};

export default CreditMeter; 