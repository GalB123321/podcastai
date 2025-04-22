import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';
import { z } from 'zod';
import { calculateCredits, updateUserCredits } from '@/lib/creditUtilsServer';
import { env } from '@/env';

// Specify Node.js runtime
export const runtime = 'nodejs';

const startGenerationSchema = z.object({
  name: z.string().optional(),
  topic: z.string().min(1, 'Topic is required'),
  targetAudience: z.array(z.string()).min(1, 'At least one target audience is required'),
  tone: z.string().min(1, 'Tone is required'),
  episodeLength: z.number().int().min(1).max(12),
  episodeCount: z.number().int().min(1).max(10),
  visibility: z.enum(['public', 'private', 'unlisted']),
  // Optional fields
  promoText: z.string().optional(),
  customInstructions: z.string().optional(),
  includePromo: z.boolean().optional().default(false),
  isCourse: z.boolean().optional().default(false),
  courseTitle: z.string().optional().nullable()
});

const WEBHOOK_URL = process.env.GENERATION_WEBHOOK_URL ?? 'http://localhost:3004';

export async function POST(request: Request) {
  try {
    console.log('[start-generation] Starting new podcast generation');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const auth = getAuth();
    const db = getFirestore();
    console.log('[start-generation] 🔧 Firebase Admin initialized');

    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    console.log('[start-generation] 📡 Auth header received:', authHeader?.substring(0, 20) + '...');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[start-generation] ❌ Missing or invalid authorization header');
      return NextResponse.json({ 
        error: 'Missing token',
        details: 'Authorization header missing or malformed',
        code: 'AUTH_HEADER_MISSING'
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      console.error('[start-generation] ❌ Token not found in header');
      return NextResponse.json({ 
        error: 'Token not found',
        details: 'Token was not extracted from header',
        code: 'TOKEN_NOT_FOUND'
      }, { status: 401 });
    }
    
    // Verify Firebase token
    let userId: string;
    try {
      console.log('[start-generation] 🔑 Verifying token...');
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('[start-generation] ✅ Token verified for user:', userId);
    } catch (authError) {
      console.error('[start-generation] ❌ Token verification failed:', authError);
      const isExpired = (authError as Error)?.message?.includes('expired');
      return NextResponse.json({ 
        error: isExpired ? 'Token expired' : 'Invalid token',
        details: isExpired ? 'Your session has expired' : 'Token verification failed',
        code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      }, { status: 401 });
    }

    // Parse and validate request data
    let data;
    try {
      const json = await request.json();
      data = startGenerationSchema.parse(json);
      console.log('[start-generation] ✅ Request data validated:', { 
        topic: data.topic,
        episodeCount: data.episodeCount,
        episodeLength: data.episodeLength
      });
    } catch (parseError) {
      console.error('[start-generation] ❌ Request validation failed:', parseError);
      if (parseError instanceof z.ZodError) {
        return NextResponse.json({ 
          error: 'Failed to start generation',
          details: 'Invalid request data',
          validation: parseError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          })),
          code: 'VALIDATION_ERROR'
        }, { status: 422 });
      }
      return NextResponse.json({ 
        error: 'Failed to start generation',
        details: 'Invalid request format',
        code: 'INVALID_REQUEST'
      }, { status: 400 });
    }

    // Check user exists and get data
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      console.error('[start-generation] ❌ User document not found:', userId);
      return NextResponse.json({ 
        error: 'Failed to start generation',
        details: 'User not found in Firestore',
        code: 'USER_NOT_FOUND'
      }, { status: 404 });
    }

    const userData = userDoc.data();
    const currentCredits = userData?.credits ?? 0;

    // Calculate required credits
    const lengthTier = data.episodeLength <= 3 ? 'mini' 
      : data.episodeLength <= 7 ? 'standard' 
      : 'deep';

    // Map user plan to valid plan tier
    const userPlan = userData?.plan;
    const validPlan = ['personal', 'creator', 'business', 'enterprise'].includes(userPlan) 
      ? userPlan 
      : 'personal';

    const requiredCredits = calculateCredits({
      lengthTier,
      episodes: data.episodeCount,
      wordCountForPromotion: data.promoText?.split(/\s+/).length || 0,
      scheduledEpisodes: 0,
      plan: validPlan
    });

    console.log('[start-generation] 💰 Credit calculation:', { 
      lengthTier, 
      requiredCredits,
      userPlan,
      validPlan
    });

    // Validate credit amount
    if (requiredCredits <= 0) {
      console.error('[start-generation] ❌ Invalid credit amount:', requiredCredits);
      return NextResponse.json({ 
        error: 'Invalid credit amount',
        details: 'Credit calculation resulted in invalid amount',
        code: 'INVALID_CREDITS'
      }, { status: 400 });
    }

    console.log('[start-generation] 🎟️ Credit check:', { 
      currentCredits, 
      requiredCredits,
      sufficient: currentCredits >= requiredCredits 
    });

    if (currentCredits < requiredCredits) {
      console.error('[start-generation] ❌ Insufficient credits:', { 
        required: requiredCredits, 
        current: currentCredits 
      });
      return NextResponse.json({ 
        error: 'Failed to start generation',
        details: 'Insufficient credits',
        required: requiredCredits,
        current: currentCredits,
        code: 'INSUFFICIENT_CREDITS'
      }, { status: 402 });
    }

    // Deduct credits
    try {
      console.log('[start-generation] 🎟️ Deducting credits:', { 
        userId, 
        amount: requiredCredits 
      });
      await updateUserCredits(userId, requiredCredits);
      console.log('[start-generation] ✅ Credits deducted successfully');
    } catch (error) {
      console.error('[start-generation] ❌ Failed to update credits:', error);
      return NextResponse.json({ 
        error: 'Credit update failed',
        details: error instanceof Error ? error.message : 'Failed to update user credits',
        code: 'CREDIT_UPDATE_ERROR'
      }, { status: 500 });
    }

    // Create podcast document
    console.log('[start-generation] 📝 Creating podcast document');
    const podcastRef = db.collection('podcasts').doc();
    const steps = [
      { 
        type: 'research',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0
      },
      { 
        type: 'script',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0
      },
      { 
        type: 'voice',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0
      },
      { 
        type: 'finalize',
        status: 'pending',
        startedAt: null,
        completedAt: null,
        error: null,
        progress: 0
      }
    ];

    await podcastRef.set({
      ...data,
      userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      steps,
      creditsUsed: requiredCredits,
      plan: userData?.plan || 'personal'
    });

    console.log('[start-generation] ✅ Podcast document created:', { 
      podcastId: podcastRef.id,
      steps: steps.map(s => `${s.type}: ${s.status}`)
    });

    // Start the generation process
    try {
      console.log('[start-generation] 🔔 Triggering generation webhook:', WEBHOOK_URL);
      const webhookRes = await fetch(`${WEBHOOK_URL}/api/generate-script`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          episodeId: podcastRef.id 
        }),
      });

      if (!webhookRes.ok) {
        const errorText = await webhookRes.text();
        console.error("[start-generation] ❌ Webhook failed:", {
          status: webhookRes.status,
          statusText: webhookRes.statusText,
          response: errorText,
          url: `${WEBHOOK_URL}/api/generate-script`
        });
      } else {
        console.log("[start-generation] ✅ Webhook triggered successfully");
      }
    } catch (err) {
      console.error("[start-generation] ⚠️ Webhook request failed:", {
        error: err instanceof Error ? err.message : 'Unknown error',
        url: `${WEBHOOK_URL}/api/generate-script`
      });
      // Log but don't fail the request
    }

    console.log('[start-generation] ✅ Generation started successfully:', { 
      podcastId: podcastRef.id 
    });
    return NextResponse.json({ id: podcastRef.id });
  } catch (error) {
    console.error('[start-generation] ❌ Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Failed to start generation',
      details: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_ERROR'
    }, { status: 500 });
  }
} 