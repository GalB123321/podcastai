'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';
import { db } from '@/lib/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Progress } from '@/components/ui/progress';
import { formatDistanceToNow } from 'date-fns';

interface StepStatus {
  status: 'pending' | 'processing' | 'completed' | 'error';
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  error?: string;
  progress?: number;
}

interface EpisodeSteps {
  research: StepStatus;
  script: StepStatus;
  voice: StepStatus;
  finalize: StepStatus;
}

interface Episode {
  steps: EpisodeSteps;
  finalized?: boolean;
  finalizedAt?: Timestamp;
  publicAudioURL?: string;
}

export function ProcessingStatus({ episodeId }: { episodeId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'episodes', episodeId),
      (doc) => {
        if (!doc.exists()) {
          setError('Episode not found');
          toast({
            title: 'Error',
            description: 'Episode not found',
            variant: 'error'
          });
          router.push('/dashboard');
          return;
        }

        const data = doc.data() as Episode;
        setEpisode(data);

        // Check if episode is finalized
        if (data.finalized && data.publicAudioURL) {
          toast({
            title: 'Success',
            description: 'Your podcast is ready!',
            variant: 'success'
          });
          router.push(`/episodes/${episodeId}`);
        }
      },
      (error) => {
        console.error('Error loading episode:', error);
        setError('Failed to load episode status');
        toast({
          title: 'Error',
          description: 'Failed to load episode status',
          variant: 'error'
        });
      }
    );

    return () => {
      unsubscribe();
      toast({
        title: 'Error',
        description: 'Failed to unsubscribe from episode updates',
        variant: 'error'
      });
    };
  }, [episodeId, router, toast]);

  const getStepIcon = (type: keyof EpisodeSteps) => {
    switch (type) {
      case 'research':
        return '🔍';
      case 'script':
        return '📝';
      case 'voice':
        return '🎙️';
      case 'finalize':
        return '✨';
    }
  };

  const getStepTitle = (type: keyof EpisodeSteps) => {
    switch (type) {
      case 'research':
        return 'Researching Topic';
      case 'script':
        return 'Writing Script';
      case 'voice':
        return 'Generating Voice';
      case 'finalize':
        return 'Finalizing Podcast';
    }
  };

  const getStepDescription = (type: keyof EpisodeSteps, status: StepStatus) => {
    if (status.error) {
      return `Error: ${status.error}`;
    }

    switch (type) {
      case 'research':
        return 'Gathering relevant information and sources...';
      case 'script':
        return 'Crafting engaging content and structure...';
      case 'voice':
        return 'Converting text to natural speech...';
      case 'finalize':
        return 'Putting everything together...';
    }
  };

  const getStatusColor = (status: StepStatus['status']) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-500 bg-emerald-500/20';
      case 'processing':
        return 'text-blue-500 bg-blue-500/20';
      case 'error':
        return 'text-red-500 bg-red-500/20';
      default:
        return 'text-gray-400 bg-gray-100';
    }
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!episode) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg p-6">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(episode.steps).map(([type, status]) => (
        <div 
          key={type}
          className={`bg-card rounded-lg p-6 ${
            status.status === 'processing' ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">{getStepIcon(type as keyof EpisodeSteps)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-lg">{getStepTitle(type as keyof EpisodeSteps)}</h3>
                <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(status.status)}`}>
                  {status.status}
                </div>
              </div>
              
              <p className="text-muted-foreground">
                {getStepDescription(type as keyof EpisodeSteps, status)}
              </p>

              {status.startedAt && (
                <p className="text-sm text-muted-foreground mt-1">
                  Started {formatDistanceToNow(status.startedAt.toDate(), { addSuffix: true })}
                </p>
              )}

              {status.status === 'processing' && typeof status.progress === 'number' && (
                <div className="mt-3">
                  <Progress value={status.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {Math.round(status.progress)}% complete
                  </p>
                </div>
              )}

              {status.status === 'completed' && status.completedAt && (
                <p className="text-sm text-emerald-600 mt-1">
                  Completed {formatDistanceToNow(status.completedAt.toDate(), { addSuffix: true })}
                </p>
              )}

              {status.status === 'error' && status.error && (
                <p className="text-sm text-red-600 mt-1">
                  {status.error}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 