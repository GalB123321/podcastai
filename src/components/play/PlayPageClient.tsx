'use client';

import { useEpisodeAnalytics } from '@/hooks/useEpisodeAnalytics';
import { PublishModal } from '@/components/play/PublishModal';
import { formatDate } from '@/utils/formatDate';
import { useState, useEffect } from 'react';
import type { Episode } from '@/types/episode';

interface PlayPageClientProps {
  episode: Episode;
}

export function PlayPageClient({ episode }: PlayPageClientProps) {
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const { trackPlay } = useEpisodeAnalytics();

  useEffect(() => {
    if (episode?.id) {
      trackPlay(episode.id);
    }
  }, [episode?.id, trackPlay]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{episode.title}</h1>
      <div className="text-gray-600 mb-8">
        Created on {formatDate(episode.createdAt)}
      </div>
      
      {/* Audio Player */}
      <div className="mb-8">
        <audio controls className="w-full">
          <source src={episode.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>

      {/* Episode Details */}
      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">Episode Details</h2>
        <p>{episode.description}</p>
      </div>

      {/* Publish Button */}
      <button
        onClick={() => setIsPublishModalOpen(true)}
        className="mt-8 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Publish Episode
      </button>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        episode={episode}
      />
    </div>
  );
} 