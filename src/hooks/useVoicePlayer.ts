import * as React from 'react';

/**
 * Hook for managing audio playback state and controls
 * @param src - URL of the audio file to play
 * @returns Object containing playback state and control methods
 */
export function useVoicePlayer(src: string | null) {
  // Audio element reference
  const audioRef = React.useRef<HTMLAudioElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [currentTime, setCurrentTime] = React.useState<number>(0);
  const [duration, setDuration] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load src changes
  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    setIsLoading(true);
    setError(null);
    audio.src = src;

    const onLoaded = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onError = () => {
      setError('Audio playback error');
      setIsLoading(false);
      setIsPlaying(false);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);

    // Cleanup function
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);

      // Reset states when unmounting or changing source
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setError(null);
      setIsLoading(false);
    };
  }, [src]);

  // Control methods
  const play = React.useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      setError(null);
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      setError('Failed to start playback');
      setIsPlaying(false);
      console.error('Playback error:', err);
    }
  }, []);

  const pause = React.useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      audio.pause();
      setIsPlaying(false);
    } catch (err) {
      setError('Failed to pause playback');
      console.error('Pause error:', err);
    }
  }, []);

  const seek = React.useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Ensure time is within valid bounds
      const newTime = Math.max(0, Math.min(time, audio.duration || 0));
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    } catch (err) {
      setError('Failed to seek');
      console.error('Seek error:', err);
    }
  }, []);

  const setVolume = React.useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // Ensure volume is between 0 and 1
      const newVolume = Math.max(0, Math.min(vol, 1));
      audio.volume = newVolume;
    } catch (err) {
      setError('Failed to set volume');
      console.error('Volume error:', err);
    }
  }, []);

  return {
    isPlaying,
    currentTime,
    duration,
    isLoading,
    error,
    play,
    pause,
    seek,
    setVolume,
    ref: audioRef,
  };
} 