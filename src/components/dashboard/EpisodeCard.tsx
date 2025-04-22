import * as React from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { hasAccessToFeature, type PlanTier } from '@/lib/planAccess';
import PlanLockMessage from '@/components/access/PlanLockMessage';

interface EpisodeCardProps {
  id: string;
  title: string;
  thumbnailUrl?: string;
  date: string;         // e.g. 'Apr 20, 2025'
  duration: number;     // in seconds
  status: 'draft' | 'published' | 'processing';
  onPlay: (id: string) => void;
  onEdit: (id: string) => void;
  onShare: (id: string) => void;
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

const statusConfig = {
  draft: {
    label: 'Draft',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
  },
  published: {
    label: 'Published',
    className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  }
} as const;

const EpisodeCard: React.FC<EpisodeCardProps> = ({
  id,
  title,
  thumbnailUrl,
  date,
  duration,
  status,
  onPlay,
  onEdit,
  onShare,
  className = ''
}) => {
  const { user } = useAuth();
  const userPlan = (user?.firestoreData?.plan as PlanTier) || 'personal';
  const hasSpotifyExport = hasAccessToFeature(userPlan, 'spotifyExport');
  const hasCustomBranding = hasAccessToFeature(userPlan, 'customBranding');

  const handleCardClick = () => {
    onEdit(id);
  };

  return (
    <div 
      className={cn(
        'flex items-center p-4 rounded-lg shadow-sm hover:shadow-md transition',
        'bg-white dark:bg-gray-800',
        'cursor-pointer',
        className
      )}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-20 flex-shrink-0">
        {hasCustomBranding ? (
          <img
            src={thumbnailUrl || '/placeholder-episode.png'}
            alt={title}
            className="w-full h-full rounded-md object-cover bg-gray-200 dark:bg-gray-700"
          />
        ) : (
          <div className="w-full h-full rounded-md bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-2xl">🎙️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="ml-4 flex-grow min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {date} • {formatTime(duration)}
            </p>
          </div>
          <span 
            className={cn(
              'px-2 py-0.5 text-xs rounded-full',
              statusConfig[status].className
            )}
          >
            {statusConfig[status].label}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div 
        className="ml-4 flex items-center space-x-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onPlay(id)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Play episode"
        >
          <span className="text-xl">▶️</span>
        </button>
        <button
          onClick={() => onEdit(id)}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          aria-label="Edit episode"
        >
          <span className="text-xl">✏️</span>
        </button>
        {status === 'published' && (
          <>
            <button
              onClick={() => onShare(id)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              aria-label="Share episode"
            >
              <span className="text-xl">🔗</span>
            </button>
            {hasSpotifyExport && (
              <button
                onClick={() => console.log('Export to Spotify:', id)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                aria-label="Export to Spotify"
                title="Export to Spotify"
              >
                <span className="text-xl">🎧</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Feature Lock Messages */}
      {!hasCustomBranding && thumbnailUrl && (
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <PlanLockMessage 
            feature="customBranding"
            planRequired="business"
            className="scale-75 origin-top-right"
          />
        </div>
      )}
    </div>
  );
};

export default EpisodeCard; 