'use client';

import { useRouter } from 'next/navigation';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useEffect, useState } from 'react';
import { env } from '@/env';

interface PipelineState {
  status: 'pending' | 'scriptGenerated' | 'audioGenerated' | 'ready' | 'error';
  script?: any[];
  audio?: { lineId: string; url: string }[];
  publicAudioURL?: string;
  duration?: number;
  error?: string;
  scriptGeneratedAt?: Date;
  audioGeneratedAt?: Date;
  finalizedAt?: Date;
}

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'AAA') {
      onSuccess();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-3xl font-display text-center mb-8 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
          🔒 Pipeline Access
        </h1>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full px-4 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Enter Pipeline
        </button>
      </form>
    </div>
  );
}

function ProgressTimeline({ state }: { state: PipelineState }) {
  const steps = [
    {
      id: 'script',
      title: '📝 Script Generation',
      done: state.status !== 'pending',
      timestamp: state.scriptGeneratedAt,
      error: state.status === 'error' && !state.script
    },
    {
      id: 'audio',
      title: '🎙️ Voice Generation',
      done: state.status === 'audioGenerated' || state.status === 'ready',
      timestamp: state.audioGeneratedAt,
      error: state.status === 'error' && !state.audio
    },
    {
      id: 'final',
      title: '✨ Final Processing',
      done: state.status === 'ready',
      timestamp: state.finalizedAt,
      error: state.status === 'error' && !state.publicAudioURL
    }
  ];

  return (
    <div className="relative">
      <div className="absolute left-4 inset-y-0 w-0.5 bg-gray-200"></div>
      <div className="space-y-8 relative">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center
              ${step.error ? 'bg-red-100 text-red-500' :
                step.done ? 'bg-green-100 text-green-500' : 'bg-gray-100 text-gray-500'}
            `}>
              {step.error ? '❌' : step.done ? '✓' : '⋯'}
            </div>
            <div className="ml-4 flex-1">
              <h3 className="font-medium">{step.title}</h3>
              {step.timestamp && (
                <p className="text-sm text-gray-500">
                  {new Date(step.timestamp).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LogPanel({ state }: { state: PipelineState }) {
  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-lg font-medium mb-4">📊 Status Details</h2>
      <pre className="whitespace-pre-wrap text-sm">
        {JSON.stringify(state, null, 2)}
      </pre>
    </div>
  );
}

export default function LivePipeline({ params }: { params: { id: string } }) {
  const [authorized, setAuthorized] = useState(false);
  const [state, setState] = useState<PipelineState>({
    status: 'pending'
  });

  useEffect(() => {
    if (!authorized) return;

    const unsubscribe = onSnapshot(
      doc(db, 'episodes', params.id),
      (snapshot) => {
        if (!snapshot.exists()) {
          setState(prev => ({
            ...prev,
            status: 'error',
            error: 'Episode not found'
          }));
          return;
        }

        const data = snapshot.data();
        setState({
          status: data.status || 'pending',
          script: data.script,
          audio: data.audio,
          publicAudioURL: data.publicAudioURL,
          duration: data.duration,
          error: data.error,
          scriptGeneratedAt: data.scriptGeneratedAt?.toDate(),
          audioGeneratedAt: data.audioGeneratedAt?.toDate(),
          finalizedAt: data.finalizedAt?.toDate()
        });
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setState(prev => ({
          ...prev,
          status: 'error',
          error: 'Failed to subscribe to updates'
        }));
      }
    );

    return () => unsubscribe();
  }, [params.id, authorized]);

  if (!authorized) {
    return <PasswordGate onSuccess={() => setAuthorized(true)} />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-display mb-8 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text animate-pulse">
          👀 Live Generation for {params.id}
        </h1>
        <ProgressTimeline state={state} />
        <LogPanel state={state} />
      </div>
    </div>
  );
} 