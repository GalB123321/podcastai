'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PasswordProtection } from '@/components/internal/PasswordProtection';
import { StepCard, type StepStatus } from '@/components/internal/StepCard';
import { db } from '@/lib/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';
import { motion } from 'framer-motion';

interface PodcastProgress {
  research?: {
    facts: string[];
    summary: string;
  };
  script?: {
    content: string;
    segments: string[];
  };
  audioUrls?: string[];
  error?: string;
}

interface PodcastDocument {
  id: string;
  status: 'queued' | 'researching' | 'scriptGenerating' | 'voiceGenerating' | 'finalizing' | 'complete';
  progress: PodcastProgress;
  title: string;
  tone: string;
  episodeLength: number;
  episodeCount: number;
  isGenZ?: boolean;
}

const statusToStep: Record<PodcastDocument['status'], StepStatus> = {
  queued: 'queued',
  researching: 'in-progress',
  scriptGenerating: 'in-progress',
  voiceGenerating: 'in-progress',
  finalizing: 'in-progress',
  complete: 'complete'
};

export default function LivePage() {
  const searchParams = useSearchParams();
  const [podcast, setPodcast] = useState<PodcastDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const podcastId = searchParams.get('id');
    if (!podcastId) {
      setError('No podcast ID provided');
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'podcasts', podcastId),
      (doc) => {
        if (!doc.exists()) {
          setError('Podcast not found');
          return;
        }

        setPodcast({
          id: doc.id,
          ...doc.data() as Omit<PodcastDocument, 'id'>
        });
      },
      (err) => {
        console.error('Error fetching podcast:', err);
        setError('Failed to fetch podcast data');
      }
    );

    return () => unsubscribe();
  }, [searchParams]);

  const getStepStatus = (step: string): StepStatus => {
    if (!podcast) return 'queued';

    const statusOrder = ['queued', 'researching', 'scriptGenerating', 'voiceGenerating', 'finalizing', 'complete'];
    const currentIndex = statusOrder.indexOf(podcast.status);
    const stepIndex = statusOrder.indexOf(step);

    if (podcast.progress.error) return 'error';
    if (currentIndex > stepIndex) return 'complete';
    if (currentIndex === stepIndex) return 'in-progress';
    return 'queued';
  };

  return (
    <PasswordProtection>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <div className="max-w-3xl mx-auto space-y-8 py-12 px-4 sm:px-6 lg:px-8">
          {error ? (
            <div className="text-center p-8 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">{error}</p>
            </div>
          ) : podcast ? (
            <>
              <div className="text-center">
                <motion.h1
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl font-bold text-emerald-500"
                >
                  {podcast.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-2 text-gray-400"
                >
                  {podcast.episodeCount} episode{podcast.episodeCount !== 1 ? 's' : ''} • {podcast.episodeLength} minutes each • {podcast.tone} tone
                </motion.p>
              </div>

              <div className="space-y-4">
                <StepCard
                  title="Research"
                  emoji="🧠"
                  status={getStepStatus('researching')}
                  error={podcast.status === 'researching' ? podcast.progress.error : undefined}
                  isGenZ={podcast.isGenZ}
                />
                <StepCard
                  title="Script Generation"
                  emoji="📝"
                  status={getStepStatus('scriptGenerating')}
                  error={podcast.status === 'scriptGenerating' ? podcast.progress.error : undefined}
                  isGenZ={podcast.isGenZ}
                />
                <StepCard
                  title="Voice Synthesis"
                  emoji="🎙️"
                  status={getStepStatus('voiceGenerating')}
                  error={podcast.status === 'voiceGenerating' ? podcast.progress.error : undefined}
                  isGenZ={podcast.isGenZ}
                />
                <StepCard
                  title="Finalizing"
                  emoji="🎧"
                  status={getStepStatus('finalizing')}
                  error={podcast.status === 'finalizing' ? podcast.progress.error : undefined}
                  isGenZ={podcast.isGenZ}
                />
              </div>

              {podcast.status === 'complete' && podcast.progress.audioUrls && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-lg"
                >
                  <h2 className="text-xl font-semibold text-emerald-500 mb-4">Final Result</h2>
                  <div className="space-y-4">
                    {podcast.progress.audioUrls.map((url, index) => (
                      <div key={url} className="space-y-2">
                        <p className="text-sm text-gray-400">Episode {index + 1}</p>
                        <audio
                          src={url}
                          controls
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                  <a
                    href={`/dashboard?id=${podcast.id}`}
                    className="mt-6 inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md hover:bg-emerald-500/20 transition-colors"
                  >
                    View in Dashboard
                  </a>
                </motion.div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
            </div>
          )}
        </div>
      </div>
    </PasswordProtection>
  );
} 