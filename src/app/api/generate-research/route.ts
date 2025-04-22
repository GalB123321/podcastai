import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { generateResearchPrompt, fetchFromPerplexity } from '@/lib/researchEngine';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';
import { z } from 'zod';

// Validation schema for request body
const requestSchema = z.object({
  episodeId: z.string().min(1, 'Episode ID is required')
});

export const runtime = 'nodejs';

/**
 * POST /api/generate-research
 * Generates research for a podcast episode using Perplexity AI
 */
export async function POST(request: Request) {
  try {
    console.log('[generate-research] Starting research generation');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const auth = getAuth();
    const db = getFirestore();
    console.log('[generate-research] 🔧 Firebase Admin initialized');

    // Extract and verify Firebase token
    const authHeader = request.headers.get('Authorization');
    console.log('[generate-research] 📡 Auth header received:', authHeader?.substring(0, 20) + '...');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[generate-research] ❌ Missing or invalid authorization header');
      return NextResponse.json({ 
        error: 'Missing token',
        details: 'Authorization header missing or malformed',
        code: 'AUTH_HEADER_MISSING'
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      console.error('[generate-research] ❌ Token not found in header');
      return NextResponse.json({ 
        error: 'Token not found',
        details: 'Token was not extracted from header',
        code: 'TOKEN_NOT_FOUND'
      }, { status: 401 });
    }

    // Verify Firebase token
    let userId: string;
    try {
      console.log('[generate-research] 🔑 Verifying token...');
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('[generate-research] ✅ Token verified for user:', userId);
    } catch (authError) {
      console.error('[generate-research] ❌ Token verification failed:', authError);
      const isExpired = (authError as Error)?.message?.includes('expired');
      return NextResponse.json({ 
        error: isExpired ? 'Token expired' : 'Invalid token',
        details: isExpired ? 'Your session has expired' : 'Token verification failed',
        code: isExpired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
      }, { status: 401 });
    }

    // Parse and validate request body
    let data;
    try {
      const json = await request.json();
      data = requestSchema.parse(json);
      console.log('[generate-research] ✅ Request data validated:', data);
    } catch (parseError) {
      console.error('[generate-research] ❌ Request validation failed:', parseError);
      if (parseError instanceof z.ZodError) {
        return NextResponse.json({ 
          error: 'Invalid request data',
          details: parseError.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          })),
          code: 'VALIDATION_ERROR'
        }, { status: 400 });
      }
      return NextResponse.json({ 
        error: 'Invalid request format',
        details: 'Could not parse request body',
        code: 'INVALID_REQUEST'
      }, { status: 400 });
    }

    // Get episode data
    const episodeRef = db.collection('episodes').doc(data.episodeId);
    const episodeDoc = await episodeRef.get();
    
    if (!episodeDoc.exists) {
      console.error('[generate-research] ❌ Episode not found:', data.episodeId);
      return NextResponse.json({ 
        error: 'Episode not found',
        details: 'The specified episode does not exist',
        code: 'EPISODE_NOT_FOUND'
      }, { status: 404 });
    }

    const episode = episodeDoc.data();
    if (!episode?.topic || !episode?.tone || !episode?.targetAudience) {
      console.error('[generate-research] ❌ Missing episode config:', { 
        topic: episode?.topic,
        tone: episode?.tone,
        targetAudience: episode?.targetAudience
      });
      return NextResponse.json({ 
        error: 'Invalid episode configuration',
        details: 'Episode is missing required fields (topic, tone, or targetAudience)',
        code: 'INVALID_EPISODE_CONFIG'
      }, { status: 400 });
    }

    // Update step status to processing
    console.log('[generate-research] 📝 Updating step status to processing');
    await episodeRef.update({
      'steps.research.status': 'processing',
      'steps.research.startedAt': Timestamp.now(),
      'steps.research.error': null
    });

    // Generate research
    try {
      console.log('[generate-research] 🔍 Generating research for:', { 
        topic: episode.topic,
        tone: episode.tone,
        audience: episode.targetAudience
      });

      const prompt = generateResearchPrompt({
        topic: episode.topic,
        tone: episode.tone,
        audience: episode.targetAudience
      });

      const research = await fetchFromPerplexity(prompt);

      // Save research and update step status
      console.log('[generate-research] ✅ Research generated, saving to Firestore');
      await episodeRef.update({
        research,
        'steps.research.status': 'completed',
        'steps.research.completedAt': Timestamp.now(),
        'steps.research.error': null
      });

      return NextResponse.json(research);
    } catch (researchError) {
      console.error('[generate-research] ❌ Research generation failed:', researchError);
      
      // Update step status to error
      await episodeRef.update({
        'steps.research.status': 'error',
        'steps.research.error': researchError instanceof Error ? researchError.message : 'Unknown error'
      });

      return NextResponse.json({ 
        error: 'Research generation failed',
        details: researchError instanceof Error ? researchError.message : 'Failed to generate research content',
        code: 'RESEARCH_GENERATION_ERROR'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[generate-research] ❌ Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate research',
      details: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_ERROR'
    }, { status: 500 });
  }
} 