'use client';

import React from 'react';
import Link from 'next/link';

function DebugEnv() {
  if (process.env.NODE_ENV !== 'development') return null;

  const envVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ];

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white rounded-lg text-sm">
      <h3 className="font-bold mb-2">Environment Variables Debug:</h3>
      {envVars.map(key => (
        <div key={key}>
          {key}: {process.env[key] ? '✅' : '❌'}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      {/* Hero Section */}
      <h1 className="text-[4rem] md:text-[6rem] font-display text-textSecondary mb-4">
        PodcastAI
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-display text-textSecondary mb-8">
        Your Story, AI Enhanced.
      </h2>

      {/* CTA Buttons */}
      <div className="flex gap-4 mb-16">
        <Link href="/create" className="btn-accent text-lg px-8 py-3">
          Start Creating
        </Link>
        <Link href="/demo" className="btn-secondary text-lg px-8 py-3 border-2">
          View Demo
        </Link>
      </div>

      {/* Audio Player */}
      <div className="w-full max-w-xl bg-surface/50 backdrop-blur-sm rounded-xl p-4">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-textSecondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          
          <div className="flex-1">
            <div className="text-textSecondary text-sm mb-1">00:00 / 00:00</div>
            <div className="h-1 bg-muted rounded-full">
              <div className="h-full w-0 bg-accent rounded-full"></div>
            </div>
          </div>

          <div className="w-24">
            <input
              type="range"
              min="0"
              max="100"
              defaultValue="100"
              className="w-full accent-accent"
            />
          </div>
        </div>
      </div>
      {process.env.NODE_ENV === 'development' && <DebugEnv />}
    </div>
  );
}
