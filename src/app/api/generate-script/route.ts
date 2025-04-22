import { NextResponse } from 'next/server';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

interface PodcastStep {
  type: 'research' | 'script' | 'voice' | 'finalize';
  status: 'pending' | 'processing' | 'done' | 'error';
  startedAt?: Date | null;
  completedAt?: Date | null;
  error?: string | null;
  progress?: number;
}

interface PodcastDocument {
  steps: PodcastStep[];
  status: string;
  updatedAt: Date;
  // Add other fields as needed
}

export async function POST(req: Request) {
  try {
    initializeFirebaseAdmin();
    const db = getFirestore(getApp());
    const { episodeId } = await req.json();

    if (!episodeId) {
      return NextResponse.json({ error: 'Missing episodeId' }, { status: 400 });
    }

    const docRef = db.collection('podcasts').doc(episodeId);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    const data = doc.data() as PodcastDocument | undefined;
    const steps = data?.steps ?? [];

    const updatedSteps = steps.map((step: PodcastStep) => 
      step.type === 'research' 
        ? { 
            ...step, 
            status: 'done' as const, 
            completedAt: Timestamp.now(),
            error: null,
            progress: 100
          } 
        : step
    );

    await docRef.update({
      steps: updatedSteps,
      status: 'script',
      updatedAt: Timestamp.now()
    });

    return NextResponse.json({ 
      success: true,
      steps: updatedSteps,
      status: 'script'
    });
  } catch (err) {
    console.error('[generate-script] Error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
} 