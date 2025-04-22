import { env } from '@/env';
import { promptHelpers } from '@/lib/promptHelpers';
import type { ChatCompletionMessageParam } from 'openai/resources';

export interface ScriptSegment {
  type: 'intro' | 'main' | 'outro';
  duration: string;
  lines: Array<{
    speaker: string;
    text: string;
    emotion?: string;
  }>;
}

export interface ScriptJSON {
  title: string;
  description: string;
  segments: ScriptSegment[];
}

export interface GenerateScriptParams {
  researchJSON: {
    facts: string[];
    summary?: string;
    keyInsights?: string[];
    expertQuotes?: string[];
    practicalApplications?: string[];
  };
  config: {
    topic: string;
    tone: string;
    audience: string;
    lengthTier: 'mini' | 'standard' | 'deep';
    episodes: number;
    promoText?: string;
    plan: 'personal' | 'creator' | 'business';
  };
}

/**
 * Error thrown by OpenAI operations
 */
export class OpenAIError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'OpenAIError';
  }
}

/**
 * Validates the script JSON structure
 */
function validateScriptJSON(script: any): script is ScriptJSON {
  if (!script || typeof script !== 'object') return false;
  if (typeof script.title !== 'string' || !script.title) return false;
  if (typeof script.description !== 'string' || !script.description) return false;
  if (!Array.isArray(script.segments)) return false;

  return script.segments.every((segment: any) => {
    if (!segment || typeof segment !== 'object') return false;
    if (!['intro', 'main', 'outro'].includes(segment.type)) return false;
    if (typeof segment.duration !== 'string' || !segment.duration) return false;
    if (!Array.isArray(segment.lines)) return false;

    return segment.lines.every((line: any) => {
      if (!line || typeof line !== 'object') return false;
      if (typeof line.speaker !== 'string' || !line.speaker) return false;
      if (typeof line.text !== 'string' || !line.text) return false;
      if (line.emotion !== undefined && typeof line.emotion !== 'string') return false;
      return true;
    });
  });
}

/**
 * Generates a podcast script using OpenAI's GPT-4 Turbo
 * @param params - The parameters for script generation
 * @returns Array of generated scripts
 * @throws {OpenAIError} If the API call fails or returns invalid data
 */
export async function generateScript({ researchJSON, config }: GenerateScriptParams): Promise<ScriptJSON[]> {
  try {
    console.log('[openaiClient] Building script prompts');
    const prompts = promptHelpers.buildScriptPrompt({
      researchJSON,
      ...config,
      plan: config.plan
    }) as ChatCompletionMessageParam[][];

    const scripts: ScriptJSON[] = [];

    for (let i = 0; i < config.episodes; i++) {
      console.log(`[openaiClient] Generating script ${i + 1}/${config.episodes}`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: prompts[i],
          temperature: 0.7,
          response_format: { type: 'json_object' },
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        let errorMessage = 'OpenAI API request failed';
        let errorCode = 'API_ERROR';
        
        try {
          const error = await response.json();
          errorMessage = error.error?.message || errorMessage;
          errorCode = error.error?.code || errorCode;
        } catch {
          // Use default error message if JSON parsing fails
        }

        console.error('[openaiClient] API error:', { status: response.status, message: errorMessage });
        throw new OpenAIError(errorMessage, errorCode);
      }

      let data;
      try {
        data = await response.json();
      } catch (err) {
        console.error('[openaiClient] Failed to parse API response');
        throw new OpenAIError('Failed to parse OpenAI response');
      }

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.error('[openaiClient] Empty response from API');
        throw new OpenAIError('Empty response from OpenAI');
      }

      let scriptData;
      try {
        scriptData = JSON.parse(content);
      } catch (err) {
        console.error('[openaiClient] Failed to parse script JSON:', content.substring(0, 100) + '...');
        throw new OpenAIError('Failed to parse script content as JSON');
      }

      if (!validateScriptJSON(scriptData)) {
        console.error('[openaiClient] Invalid script structure:', scriptData);
        throw new OpenAIError('Invalid script structure');
      }

      scripts.push(scriptData);
      console.log(`[openaiClient] Successfully generated script ${i + 1}`);
    }

    return scripts;
  } catch (err) {
    if (err instanceof OpenAIError) {
      throw err;
    }
    console.error('[openaiClient] Unexpected error:', err);
    throw new OpenAIError(
      err instanceof Error ? err.message : 'Script generation failed',
      'UNEXPECTED_ERROR'
    );
  }
} 