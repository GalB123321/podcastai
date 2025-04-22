/**
 * Represents a time range in seconds
 */
export interface Timestamp {
  start: number;
  end: number;
}

/**
 * Represents a line of script with timing information
 */
interface ScriptLine {
  text: string;
  startTime?: number;
  endTime?: number;
  speaker?: string;
}

/**
 * Error thrown by the remix utilities
 */
export class RemixError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'RemixError';
  }
}

/**
 * Parses a script into lines with timing information
 * @param script - Raw script text
 * @returns Array of parsed script lines
 */
function parseScript(script: string): ScriptLine[] {
  // TODO: Implement more sophisticated parsing
  return script
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      const timeMatch = line.match(/\[(\d+):(\d+)\]/);
      const speakerMatch = line.match(/^([A-Za-z]+):/);
      
      return {
        text: line
          .replace(/\[\d+:\d+\]/, '')
          .replace(/^[A-Za-z]+:/, '')
          .trim(),
        startTime: timeMatch ? 
          parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]) :
          undefined,
        speaker: speakerMatch?.[1]
      };
    });
}

/**
 * Splits a full podcast script into text segments based on provided timestamps
 * @param script - The full transcript or script text
 * @param timestamps - Array of time ranges in seconds
 * @returns Array of script snippets corresponding to each time slice
 * @throws {RemixError} If timestamps are invalid or script cannot be parsed
 */
export function sliceScript(
  script: string,
  timestamps: Timestamp[]
): string[] {
  try {
    // Validate timestamps
    timestamps.forEach((ts, i) => {
      if (ts.start >= ts.end) {
        throw new RemixError(
          `Invalid timestamp at index ${i}: start must be before end`,
          'INVALID_TIMESTAMP'
        );
      }
      if (ts.start < 0 || ts.end < 0) {
        throw new RemixError(
          `Invalid timestamp at index ${i}: negative values not allowed`,
          'INVALID_TIMESTAMP'
        );
      }
    });

    // Parse script into lines with timing
    const lines = parseScript(script);

    // Extract segments for each timestamp
    return timestamps.map(ts => {
      // Find lines that fall within this time range
      const segmentLines = lines.filter(line => {
        if (!line.startTime) return false;
        const endTime = line.endTime || (line.startTime + 30); // Assume ~30s per line if no end
        return line.startTime >= ts.start && endTime <= ts.end;
      });

      // Join matching lines
      return segmentLines
        .map(line => line.speaker ? `${line.speaker}: ${line.text}` : line.text)
        .join('\n');
    });
  } catch (error) {
    if (error instanceof RemixError) throw error;
    throw new RemixError(
      `Failed to slice script: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'SLICE_FAILED'
    );
  }
}

/**
 * Prepares audiogram clips by merging or trimming audio URLs
 * @param audioUrls - Full-episode audio clip URLs
 * @param timestamps - Array of time ranges in seconds
 * @returns Promise resolving to array of new clip URLs
 * @throws {RemixError} If audio processing fails
 */
export async function prepareAudiogram(
  audioUrls: string[],
  timestamps: Timestamp[]
): Promise<string[]> {
  try {
    // Validate inputs
    if (!audioUrls.length) {
      throw new RemixError('No audio URLs provided', 'NO_AUDIO');
    }

    if (!timestamps.length) {
      throw new RemixError('No timestamps provided', 'NO_TIMESTAMPS');
    }

    // TODO: Replace with actual audio processing service call
    const processedClips = await Promise.all(
      timestamps.map(async (ts, index) => {
        // Determine which audio URL contains this timestamp
        const audioIndex = Math.floor(ts.start / 600); // Assume 10-min chunks
        const audioUrl = audioUrls[audioIndex];

        if (!audioUrl) {
          throw new RemixError(
            `No audio URL found for timestamp ${index}`,
            'INVALID_TIMESTAMP'
          );
        }

        // TODO: Call FFmpeg or audio processing service
        // Example API call structure:
        // const response = await axios.post('audio-processing-api/trim', {
        //   sourceUrl: audioUrl,
        //   startTime: ts.start % 600, // Relative to chunk start
        //   endTime: ts.end % 600,
        //   format: 'mp3',
        //   quality: 'high'
        // });
        
        // For now, return a mock URL
        return `https://api.example.com/clips/${index}_${ts.start}_${ts.end}.mp3`;
      })
    );

    return processedClips;
  } catch (error) {
    if (error instanceof RemixError) throw error;
    throw new RemixError(
      `Failed to prepare audiogram: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'PROCESSING_FAILED'
    );
  }
}

/**
 * Validates an audio URL format
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