// TODO: replace stubs with real Firestore/Stripe logic

import { NextResponse } from 'next/server';

interface TopupRequest {
  amount: number;
}

/**
 * POST /api/topup-credits
 * Simulates adding credits to balance
 */
export async function POST(request: Request) {
  try {
    const { amount }: TopupRequest = await request.json();

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