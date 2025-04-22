import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from '@/lib/firebaseAdmin';
import { Storage } from '@google-cloud/storage';
import { z } from 'zod';
import fs from 'fs/promises';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { promisify } from 'util';
import fetch from 'node-fetch';
import { env } from '@/env';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes timeout

// Validation schemas
const requestSchema = z.object({
  episodeId: z.string().min(1, 'Episode ID is required')
});

const audioSchema = z.array(
  z.object({
    url: z.string().url('Invalid audio URL')
  })
).min(1, 'At least one audio segment is required');

// Constants
const TEMP_DIR = '/tmp/podcastai';
const WEBHOOK_TIMEOUT = 5000; // 5 seconds
const BUCKET_NAME = env.GCS_BUCKET_NAME || 'podcastai-episodes';

/**
 * Downloads an audio file from a URL to a local path
 */
async function downloadAudio(url: string, filePath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download audio from ${url}: ${response.statusText}`);
  }
  const buffer = await response.buffer();
  await fs.writeFile(filePath, buffer);
}

/**
 * Merges multiple audio files into a single MP3
 */
async function mergeAudioFiles(inputFiles: string[], outputFile: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let duration = 0;
    const command = ffmpeg();

    // Add input files
    inputFiles.forEach(file => {
      command.input(file);
    });

    // Setup event handlers
    command
      .on('start', () => console.log('[finalize-episode] 🎵 Starting audio merge'))
      .on('progress', progress => {
        if (progress.percent) {
          console.log(`[finalize-episode] 📊 Merge progress: ${Math.round(progress.percent)}%`);
        }
      })
      .on('end', () => {
        console.log('[finalize-episode] ✅ Audio merge complete');
        resolve(duration);
      })
      .on('error', (err) => {
        console.error('[finalize-episode] ❌ Audio merge failed:', err);
        reject(new Error(`FFmpeg error: ${err.message}`));
      })
      .on('codecData', data => {
        duration = parseInt(data.duration.replace(/:/g, ''));
      });

    // Merge and output
    command
      .mergeToFile(outputFile, TEMP_DIR)
      .audioCodec('libmp3lame')
      .audioBitrate('192k');
  });
}

/**
 * Sends a webhook notification about episode finalization
 */
async function sendWebhook(data: { episodeId: string; userId: string }): Promise<void> {
  if (!env.FINALIZE_WEBHOOK_URL) return;

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Webhook timeout')), WEBHOOK_TIMEOUT);
    });

    const fetchPromise = fetch(env.FINALIZE_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': env.FINALIZE_WEBHOOK_SECRET || ''
      },
      body: JSON.stringify({
        ...data,
        event: 'finalized',
        timestamp: new Date().toISOString()
      })
    });

    await Promise.race([fetchPromise, timeoutPromise]);
    console.log('[finalize-episode] ✅ Webhook sent successfully');
  } catch (error) {
    console.error('[finalize-episode] ⚠️ Webhook failed:', error);
    // Non-blocking error - log but don't throw
  }
}

/**
 * POST /api/finalize-episode
 * Finalizes a podcast episode by merging audio segments and updating metadata
 */
export async function POST(request: Request) {
  try {
    console.log('[finalize-episode] Starting episode finalization');
    
    // Initialize Firebase Admin and Storage
    initializeFirebaseAdmin();
    const auth = getAuth();
    const db = getFirestore();
    const storage = new Storage();
    console.log('[finalize-episode] 🔧 Services initialized');

    // Extract and verify Firebase token
    const authHeader = request.headers.get('Authorization');
    console.log('[finalize-episode] 📡 Auth header received:', authHeader?.substring(0, 20) + '...');
    
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[finalize-episode] ❌ Missing or invalid authorization header');
      return NextResponse.json({ 
        error: 'Missing token',
        details: 'Authorization header missing or malformed',
        code: 'AUTH_HEADER_MISSING'
      }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      console.error('[finalize-episode] ❌ Token not found in header');
      return NextResponse.json({ 
        error: 'Token not found',
        details: 'Token was not extracted from header',
        code: 'TOKEN_NOT_FOUND'
      }, { status: 401 });
    }

    // Verify Firebase token
    let userId: string;
    try {
      console.log('[finalize-episode] 🔑 Verifying token...');
      const decodedToken = await auth.verifyIdToken(token);
      userId = decodedToken.uid;
      console.log('[finalize-episode] ✅ Token verified for user:', userId);
    } catch (authError) {
      console.error('[finalize-episode] ❌ Token verification failed:', authError);
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
      console.log('[finalize-episode] ✅ Request data validated:', data);
    } catch (parseError) {
      console.error('[finalize-episode] ❌ Request validation failed:', parseError);
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

    // Start a Firestore transaction
    const finalizeEpisode = await db.runTransaction(async (transaction) => {
      // Get episode data
      const episodeRef = db.collection('episodes').doc(data.episodeId);
      const episodeDoc = await transaction.get(episodeRef);
      
      if (!episodeDoc.exists) {
        throw new Error('EPISODE_NOT_FOUND');
      }

      const episode = episodeDoc.data();
      if (!episode?.scripts?.[0]) {
        throw new Error('SCRIPT_NOT_FOUND');
      }

      // Validate audio array
      try {
        if (!episode.audio) throw new Error('AUDIO_NOT_FOUND');
        const audio = audioSchema.parse(episode.audio);
        console.log('[finalize-episode] ✅ Found', audio.length, 'audio segments');
      } catch (validationError) {
        throw new Error('INVALID_AUDIO_DATA');
      }

      // Update status to processing
      transaction.update(episodeRef, {
        'steps.finalize.status': 'processing',
        'steps.finalize.startedAt': Timestamp.now(),
        'steps.finalize.error': null,
        'steps.finalize.progress': 0
      });

      return { episodeRef, episode };
    });

    // Create temp directory if it doesn't exist
    await fs.mkdir(TEMP_DIR, { recursive: true });

    // Download audio files
    const audioFiles: string[] = [];
    try {
      console.log('[finalize-episode] 📥 Downloading audio segments');
      let progress = 0;
      const downloadProgress = 40; // Downloads account for 40% of total progress

      for (let i = 0; i < finalizeEpisode.episode.audio.length; i++) {
        const url = finalizeEpisode.episode.audio[i].url;
        const filePath = path.join(TEMP_DIR, `segment_${i}.mp3`);
        
        await downloadAudio(url, filePath);
        audioFiles.push(filePath);
        
        progress = Math.round((i + 1) / finalizeEpisode.episode.audio.length * downloadProgress);
        await finalizeEpisode.episodeRef.update({
          'steps.finalize.progress': progress
        });
      }
    } catch (downloadError) {
      console.error('[finalize-episode] ❌ Audio download failed:', downloadError);
      throw new Error('AUDIO_DOWNLOAD_FAILED');
    }

    // Merge audio files
    let duration = 0;
    const outputFile = path.join(TEMP_DIR, `${data.episodeId}_final.mp3`);
    try {
      console.log('[finalize-episode] 🎵 Merging audio segments');
      await finalizeEpisode.episodeRef.update({
        'steps.finalize.progress': 50
      });

      duration = await mergeAudioFiles(audioFiles, outputFile);
    } catch (mergeError) {
      console.error('[finalize-episode] ❌ Audio merge failed:', mergeError);
      throw new Error('AUDIO_MERGE_FAILED');
    }

    // Upload to Google Cloud Storage
    let publicUrl: string;
    try {
      console.log('[finalize-episode] ☁️ Uploading to Cloud Storage');
      await finalizeEpisode.episodeRef.update({
        'steps.finalize.progress': 80
      });

      const bucket = storage.bucket(BUCKET_NAME);
      const destination = `episodes/${data.episodeId}/${path.basename(outputFile)}`;
      await bucket.upload(outputFile, {
        destination,
        metadata: {
          contentType: 'audio/mpeg'
        }
      });

      const [url] = await bucket.file(destination).getSignedUrl({
        action: 'read',
        expires: '2100-01-01'
      });
      publicUrl = url;
    } catch (uploadError) {
      console.error('[finalize-episode] ❌ Cloud Storage upload failed:', uploadError);
      throw new Error('UPLOAD_FAILED');
    }

    // Update Firestore with final data
    try {
      console.log('[finalize-episode] 📝 Updating Firestore with final data');
      await finalizeEpisode.episodeRef.update({
        finalized: true,
        finalizedAt: Timestamp.now(),
        publicAudioURL: publicUrl,
        duration,
        'steps.finalize.status': 'completed',
        'steps.finalize.completedAt': Timestamp.now(),
        'steps.finalize.progress': 100
      });
    } catch (updateError) {
      console.error('[finalize-episode] ❌ Final Firestore update failed:', updateError);
      throw new Error('FINAL_UPDATE_FAILED');
    }

    // Clean up temp files
    try {
      console.log('[finalize-episode] 🧹 Cleaning up temporary files');
      await Promise.all([
        ...audioFiles.map(file => fs.unlink(file)),
        fs.unlink(outputFile)
      ]);
    } catch (cleanupError) {
      console.error('[finalize-episode] ⚠️ Cleanup failed:', cleanupError);
      // Non-blocking error - continue
    }

    // Send webhook (non-blocking)
    sendWebhook({ episodeId: data.episodeId, userId });

    console.log('[finalize-episode] ✅ Episode finalization complete');
    return NextResponse.json({
      status: 'success',
      episodeId: data.episodeId
    });

  } catch (error) {
    console.error('[finalize-episode] ❌ Finalization failed:', error);
    
    // Map error codes to user-friendly messages
    const errorMap: Record<string, { status: number; message: string }> = {
      'EPISODE_NOT_FOUND': { status: 404, message: 'Episode not found' },
      'SCRIPT_NOT_FOUND': { status: 400, message: 'Script not found for episode' },
      'AUDIO_NOT_FOUND': { status: 400, message: 'Audio segments not found' },
      'INVALID_AUDIO_DATA': { status: 400, message: 'Invalid audio data format' },
      'AUDIO_DOWNLOAD_FAILED': { status: 500, message: 'Failed to download audio segments' },
      'AUDIO_MERGE_FAILED': { status: 500, message: 'Failed to merge audio segments' },
      'UPLOAD_FAILED': { status: 500, message: 'Failed to upload final audio' },
      'FINAL_UPDATE_FAILED': { status: 500, message: 'Failed to update episode data' }
    };

    const errorCode = error instanceof Error ? error.message : 'UNKNOWN_ERROR';
    const errorInfo = errorMap[errorCode] || { status: 500, message: 'An unexpected error occurred' };

    return NextResponse.json({ 
      error: errorInfo.message,
      details: error instanceof Error ? error.message : 'Unknown error occurred',
      code: errorCode
    }, { status: errorInfo.status });
  }
} 