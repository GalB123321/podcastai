'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import EpisodeCard from '@/components/dashboard/EpisodeCard';
import { formatDate } from '@/utils/formatDate';
import { useToast } from '@/hooks/useToast';
import { auth } from '@/lib/firebaseClient';

interface Episode {
  id: string;
  title: string;
  createdAt: {
    toDate: () => Date;
  };
  length: number;
  status: string;
}

export default function EpisodesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in');
      return;
    }

    if (user) {
      const loadEpisodes = async () => {
        try {
          const token = await auth.currentUser?.getIdToken();
          if (!token) {
            throw new Error('Not authenticated');
          }
          
          const response = await fetch('/api/episodes', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.details || 'Failed to load episodes');
          }

          const data = await response.json();
          setEpisodes(data.episodes || []);
        } catch (error) {
          console.error('Failed to load episodes:', error);
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to load episodes',
            variant: 'error'
          });
        } finally {
          setIsLoadingEpisodes(false);
        }
      };

      loadEpisodes();
    }
  }, [user, isLoading, router, toast]);

  const handlePlay = (id: string) => {
    router.push(`/play/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/edit/${id}`);
  };

  const handleShare = (id: string) => {
    // TODO: Implement sharing functionality
    console.log('Share episode:', id);
  };

  if (isLoading || isLoadingEpisodes) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">🎙️ Your Episodes</h1>
          <button
            onClick={() => router.push('/create')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
          >
            Create New Episode
          </button>
        </div>

        <div className="grid gap-4">
          {episodes.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-2">No Episodes Yet</h2>
              <p className="text-muted-foreground mb-4">
                Start creating your first podcast episode!
              </p>
              <button
                onClick={() => router.push('/create')}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition"
              >
                Get Started
              </button>
            </div>
          ) : (
            episodes.map(episode => (
              <EpisodeCard
                key={episode.id}
                id={episode.id}
                title={episode.title}
                date={formatDate(episode.createdAt.toDate())}
                duration={episode.length}
                status={episode.status as 'draft' | 'published' | 'processing'}
                onPlay={handlePlay}
                onEdit={handleEdit}
                onShare={handleShare}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
} 