import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Initialize Firebase Admin if not already initialized
    initializeFirebaseAdmin();
    const db = getFirestore();
    
    const podcastDoc = await db.collection('podcasts').doc(params.id).get();
    
    if (!podcastDoc.exists) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    const data = podcastDoc.data();
    return NextResponse.json({ 
      status: data?.status || 'pending',
      steps: data?.generationSteps || []
    });
  } catch (error) {
    console.error('Error fetching podcast status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 