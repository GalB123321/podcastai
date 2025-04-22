import { NextResponse } from 'next/server';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';

export const runtime = 'nodejs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const db = getFirestore(getApp());
    
    await db.collection('episodes').doc(params.id).update({
      listens: FieldValue.increment(1)
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error incrementing listen count:', error);
    return NextResponse.json(
      { error: 'Failed to record listen' },
      { status: 500 }
    );
  }
} 