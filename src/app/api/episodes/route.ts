import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

export async function GET(request: Request) {
  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const auth = getAuth();
    const db = getFirestore();

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing token',
        details: 'Authorization header missing or malformed',
        code: 'AUTH_HEADER_MISSING'
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json({ 
        error: 'Token not found',
        details: 'Token was not extracted from header',
        code: 'TOKEN_NOT_FOUND'
      }, { status: 401 });
    }

    // Verify Firebase token
    let userId: string;
    try {
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
    } catch (authError) {
      console.error('Token verification failed:', authError);
      const isExpired = (authError as Error)?.message?.includes('expired');
      return NextResponse.json({ 
        error: isExpired ? 'Token expired' : 'Invalid token',
        details: isExpired ? 'Your session has expired' : 'Token verification failed',
        code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      }, { status: 401 });
    }

    // Fetch episodes from Firestore
    const episodesRef = db.collection('episodes');
    const query = episodesRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    const episodes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ episodes });
  } catch (error) {
    console.error('Failed to fetch episodes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch episodes',
      details: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: 'FETCH_ERROR'
    }, { status: 500 });
  }
} 