import axios from 'axios';

/**
 * Configuration for the voice engine
 */
interface VoiceEngineConfig {
  apiKey: string;
  baseUrl: string;
}

/**
 * Response from the TTS API
 */
interface TTSResponse {
  audioUrl: string;
  status: string;
}

/**
 * Error thrown by the voice engine
 */
class VoiceEngineError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'VoiceEngineError';
  }
}

// Initialize configuration
const config: VoiceEngineConfig = {
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  baseUrl: 'https://api.elevenlabs.io/v1'
};

/**
 * Validates the configuration and throws if invalid
 */
function validateConfig() {
  if (!config.apiKey) {
    throw new VoiceEngineError(
      'Missing ELEVENLABS_API_KEY environment variable',
      'MISSING_API_KEY'
    );
  }
}

/**
 * Generates a voice line from text using the specified voice
 * @param text - The text to convert to speech
 * @param voiceId - The ID of the voice to use
 * @returns Promise resolving to the URL of the generated audio
 * @throws {VoiceEngineError} If the API call fails
 */
export async function generateVoiceLine(
  text: string,
  voiceId: string
): Promise<string> {
  validateConfig();

  try {
    // TODO: Replace with actual API call
    const response = await axios.post<TTSResponse>(
      `${config.baseUrl}/text-to-speech/${voiceId}`,
      {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      },
      {
        headers: {
          'xi-api-key': config.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.audioUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new VoiceEngineError(
        `TTS API call failed: ${error.message}`,
        error.code
      );
    }
    throw error;
  }
}

/**
 * Merges multiple audio clips into a single MP3 file
 * @param urls - Array of URLs pointing to audio clips to merge
 * @returns Promise resolving to the URL of the merged audio file
 * @throws {VoiceEngineError} If the merge operation fails
 */
export async function mergeAudioClips(urls: string[]): Promise<string> {
  if (!urls.length) {
    throw new VoiceEngineError('No audio clips provided', 'INVALID_INPUT');
  }

  try {
    // TODO: Replace with actual API call or FFmpeg implementation
    const response = await axios.post<{ mergedUrl: string }>(
      `${config.baseUrl}/audio/merge`,
      {
        audio_urls: urls,
        output_format: 'mp3',
      },
      {
        headers: {
          'xi-api-key': config.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.mergedUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new VoiceEngineError(
        `Audio merge failed: ${error.message}`,
        error.code
      );
    }
    throw error;
  }
}

/**
 * Utility function to validate audio URLs
 * @param url - URL to validate
 * @returns boolean indicating if URL is valid
 */
function isValidAudioUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && 
           (url.endsWith('.mp3') || url.endsWith('.wav'));
  } catch {
    return false;
  }
} 