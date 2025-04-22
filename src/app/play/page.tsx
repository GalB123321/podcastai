'use client';

import * as React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCredits } from '@/hooks/useCredits';
import { useMemory } from '@/hooks/useMemory';
import { useVoicePlayer } from '@/hooks/useVoicePlayer';
import { AudioPlayerMinimal } from '@/components/audio/AudioPlayerMinimal';
import PlaylistCarousel from '@/components/dashboard/PlaylistCarousel';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

// Mock data for similar episodes
const SIMILAR_EPISODES = [
  {
    id: '1',
    title: 'The Future of AI',
    thumbnailUrl: '/thumbnails/ai-future.jpg',
    duration: 1800,
    status: 'published' as const,
  },
  {
    id: '2',
    title: 'Web Development Trends',
    thumbnailUrl: '/thumbnails/webdev.jpg',
    duration: 2400,
    status: 'published' as const,
  },
];

// Mock data for features
const FEATURES = [
  {
    title: 'Auto Playback',
    description: 'Seamlessly play through your generated episodes with smart transitions.',
    icon: '🎧'
  },
  {
    title: 'Voice Clarity',
    description: 'Crystal clear audio quality with advanced AI voice processing.',
    icon: '🎙️'
  },
  {
    title: 'Smart Pauses',
    description: 'Intelligent pause detection for natural speech patterns.',
    icon: '⏯️'
  },
  {
    title: 'Background Music',
    description: 'Optional ambient tracks to enhance your content.',
    icon: '🎵'
  }
];

export default function PlayPage() {
  const { user, loading: authLoading } = useAuth();
  const [tagline, setTagline] = React.useState('Listen to your AI-powered story.');

  // Rotating taglines
  React.useEffect(() => {
    const lines = [
      'Listen to your AI-powered story.',
      'Experience your content in high fidelity.',
      'Bring your words to life.'
    ];
    let i = 0;
    const iv = setInterval(() => setTagline(lines[i = (i+1)%lines.length]), 3000);
    return () => clearInterval(iv);
  }, []);

  // Only initialize hooks if user is authenticated
  const memory = user ? useMemory() : null;
  const credits = user ? useCredits() : null;

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xl text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
          <h1 className="text-[4rem] md:text-[6rem] font-display text-foreground mb-4">
            Auto Playback
          </h1>
          <h2 className="text-2xl md:text-3xl font-display text-muted-foreground mb-8">
            {tagline}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Please sign in to access your episodes and playlists.
          </p>
          <Link href="/login">
            <PrimaryButton className="px-8 py-3 text-lg">
              Sign In
            </PrimaryButton>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-[4rem] md:text-[6rem] font-display text-foreground mb-4">
          Auto Playback
        </h1>
        <h2 className="text-2xl md:text-3xl font-display text-muted-foreground mb-8">
          {tagline}
        </h2>
        <div className="flex gap-4 mb-16">
          <PrimaryButton onClick={() => {}} className="px-8 py-3 text-lg">
            Play All Episodes
          </PrimaryButton>
          <PrimaryButton className="px-8 py-3 text-lg bg-secondary hover:bg-secondary/90">
            Customize Playback
          </PrimaryButton>
        </div>
        <AudioPlayerMinimal 
          src="https://example.com/demo.mp3"
          className="max-w-2xl w-full"
        />
      </div>

      {/* Content Sections */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {FEATURES.map(feature => (
            <div key={feature.title} className="p-6 bg-card rounded-xl backdrop-blur-sm">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Similar Episodes */}
        <div className="mb-16">
          <h3 className="font-display text-2xl mb-4">Similar Episodes</h3>
          <PlaylistCarousel
            episodes={SIMILAR_EPISODES}
            onSelect={(id: string) => console.log('Selected episode:', id)}
          />
        </div>

        {/* Stats Bar */}
        <div className="flex justify-around bg-card py-8 rounded-xl">
          {[
            { label: 'Hours Played', value: 5000 },
            { label: 'Active Listeners', value: 2000 },
            { label: 'Episodes Created', value: 1000 },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold">{stat.value}+</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Sidebar */}
      <aside className="hidden lg:block fixed right-0 top-16 w-80 p-4 space-y-6">
        <div className="p-4 bg-card rounded-lg">
          <h4 className="font-semibold mb-2">Up Next</h4>
          <ul className="space-y-2">
            {SIMILAR_EPISODES.map(episode => (
              <li key={episode.id} className="text-sm text-muted-foreground">
                {episode.title}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Footer CTA */}
      <div className="bg-card py-12 text-center">
        <h3 className="font-display text-3xl mb-4">
          Ready to create your own episode?
        </h3>
        <Link href="/create">
          <PrimaryButton className="px-12 py-4 hover:shadow-lg transition-shadow">
            Start Creating
          </PrimaryButton>
        </Link>
      </div>
    </div>
  );
} 