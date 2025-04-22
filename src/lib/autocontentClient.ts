import { env } from '@/env';

/**
 * Line of text to be converted to speech
 */
export interface TTSLine {
  id: string;
  speaker: string;
  text: string;
  emotion?: string;
}

/**
 * Error thrown by TTS operations
 */
export class TTSError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'TTSError';
  }
}

// Fallback audio URL in case of generation failure
const FALLBACK_AUDIO_URL = 'https://storage.googleapis.com/podcastai-fallback/silence.mp3';

/**
 * Generates audio for multiple lines of text using ElevenLabs API
 * @param lines - Array of text lines to convert to speech
 * @returns Array of audio URLs
 * @throws {TTSError} If the API call fails
 */
export async function ttsBatch(lines: TTSLine[]): Promise<string[]> {
  try {
    console.log('[autocontentClient] Starting batch TTS generation for', lines.length, 'lines');
    
    if (!env.ELEVENLABS_API_KEY) {
      throw new TTSError('ElevenLabs API key not configured', 'API_KEY_MISSING');
    }

    const audioUrls: string[] = [];
    const failedLines: string[] = [];

    // Process each line sequentially to avoid rate limits
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`[autocontentClient] Processing line ${i + 1}/${lines.length}: ${line.id}`);

      try {
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': env.ELEVENLABS_API_KEY
          },
          body: JSON.stringify({
            text: line.text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });

        if (!response.ok) {
          let errorMessage = 'ElevenLabs API request failed';
          try {
            const error = await response.json();
            errorMessage = error.detail || errorMessage;
          } catch {
            // Use default error message if JSON parsing fails
          }

          console.error(`[autocontentClient] ❌ Failed to generate audio for line ${line.id}:`, errorMessage);
          failedLines.push(line.id);
          audioUrls.push(FALLBACK_AUDIO_URL);
          continue;
        }

        // Get the audio URL from the response
        const audioBlob = await response.blob();
        const formData = new FormData();
        formData.append('file', audioBlob, `${line.id}.mp3`);

        // Upload to Google Cloud Storage
        const uploadResponse = await fetch('/api/upload-audio', {
          method: 'POST',
          body: formData
        });

        if (!uploadResponse.ok) {
          console.error(`[autocontentClient] ❌ Failed to upload audio for line ${line.id}`);
          failedLines.push(line.id);
          audioUrls.push(FALLBACK_AUDIO_URL);
          continue;
        }

        const { url } = await uploadResponse.json();
        audioUrls.push(url);
        console.log(`[autocontentClient] ✅ Generated and uploaded audio for line ${line.id}`);

      } catch (lineError) {
        console.error(`[autocontentClient] ❌ Error processing line ${line.id}:`, lineError);
        failedLines.push(line.id);
        audioUrls.push(FALLBACK_AUDIO_URL);
      }
    }

    // Log summary of failed lines
    if (failedLines.length > 0) {
      console.warn('[autocontentClient] ⚠️ Some lines failed to generate:', failedLines);
    }

    console.log('[autocontentClient] ✅ Completed batch TTS generation');
    return audioUrls;

  } catch (error) {
    console.error('[autocontentClient] ❌ Batch TTS generation failed:', error);
    throw new TTSError(
      error instanceof Error ? error.message : 'Failed to generate audio',
      error instanceof TTSError ? error.code : 'TTS_ERROR'
    );
  }
}

/**
 * Retries a failed TTS generation for specific lines
 * @param lines - Array of lines to retry
 * @returns Array of audio URLs for retried lines
 */
export async function retryFailedLines(lines: TTSLine[]): Promise<string[]> {
  console.log('[autocontentClient] Retrying TTS generation for', lines.length, 'lines');
  return ttsBatch(lines);
} 