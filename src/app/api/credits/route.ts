// TODO: replace stubs with real Firestore/Stripe logic

import { NextResponse } from 'next/server';

/**
 * GET /api/credits
 * Returns dummy credit balance
 */
export async function GET() {
  return NextResponse.json({ 
    success: true,
    credits: 999 
  });
} 