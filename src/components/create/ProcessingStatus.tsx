import { useEffect, useState } from 'react';
import { formatTime } from '@/utils/formatTime';
import { cn } from '@/lib/utils';

// Icons for each step
import { 
  Search, 
  FileText, 
  Mic, 
  Combine, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';

export type ProcessingStep = 'research' | 'script' | 'voice' | 'merge' | 'ready' | 'error';

interface ProcessingStatusProps {
  step: ProcessingStep;
  startedAt: Date;
  className?: string;
}

const stepConfig = {
  research: {
    icon: Search,
    label: 'Researching Topic',
    color: 'text-blue-500'
  },
  script: {
    icon: FileText,
    label: 'Writing Script',
    color: 'text-purple-500'
  },
  voice: {
    icon: Mic,
    label: 'Generating Voice',
    color: 'text-pink-500'
  },
  merge: {
    icon: Combine,
    label: 'Mixing Audio',
    color: 'text-orange-500'
  },
  ready: {
    icon: CheckCircle2,
    label: 'Complete!',
    color: 'text-green-500'
  },
  error: {
    icon: AlertCircle,
    label: 'Error Occurred',
    color: 'text-red-500'
  }
};

export function ProcessingStatus({ step, startedAt, className }: ProcessingStatusProps) {
  const [elapsedTime, setElapsedTime] = useState<string>('00:00');
  
  useEffect(() => {
    // Only update timer if not complete or error
    if (step !== 'ready' && step !== 'error') {
      const interval = setInterval(() => {
        const elapsed = Date.now() - startedAt.getTime();
        setElapsedTime(formatTime(elapsed / 1000));
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [step, startedAt]);

  const StepIcon = stepConfig[step].icon;
  const isComplete = step === 'ready';
  const isError = step === 'error';

  return (
    <div className={cn('flex items-center gap-3 p-4', className)}>
      <div className={cn(
        'rounded-full p-2 transition-all duration-300',
        stepConfig[step].color,
        isComplete && 'animate-bounce',
        isError && 'animate-pulse'
      )}>
        <StepIcon className="w-6 h-6" />
      </div>
      
      <div className="flex flex-col">
        <span className="font-medium">{stepConfig[step].label}</span>
        {!isComplete && !isError && (
          <span className="text-sm text-muted-foreground">
            Elapsed: {elapsedTime}
          </span>
        )}
      </div>
    </div>
  );
} 