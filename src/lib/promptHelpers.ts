import type { ChatCompletionMessageParam } from 'openai/resources';
import { PlanTier } from '@/lib/planAccess';

/**
 * Types for prompt builder functions
 */
interface ResearchData {
  facts: string[];
  summary?: string;
  keyInsights?: string[];
  expertQuotes?: string[];
  practicalApplications?: string[];
}

interface PromptConfig {
  topic: string;
  tone: string;
  audience: string;
  episodeLength: number;
  hosts: string[];
  language: string;
  emotion?: boolean;
  personalData?: {
    name?: string;
    expertise?: string;
    style?: string;
    [key: string]: any;
  };
}

interface BriefInput {
  title?: string;
  topic?: string;
  keyPoints?: string[];
  duration?: number;
  targetAudience?: string;
}

interface WizardConfig {
  topic: string;
  tone: string;
  audience: string;
  lengthTier: 'mini' | 'standard' | 'deep';
  episodes: number;
  promoText?: string;
  hosts?: string[];
  language?: string;
  emotion?: boolean;
}

interface BuildPromptArgs {
  researchJSON: ResearchData;
  tone: string;
  audience: string;
  lengthTier: 'mini' | 'standard' | 'deep';
  episodes: number;
  promoText?: string;
  plan: PlanTier;
}

const LENGTH_TIERS = {
  mini: 10,
  standard: 20,
  deep: 45
};

/**
 * Utility function to sanitize prompt inputs
 */
function sanitizePromptInput(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '')
    .slice(0, 1000);
}

/**
 * Utility function to validate prompt parameters
 */
function validatePromptParams(params: Record<string, any>): boolean {
  return Object.values(params).every(value => 
    value !== undefined && 
    value !== null && 
    value !== '' &&
    !(Array.isArray(value) && value.length === 0)
  );
}

class PromptHelpers {
  /**
   * Builds a prompt for conducting comprehensive topic research
   */
  buildResearchPrompt(topic: string): string {
    return `You are a thorough research assistant. Conduct comprehensive research on "${topic}" for a podcast episode.

Required Sections:

1. Key Facts (5-7):
- Focus on surprising or lesser-known information
- Include relevant statistics
- Highlight recent developments

2. Historical Context:
- Essential background
- Major developments
- Significant events

3. Current Relevance:
- Modern importance
- Recent developments
- Current trends

4. Expert Insights:
- Notable quotes
- Different perspectives
- Areas of debate

5. Practical Applications:
- Real-world examples
- Case studies
- Practical implications

6. Audience Value:
- Relevance to listeners
- Daily life impact
- Action items

Format as structured research notes with clear sections and citations where possible.`.trim();
  }

  /**
   * Builds a prompt for generating episode briefs
   */
  buildBriefPrompt(input: BriefInput): string {
    const {
      title = 'Untitled Episode',
      topic = '',
      keyPoints = [],
      duration = 15,
      targetAudience = 'General audience'
    } = input;

    return `You are a podcast producer. Create a detailed episode brief for:
"${title}"

Episode Details:
- Topic: ${topic}
- Duration: ${duration} minutes
- Audience: ${targetAudience}

Key Points:
${keyPoints.map(point => `- ${point}`).join('\n')}

Provide:

1. Episode Summary
- 2-3 compelling sentences
- Clear value proposition

2. Episode Structure
- Opening hook
- Main segments
- Closing and call-to-action

3. Key Takeaways
- Learning objectives
- Action items
- Resources

4. Technical Guidelines
- Pacing notes
- Transition points
- Audio considerations

5. Marketing Elements
- Episode description
- Social media quotes
- Hashtag suggestions

Format as a structured brief with actionable items.`.trim();
  }

  /**
   * Builds prompts for generating podcast scripts based on research and wizard config
   */
  buildScriptPrompt({ 
    researchJSON, 
    tone, 
    audience, 
    lengthTier, 
    episodes,
    promoText,
    plan 
  }: BuildPromptArgs): ChatCompletionMessageParam[][] {
    const episodeLength = LENGTH_TIERS[lengthTier];
    const prompts: ChatCompletionMessageParam[][] = [];

    // System message template
    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: `You are an expert podcast scriptwriter specializing in ${tone} content for ${audience}.
Your task is to generate engaging, well-structured podcast scripts that:
1. Maintain consistent tone and style
2. Include natural transitions between segments
3. Balance education with entertainment
4. Target exactly ${episodeLength} minutes of speaking time
5. Use [PAUSE], [EMPHASIS], or [TRANSITION] markers appropriately

${plan === 'business' ? 'Focus on professional insights and actionable takeaways.' : ''}
${plan === 'creator' ? 'Emphasize engaging storytelling and audience connection.' : ''}

Output Format:
{
  "title": "Compelling episode title",
  "description": "SEO-friendly episode description",
  "segments": [
    {
      "type": "intro"|"main"|"outro",
      "duration": "MM:SS",
      "lines": [
        {
          "speaker": "Host",
          "text": "Line content with markers",
          "emotion": "Optional emotion indicator"
        }
      ]
    }
  ]
}`
    };

    // Generate prompts for each episode
    for (let i = 0; i < episodes; i++) {
      const { facts, keyInsights, expertQuotes, practicalApplications } = researchJSON;
      
      // Calculate fact distribution across episodes
      const factsPerEpisode = Math.ceil(facts.length / episodes);
      const startIdx = i * factsPerEpisode;
      const episodeFacts = facts.slice(startIdx, startIdx + factsPerEpisode);

      const userMessage: ChatCompletionMessageParam = {
        role: 'user',
        content: `Generate Episode ${i + 1} of ${episodes}

RESEARCH INSIGHTS:
${episodeFacts.map((fact, idx) => `${idx + 1}. ${fact}`).join('\n')}

${keyInsights ? `\nKEY INSIGHTS:\n${keyInsights.slice(i, i + 2).join('\n')}` : ''}
${expertQuotes ? `\nEXPERT QUOTES:\n${expertQuotes.slice(i, i + 2).join('\n')}` : ''}
${practicalApplications ? `\nPRACTICAL APPLICATIONS:\n${practicalApplications.slice(i, i + 2).join('\n')}` : ''}

${promoText ? `\nPROMOTIONAL MESSAGE TO INCLUDE:\n${promoText}` : ''}

REQUIREMENTS:
1. Target exactly ${episodeLength} minutes
2. Use ${tone} tone for ${audience}
3. Focus on facts ${startIdx + 1}-${startIdx + factsPerEpisode}
4. Include clear intro and outro
5. Add [PAUSE], [EMPHASIS], or [TRANSITION] markers
6. Format as JSON with segments and speaker lines

Make each episode unique while maintaining series coherence.`
      };

      prompts.push([systemMessage, userMessage]);
    }

    return prompts;
  }
}

export const promptHelpers = new PromptHelpers(); 