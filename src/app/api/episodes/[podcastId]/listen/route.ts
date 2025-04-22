import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: { [key: string]: string | string[] } }
) {
  try {
    const db = getFirestore(getApp());
    const podcastId = Array.isArray(params.podcastId) ? params.podcastId[0] : params.podcastId;

    await db.collection('episodes').doc(podcastId).update({
      listens: FieldValue.increment(1)
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error incrementing listen count:', error);
    return NextResponse.json({ error: 'Failed to record listen' }, { status: 500 });
  }
}
