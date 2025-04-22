import axios from 'axios';
import { env } from '@/env';

/**
 * Options for research queries
 */
interface ResearchOptions {
  deep?: boolean;
  scholarlyOnly?: boolean;
}

/**
 * Response from the research API
 */
interface ResearchResponse {
  facts: {
    content: string;
    source_url?: string;
  }[];
  metadata: {
    query_time: number;
    source_count: number;
  };
}

/**
 * Error thrown by the research engine
 */
class ResearchEngineError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ResearchEngineError';
  }
}

// Initialize configuration
const config = {
  apiUrl: process.env.RESEARCH_API_URL || '',
  apiKey: process.env.PERPLEXITY_API_KEY || ''
};

/**
 * Validates the configuration and throws if invalid
 */
function validateConfig() {
  if (!config.apiUrl) {
    throw new ResearchEngineError(
      'Missing RESEARCH_API_URL environment variable',
      'MISSING_API_URL'
    );
  }
  if (!config.apiKey) {
    throw new ResearchEngineError(
      'Missing PERPLEXITY_API_KEY environment variable',
      'MISSING_API_KEY'
    );
  }
}

/**
 * Fetches facts and sources about a given topic from the research API
 * @param query - The research query or topic
 * @param options - Optional parameters for the research
 * @returns Promise resolving to facts and their sources
 * @throws {ResearchEngineError} If the API call fails
 */
export async function fetchFacts(
  query: string,
  options: ResearchOptions = {}
): Promise<{ facts: string[]; sources: string[] }> {
  validateConfig();

  const { deep = false, scholarlyOnly = false } = options;

  try {
    const response = await axios.post<ResearchResponse>(
      config.apiUrl,
      {
        query,
        options: {
          deep_search: deep,
          scholarly_only: scholarlyOnly,
          max_facts: 10,
          include_sources: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: deep ? 30000 : 15000 // Longer timeout for deep searches
      }
    );

    // Extract unique facts and sources
    const facts = response.data.facts.map(f => f.content);
    const sources = response.data.facts
      .map(f => f.source_url)
      .filter((url): url is string => !!url); // Filter out undefined sources

    return {
      facts,
      sources: [...new Set(sources)] // Remove duplicate sources
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new ResearchEngineError(
          'Research API request timed out',
          'TIMEOUT'
        );
      }
      throw new ResearchEngineError(
        `Research API call failed: ${error.message}`,
        error.response?.status?.toString() || error.code
      );
    }
    throw error;
  }
}

/**
 * Utility function to validate a research query
 * @param query - Query string to validate
 * @returns boolean indicating if query is valid
 */
function isValidQuery(query: string): boolean {
  return query.length >= 3 && query.length <= 500;
}

export interface ResearchRequest {
  topic: string;
  tone: string;
  audience: string;
}

export interface ResearchEpisode {
  content: string[];
  sources: string[];
}

export interface ResearchResult {
  text: string;
  url: string;
}

const MOCK_RESEARCH: ResearchResult = {
  text: "According to recent studies, meditation has been shown to reduce stress levels by up to 40% in regular practitioners. The practice has gained significant popularity in the tech industry, with companies like Google and Apple implementing mindfulness programs. Research from Harvard Medical School indicates that meditation can physically alter brain structure in as little as 8 weeks of consistent practice.",
  url: "https://perplexity.ai"
};

export function generateResearchPrompt(request: ResearchRequest): string {
  return `Research the following topic for a podcast: "${request.topic}"
Tone: ${request.tone}
Target Audience: ${request.audience}

Please provide a structured response with:
1. A catchy title for the podcast series
2. A compelling summary (2-3 sentences)
3. 3-5 episode ideas, each containing:
   - Episode title
   - Key discussion points/ideas (3-5 bullet points)
   - Relevant statistics (2-3 data points)
   - Notable quotes from experts (2-3 quotes)

Format the response to be easily parsed as JSON.`;
}

export async function fetchFromPerplexity(query: string): Promise<ResearchResult> {
  if (!process.env.PERPLEXITY_API_KEY) {
    throw new Error('Perplexity API key not found');
  }

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'pplx-70b-online',
        messages: [
          {
            role: 'system',
            content: 'You are a research assistant that provides factual information with source URLs. Focus on providing accurate, well-researched information.'
          },
          {
            role: 'user',
            content: query
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      url: 'https://perplexity.ai'
    };
  } catch (error) {
    console.error('Error fetching from Perplexity:', error);
    return MOCK_RESEARCH;
  }
}

export async function searchPerplexity(query: string): Promise<ResearchResult[]> {
  const response = await fetch('https://api.perplexity.ai/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.PERPLEXITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Perplexity API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results.map((result: any) => ({
    text: result.text,
    url: result.url,
  }));
}

export async function researchTopic(topic: string): Promise<ResearchResult[]> {
  try {
    const results = await searchPerplexity(topic);
    return results;
  } catch (error) {
    console.error('Research error:', error);
    throw error;
  }
} 