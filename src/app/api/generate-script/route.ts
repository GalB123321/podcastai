import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

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

    const data = doc.data();
    const steps = data?.steps ?? [];

    const updatedSteps = steps.map(step => 
      step.type === 'research' ? { ...step, status: 'done', completedAt: new Date() } : step
    );

    await docRef.update({
      steps: updatedSteps,
      status: 'script',
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[generate-script] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 