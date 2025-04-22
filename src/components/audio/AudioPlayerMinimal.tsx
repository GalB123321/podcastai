import * as React from 'react';
import { useVoicePlayer } from '@/hooks/useVoicePlayer';
import { cn } from '@/lib/utils';

interface AudioPlayerMinimalProps {
  src: string;             // URL of the audio file
  className?: string;      // Optional container styling
}

/**
 * Formats time in seconds to mm:ss format
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const AudioPlayerMinimal: React.FC<AudioPlayerMinimalProps> = ({
  src,
  className
}) => {
  // Progress bar reference for handling clicks
  const progressBarRef = React.useRef<HTMLDivElement>(null);

  // Hook integration
  const {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    play,
    pause,
    seek,
    setVolume,
    ref: audioRef
  } = useVoicePlayer(src);

  // Handle progress bar click/drag
  const handleProgressBarInteraction = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    seek(percent * duration);
  };

  // Handle volume change
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    setVolume(volume);
  };

  // Handle keyboard controls for progress bar
  const handleProgressKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const STEP = 5; // 5 seconds step
    
    switch (event.key) {
      case 'ArrowLeft':
        seek(Math.max(0, currentTime - STEP));
        event.preventDefault();
        break;
      case 'ArrowRight':
        seek(Math.min(duration, currentTime + STEP));
        event.preventDefault();
        break;
    }
  };

  return (
    <div 
      className={cn(
        'flex items-center space-x-4 p-4 rounded-lg bg-white/10',
        'shadow-lg backdrop-blur-sm',
        className
      )}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Play/Pause button */}
      <button
        onClick={isPlaying ? pause : play}
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause' : 'Play'}
        className={cn(
          'w-8 h-8 inline-flex items-center justify-center',
          'rounded-full bg-white/20 hover:bg-white/30',
          'focus:outline-none focus:ring-2 focus:ring-white/50',
          'disabled:opacity-50 transition-colors'
        )}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin" />
        ) : (
          <span className="text-xl">
            {isPlaying ? '⏸️' : '▶️'}
          </span>
        )}
      </button>

      {/* Time display */}
      <div className="text-sm text-white/80 min-w-[100px]">
        {formatTime(currentTime)} / {formatTime(duration)}
      </div>

      {/* Progress bar */}
      <div
        ref={progressBarRef}
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={duration ? (currentTime / duration) * 100 : 0}
        onClick={handleProgressBarInteraction}
        onKeyDown={handleProgressKeyDown}
        className={cn(
          'flex-1 h-1 bg-white/20 rounded-full cursor-pointer',
          'relative focus:outline-none focus:ring-2',
          'focus:ring-white/50 focus:ring-offset-2'
        )}
      >
        <div
          className="absolute left-0 top-0 h-full bg-white/80 rounded-full"
          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
        />
      </div>

      {/* Volume control */}
      <div className="flex items-center space-x-2">
        <label htmlFor="volume-slider" className="sr-only">
          Volume
        </label>
        <input
          id="volume-slider"
          type="range"
          min="0"
          max="1"
          step="0.05"
          defaultValue="1"
          onChange={handleVolumeChange}
          aria-label="Volume"
          className={cn(
            'w-24 h-1 rounded-full bg-white/20',
            'accent-white/80 cursor-pointer'
          )}
        />
      </div>

      {/* Error message */}
      {error && (
        <div 
          role="alert"
          className="text-sm text-red-500"
        >
          {error}
        </div>
      )}
    </div>
  );
}; 