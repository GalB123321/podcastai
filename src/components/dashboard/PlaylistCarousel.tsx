import * as React from 'react';
import { cn } from '@/lib/utils';

interface EpisodeCardData {
  id: string;
  title: string;
  thumbnailUrl?: string;
  duration: number;  // seconds
  status: 'draft' | 'published' | 'processing';
}

interface PlaylistCarouselProps {
  episodes: EpisodeCardData[];
  onSelect: (id: string) => void;
  className?: string;
}

/**
 * Formats time in seconds to mm:ss format
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const PlaylistCarousel: React.FC<PlaylistCarouselProps> = ({
  episodes,
  onSelect,
  className = ''
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scrollBy = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    
    const scrollAmount = direction === 'left' ? -300 : 300;
    containerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowLeft':
        scrollBy('left');
        event.preventDefault();
        break;
      case 'ArrowRight':
        scrollBy('right');
        event.preventDefault();
        break;
    }
  };

  return (
    <div 
      className={cn('relative flex items-center', className)}
      role="group"
      aria-label="Episode playlist"
      onKeyDown={handleKeyDown}
    >
      {/* Left Arrow */}
      <button
        onClick={() => scrollBy('left')}
        className={cn(
          'absolute left-0 z-10',
          'p-2 rounded-full',
          'bg-white dark:bg-gray-800',
          'shadow hover:bg-gray-100 dark:hover:bg-gray-700',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
        aria-label="Scroll left"
      >
        ←
      </button>

      {/* Scroll Container */}
      <div
        ref={containerRef}
        className={cn(
          'flex space-x-4 overflow-x-auto',
          'px-12 py-4',  // padding to accommodate arrows
          'scrollbar-hide',  // hide scrollbar but keep functionality
          'scroll-smooth'
        )}
      >
        {episodes.map((episode) => (
          <div
            key={episode.id}
            onClick={() => onSelect(episode.id)}
            role="button"
            tabIndex={0}
            aria-pressed="false"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(episode.id);
              }
            }}
            className={cn(
              'min-w-[200px]',
              'bg-white dark:bg-gray-800',
              'rounded-lg shadow',
              'cursor-pointer',
              'hover:shadow-lg',
              'transition-shadow duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500'
            )}
          >
            {/* Thumbnail */}
            <div className="relative w-full h-32">
              <img
                src={episode.thumbnailUrl || '/placeholder-episode.png'}
                alt={episode.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
              {/* Duration Badge */}
              <div className={cn(
                'absolute bottom-2 right-2',
                'px-2 py-1',
                'text-xs rounded-full',
                'bg-gray-900/75 text-white',
                'backdrop-blur-sm'
              )}>
                {formatTime(episode.duration)}
              </div>
            </div>

            {/* Info Section */}
            <div className="p-3">
              <h3 className="font-medium text-gray-900 dark:text-white truncate">
                {episode.title}
              </h3>
              <div className="mt-1 flex items-center justify-between">
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full',
                  episode.status === 'published' && 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                  episode.status === 'draft' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                  episode.status === 'processing' && 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                )}>
                  {episode.status.charAt(0).toUpperCase() + episode.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scrollBy('right')}
        className={cn(
          'absolute right-0 z-10',
          'p-2 rounded-full',
          'bg-white dark:bg-gray-800',
          'shadow hover:bg-gray-100 dark:hover:bg-gray-700',
          'transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500'
        )}
        aria-label="Scroll right"
      >
        →
      </button>
    </div>
  );
};

export default PlaylistCarousel; 