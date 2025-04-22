// TODO: replace stubs with real Firestore/Stripe logic

import { NextResponse } from 'next/server';
import { auth } from '@/lib/firebaseAdmin';

interface ChargeRequest {
  amount: number;
}

/**
 * POST /api/charge-credits
 * Simulates deducting credits from balance
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("❌ Missing or invalid Authorization header");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    console.log("🔐 Received Token:", token);
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      console.log("✅ Decoded Token:", decodedToken);
      const userId = decodedToken.uid;
    } catch (error) {
      console.error("❌ Token Decode Failed:", error);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount }: ChargeRequest = await request.json();

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Return dummy response
    return NextResponse.json({
      success: true,
      credits: 999
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
} 