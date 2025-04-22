// ✅ Fixing /api/episodes/[id]/status route to fetch podcast step status properly

import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';

export const runtime = 'nodejs';

export async function GET(
  _: Request,
  { params }: { params: { [key: string]: string | string[] } }
) {
  try {
    const podcastId = Array.isArray(params.podcastId) ? params.podcastId[0] : params.podcastId;
    const db = getFirestore(getApp());
    const doc = await db.collection('podcasts').doc(podcastId).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    const data = doc.data();
    return NextResponse.json({
      status: data?.status || 'pending',
      steps: data?.steps || []
    });
  } catch (error) {
    console.error('Error fetching podcast status:', error);
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 });
  }
}