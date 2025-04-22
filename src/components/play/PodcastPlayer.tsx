import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { usePlanProtection } from '@/hooks/usePlanProtection';
import { cn } from '@/lib/utils';
import { DownloadButton } from '@/components/ui/DownloadButton';

// Lazy load WaveSurfer component
const WaveSurferPlayer = dynamic(
  () => import('@/components/play/WaveSurferPlayer'),
  { ssr: false }
);

interface PodcastPlayerProps {
  audioUrl: string;
  className?: string;
  title?: string;
  onError?: (error: Error) => void;
}

const SPEEDS = [1, 1.25, 1.5, 2];

export function PodcastPlayer({ 
  audioUrl, 
  className,
  title,
  onError 
}: PodcastPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);
  const [error, setError] = useState<Error | null>(null);
  const { hasAccess } = usePlanProtection({
    feature: 'editing',
    hardBlock: false,
    showToast: true
  });

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const skip = (seconds: number) => {
    const wavesurfer = document.querySelector('wavesurfer-player') as any;
    if (wavesurfer) {
      const newTime = Math.max(0, Math.min(currentTime + seconds, duration));
      wavesurfer.currentTime = newTime;
    }
  };

  const cycleSpeed = () => {
    setSpeedIndex((speedIndex + 1) % SPEEDS.length);
  };

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const handleDurationChange = (dur: number) => {
    setDuration(dur);
  };

  const handleError = (err: Error) => {
    setError(err);
    onError?.(err);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center text-destructive">
        <p>Failed to load audio player: {error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-full bg-destructive px-4 py-2 text-destructive-foreground hover:bg-destructive/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={cn('rounded-lg border bg-card p-6 space-y-4', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
          {hasAccess && (
            <DownloadButton url={audioUrl} filename={`${title}.mp3`} />
          )}
        </div>
      )}

      {/* Waveform */}
      <WaveSurferPlayer
        url={audioUrl}
        isPlaying={isPlaying}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onError={handleError}
        playbackRate={SPEEDS[speedIndex]}
      />

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="rounded-full bg-primary p-3 text-primary-foreground hover:bg-primary/90"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </button>

          {/* Skip Buttons */}
          <button
            onClick={() => skip(-15)}
            className="rounded-full bg-muted p-2 hover:bg-muted/80"
            aria-label="Skip back 15 seconds"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={() => skip(15)}
            className="rounded-full bg-muted p-2 hover:bg-muted/80"
            aria-label="Skip forward 15 seconds"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          {/* Time */}
          <div className="text-sm text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Speed Control */}
        <button
          onClick={cycleSpeed}
          className="rounded-full bg-muted px-3 py-1 text-sm hover:bg-muted/80"
          aria-label={`Playback speed: ${SPEEDS[speedIndex]}x`}
        >
          {SPEEDS[speedIndex]}×
        </button>
      </div>
    </div>
  );
} 