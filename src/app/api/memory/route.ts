import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { UserMemory } from '@/lib/memoryHelpers';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const db = getFirestore();
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memoryDoc = await db
      .collection('users')
      .doc(userId)
      .collection('memory')
      .doc('current')
      .get();

    if (!memoryDoc.exists) {
      // Return default memory structure if none exists
      return NextResponse.json({
        topics: {},
        preferences: {},
        seriesProgress: {},
        customData: {},
        lastUpdated: new Date(),
        version: 1
      });
    }

    const data = memoryDoc.data() as UserMemory;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to load user memory:', error);
    return NextResponse.json(
      { error: 'Failed to load user memory' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const db = getFirestore();
  try {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memory = await request.json();
    const memoryRef = db
      .collection('users')
      .doc(userId)
      .collection('memory')
      .doc('current');

    await db.runTransaction(async (transaction) => {
      const existingDoc = await transaction.get(memoryRef);
      const existingData = existingDoc.exists ? existingDoc.data() as UserMemory : {};

      const updatedMemory = {
        ...existingData,
        ...memory,
        lastUpdated: new Date(),
        version: (existingData.version || 0) + 1
      };

      transaction.set(memoryRef, updatedMemory, { merge: true });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save user memory:', error);
    return NextResponse.json(
      { error: 'Failed to save user memory' },
      { status: 500 }
    );
  }
} 