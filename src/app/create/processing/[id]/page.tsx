'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from "@/components/ui/skeleton";

type ProcessingStep =
  | "research: pending"
  | "research: done"
  | "script: pending"
  | "script: done"
  | "voice: pending"
  | "voice: done"
  | "finalize: pending"
  | "finalize: done";

interface PodcastStatus {
  steps: ProcessingStep[];
}

async function getPodcastStatus(id: string): Promise<PodcastStatus> {
  const res = await fetch(`/api/episodes/${id}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch podcast status');
  }

  const data = await res.json();
  return data;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded" />
      ))}
    </div>
  );
}

function StepIcon({ status }: { status: string }) {
  if (status === 'done') {
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function StepList({ steps }: { steps: ProcessingStep[] }) {
  return (
    <div className="space-y-4">
      {Array.isArray(steps) && steps.length > 0 ? (
        steps.map((step, index) => {
          if (typeof step !== 'string' || !step.includes(':')) return null;

          const [type, status] = step.split(': ') as [string, 'pending' | 'done'];
          if (!type || !['pending', 'done'].includes(status)) return null;

          return (
            <div key={index} className="bg-muted p-4 rounded flex items-center space-x-3">
              <StepIcon status={status} />
              <div>
                <h3 className="font-medium capitalize">{type}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {status === 'done' ? 'Completed' : 'In Progress'}
                </p>
              </div>
            </div>
          );
        }).filter(Boolean)
      ) : (
        <p className="text-muted-foreground text-sm text-center">No steps available.</p>
      )}
    </div>
  );
}

export default function ProcessingPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<PodcastStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get the ID safely
  const id = params?.id as string | undefined;

  // Handle authentication
  useEffect(() => {
    if (!isAuthLoading && !user) {
      router.push('/sign-in');
    }
  }, [isAuthLoading, user, router]);

  // Fetch status
  useEffect(() => {
    if (!id || !user) return;

    async function fetchStatus() {
      try {
        setIsLoading(true);
        setError(null);
        if (!id) {
          throw new Error('Episode ID is required');
        }
        const data = await getPodcastStatus(id);
        if (!data) {
          throw new Error('Episode not found');
        }
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load episode status');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatus();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [id, user]); // Avoid optional chaining in deps

  if (isAuthLoading || isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="bg-destructive/10 text-destructive p-4 rounded text-center">
        <p>{error}</p>
      </div>
    );
  }

  if (!status?.steps?.length) {
    return (
      <div className="bg-muted p-4 rounded text-center">
        <p>No processing steps found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <StepList steps={status.steps} />
      <p className="text-center text-sm text-muted-foreground">
        You can leave this page and come back later. We'll send you an email when your podcast is ready.
      </p>
    </div>
  );
} 