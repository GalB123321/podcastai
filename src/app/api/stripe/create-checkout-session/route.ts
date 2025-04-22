import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { z } from 'zod';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil'
});

// Price IDs from your Stripe Dashboard
const PRICE_IDS = {
  plans: {
    creator: 'price_creator_monthly',  // Replace with your actual price ID
    business: 'price_business_monthly' // Replace with your actual price ID
  },
  credits: {
    '10': 'price_10_credits',  // Replace with your actual price ID
    '30': 'price_30_credits',  // Replace with your actual price ID
    '50': 'price_50_credits'   // Replace with your actual price ID
  }
} as const;

// Input validation schema
const CheckoutBodySchema = z.object({
  uid: z.string(),
  plan: z.enum(['creator', 'business']).optional(),
  credits: z.enum(['10', '30', '50']).optional(),
}).refine(data => {
  // Ensure only one of plan or credits is provided
  return (data.plan && !data.credits) || (!data.plan && data.credits);
}, {
  message: "Exactly one of 'plan' or 'credits' must be provided"
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedBody = CheckoutBodySchema.parse(body);
    const { uid, plan, credits } = validatedBody;

    // Determine the type and price ID
    const type = plan ? 'plan' : 'credits';
    const priceId = plan 
      ? PRICE_IDS.plans[plan]
      : PRICE_IDS.credits[credits!];
    
    const value = plan || credits || '';

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: plan ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade-success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
      metadata: { uid, type, value },
      payment_method_types: ['card'],
    } as Stripe.Checkout.SessionCreateParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session creation failed:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
} 