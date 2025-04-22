import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';
import { ttsBatch, type TTSLine } from '@/lib/autocontentClient';
import { z } from 'zod';

export const runtime = 'nodejs';

// Validation schema for request body
const requestSchema = z.object({
  episodeId: z.string().min(1, 'Episode ID is required')
});

/**
 * Extracts speaker lines from script segments
 */
function extractSpeakerLines(script: any): TTSLine[] {
  if (!script?.segments || !Array.isArray(script.segments)) {
    throw new Error('Invalid script format: missing segments array');
  }

  const lines: TTSLine[] = [];
  let lineId = 1;

  for (const segment of script.segments) {
    if (!segment?.lines || !Array.isArray(segment.lines)) {
      continue;
    }

    for (const line of segment.lines) {
      if (line?.speaker && line?.text) {
        lines.push({
          id: `line_${lineId++}`,
          speaker: line.speaker,
          text: line.text,
          emotion: line.emotion
        });
      }
    }
  }

  if (lines.length === 0) {
    throw new Error('No valid speaker lines found in script');
  }

  return lines;
}

/**
 * POST /api/generate-voice
 * Generates voice audio for a podcast episode using text-to-speech
 */
export async function POST(request: Request) {
  try {
    console.log('[generate-voice] Starting voice generation');
    
    // Initialize Firebase Admin
    initializeFirebaseAdmin();
    const auth = getAuth();
    const db = getFirestore();
    console.log('[generate-voice] 🔧 Firebase Admin initialized');

    // Extract and verify Firebase token
    const authHeader = request.headers.get('Authorization');
    console.log('[generate-voice] 📡 Auth header received:', authHeader?.substring(0, 20) + '...');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[generate-voice] ❌ Missing or invalid authorization header');
      return NextResponse.json({ 
        error: 'Missing token',
        details: 'Authorization header missing or malformed',
        code: 'AUTH_HEADER_MISSING'
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      console.error('[generate-voice] ❌ Token not found in header');
      return NextResponse.json({ 
        error: 'Token not found',
        details: 'Token was not extracted from header',
        code: 'TOKEN_NOT_FOUND'
      }, { status: 401 });
    }

    // Verify Firebase token
    let userId: string;
    try {
      console.log('[generate-voice] 🔑 Verifying token...');
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('[generate-voice] ✅ Token verified for user:', userId);
    } catch (authError) {
      console.error('[generate-voice] ❌ Token verification failed:', authError);
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
      console.log('[generate-voice] ✅ Request data validated:', data);
    } catch (parseError) {
      console.error('[generate-voice] ❌ Request validation failed:', parseError);
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

    // Get episode data from Firestore
    const episodeRef = db.collection('episodes').doc(data.episodeId);
    const episodeDoc = await episodeRef.get();
    
    if (!episodeDoc.exists) {
      console.error('[generate-voice] ❌ Episode not found:', data.episodeId);
      return NextResponse.json({ 
        error: 'Episode not found',
        details: 'The specified episode does not exist',
        code: 'EPISODE_NOT_FOUND'
      }, { status: 404 });
    }

    const episode = episodeDoc.data();
    if (!episode?.scripts?.[0]) {
      console.error('[generate-voice] ❌ Script not found for episode');
      return NextResponse.json({ 
        error: 'Script not found',
        details: 'Script data is missing for this episode',
        code: 'SCRIPT_NOT_FOUND'
      }, { status: 400 });
    }

    // Update step status to processing
    try {
      console.log('[generate-voice] 📝 Updating step status to processing');
      await episodeRef.update({
        'steps.voice.status': 'processing',
        'steps.voice.startedAt': Timestamp.now(),
        'steps.voice.error': null,
        'steps.voice.progress': 0
      });
    } catch (updateError) {
      console.error('[generate-voice] ❌ Failed to update processing status:', updateError);
      // Continue execution despite status update failure
    }

    // Extract speaker lines and generate voice
    try {
      // Extract lines from script
      console.log('[generate-voice] 📝 Extracting speaker lines from script');
      const lines = extractSpeakerLines(episode.scripts[0]);
      console.log('[generate-voice] ✅ Found', lines.length, 'speaker lines');

      // Generate voice audio
      console.log('[generate-voice] 🎙️ Generating voice audio');
      const audioUrls = await ttsBatch(lines);
      
      if (!audioUrls?.length) {
        throw new Error('No audio URLs generated');
      }

      // Update Firestore with generated audio
      try {
        console.log('[generate-voice] ✅ Saving generated audio URLs');
        await episodeRef.update({
          audio: audioUrls,
          'steps.voice.status': 'completed',
          'steps.voice.completedAt': Timestamp.now(),
          'steps.voice.error': null,
          'steps.voice.progress': 100
        });
      } catch (saveError) {
        console.error('[generate-voice] ❌ Failed to save audio URLs:', saveError);
        throw new Error('Failed to save generated audio');
      }

      // Return the audio URLs
      return NextResponse.json({ audio: audioUrls });

    } catch (voiceError) {
      console.error('[generate-voice] ❌ Voice generation failed:', voiceError);
      
      // Update step status to error
      try {
        await episodeRef.update({
          'steps.voice.status': 'error',
          'steps.voice.error': voiceError instanceof Error ? voiceError.message : 'Unknown error',
          'steps.voice.progress': 0
        });
      } catch (updateError) {
        console.error('[generate-voice] ❌ Failed to update error status:', updateError);
      }

      return NextResponse.json({ 
        error: 'Voice generation failed',
        details: voiceError instanceof Error ? voiceError.message : 'Failed to generate voice audio',
        code: 'VOICE_GENERATION_ERROR'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[generate-voice] ❌ Unhandled error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate voice',
      details: error instanceof Error ? error.message : 'An unexpected error occurred',
      code: error instanceof Error && 'code' in error ? (error as any).code : 'INTERNAL_ERROR'
    }, { status: 500 });
  }
} 