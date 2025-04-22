import * as React from 'react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { cn } from '@/lib/utils';

interface StepNavigatorProps {
  currentStep: number;
  maxSteps: number;
  isStepValid: boolean;
  onNext: () => void;
  onBack: () => void;
  className?: string;
}

/**
 * StepNavigator
 * 
 * Handles navigation between wizard steps with Previous/Next buttons
 * and proper accessibility support.
 */
export const StepNavigator: React.FC<StepNavigatorProps> = ({
  currentStep,
  maxSteps,
  isStepValid,
  onNext,
  onBack,
  className
}) => {
  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey && isStepValid) {
      onNext();
    }
  };

  const isLastStep = currentStep === maxSteps - 1;

  return (
    <div 
      className={cn(
        'flex flex-col sm:flex-row justify-between gap-4',
        className
      )}
    >
      {/* Previous button */}
      <PrimaryButton
        onClick={onBack}
        disabled={currentStep === 0}
        aria-disabled={currentStep === 0}
        className={cn(
          'order-2 sm:order-1',
          'bg-gray-100 text-gray-900 hover:bg-gray-200',
          'dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
        )}
      >
        Previous
      </PrimaryButton>

      {/* Next/Generate button */}
      <PrimaryButton
        onClick={onNext}
        disabled={!isStepValid}
        aria-disabled={!isStepValid}
        onKeyDown={handleKeyDown}
        className="order-1 sm:order-2"
      >
        {isLastStep ? 'Generate Podcast' : 'Next'}
      </PrimaryButton>
    </div>
  );
};

export default StepNavigator; 