import { useState } from 'react';
import { formatTime } from '@/utils/formatTime';
import { Copy } from 'lucide-react';
import { toast } from '@/components/ui/useToast';
import { cn } from '@/lib/utils';

interface TranscriptLine {
  speaker: string;
  text: string;
  timestamp: number;
}

interface TranscriptBlockProps {
  transcriptJSON: TranscriptLine[];
  className?: string;
}

export function TranscriptBlock({ transcriptJSON, className }: TranscriptBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyTranscript = async () => {
    const text = transcriptJSON
      .map(line => `${line.speaker}: ${line.text}`)
      .join('\n\n');
    
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Transcript copied to clipboard'
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('relative rounded-lg border bg-card p-6', className)}>
      <div className="space-y-4">
        {transcriptJSON.map((line, index) => (
          <div
            key={index}
            className={cn(
              'flex gap-4',
              index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
            )}
          >
            {/* Speaker Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-medium">
              {line.speaker[0]}
            </div>

            {/* Message Bubble */}
            <div className={cn(
              'relative max-w-[80%] rounded-lg p-4',
              index % 2 === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}>
              <div className="font-medium">{line.speaker}</div>
              <div className="mt-1">{line.text}</div>
              <div className="mt-2 text-xs opacity-70">
                {formatTime(line.timestamp)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Copy Button */}
      <button
        onClick={copyTranscript}
        className={cn(
          'absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg transition-all hover:bg-primary/90',
          copied && 'bg-green-500'
        )}
      >
        <Copy className="h-4 w-4" />
        {copied ? 'Copied!' : 'Copy All'}
      </button>
    </div>
  );
} 