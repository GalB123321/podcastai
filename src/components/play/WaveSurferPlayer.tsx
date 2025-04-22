/// <reference types="@types/wavesurfer.js" />
import { useEffect, useRef } from 'react';
import WaveSurfer from 'wavesurfer.js';

interface WaveSurferPlayerProps {
  url: string;
  isPlaying: boolean;
  playbackRate: number;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
  onError: (error: Error) => void;
}

export default function WaveSurferPlayer({
  url,
  isPlaying,
  playbackRate,
  onTimeUpdate,
  onDurationChange,
  onError
}: WaveSurferPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const wavesurfer = WaveSurfer.create({
      container: containerRef.current,
      waveColor: 'rgb(var(--muted-foreground))',
      progressColor: 'rgb(var(--primary))',
      cursorColor: 'rgb(var(--primary))',
      barWidth: 2,
      barGap: 3,
      height: 64,
      normalize: true
    });

    // Load audio and handle errors
    wavesurfer.load(url).catch(err => {
      onError(err instanceof Error ? err : new Error(String(err)));
    });

    wavesurfer.on('ready', () => {
      wavesurferRef.current = wavesurfer;
      onDurationChange(wavesurfer.getDuration());
    });

    wavesurfer.on('audioprocess', () => {
      onTimeUpdate(wavesurfer.getCurrentTime());
    });

    return () => {
      wavesurfer.destroy();
    };
  }, [url, onDurationChange, onTimeUpdate, onError]);

  useEffect(() => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    if (isPlaying) {
      wavesurfer.play();
    } else {
      wavesurfer.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const wavesurfer = wavesurferRef.current;
    if (!wavesurfer) return;

    wavesurfer.setPlaybackRate(playbackRate);
  }, [playbackRate]);

  return <div ref={containerRef} />;
} 