import { NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';
import { getAuth } from 'firebase-admin/auth';
import { z } from 'zod';
import { updateUserCredits } from '@/lib/creditUtilsServer';

const updateCreditsSchema = z.object({
  amount: z.number()
});

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const auth = getAuth();
    const db = getFirestore();

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const token = authHeader.split('Bearer ')[1];
    console.log("🔐 Received Token:", token);
    
    let userId: string;
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log("✅ Decoded Token:", decodedToken);
      userId = decodedToken.uid;
    } catch (error) {
      console.error("❌ Token Decode Failed:", error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const result = updateCreditsSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: result.error.issues },
        { status: 400 }
      );
    }

    const { amount } = result.data;
    
    try {
      // Validate amount is a valid number
      if (!Number.isFinite(amount)) {
        return NextResponse.json({ 
          error: 'Invalid amount', 
          details: 'Credit amount must be a valid number'
        }, { status: 400 });
      }

      // Update credits using the server-side function
      await updateUserCredits(userId, -amount); // Note: negative because updateUserCredits deducts

      return NextResponse.json({
        success: true,
        message: `Credits ${amount >= 0 ? 'added' : 'deducted'} successfully`
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'User not found') {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (error.message === 'Insufficient credits') {
          return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
        }
      }
      console.error('Error updating credits:', error);
      return NextResponse.json(
        { 
          error: 'Credit update failed',
          details: error instanceof Error ? error.message : 'Failed to update user credits'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 