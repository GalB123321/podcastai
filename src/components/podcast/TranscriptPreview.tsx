import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranscriptPreviewProps {
  script: string;
  className?: string;
}

export function TranscriptPreview({ script, className }: TranscriptPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
      >
        <span className="font-medium">Show Transcript</span>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            {script.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 