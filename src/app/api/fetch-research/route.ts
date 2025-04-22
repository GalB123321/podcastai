import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { fetchFromPerplexity, type ResearchRequest } from '@/lib/researchEngine';
import { saveResearch } from '@/lib/memoryHelpers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateResearchPrompt } from '@/lib/researchEngine';

export const runtime = 'nodejs';

/**
 * Error class for research request failures
 */
class ResearchRequestError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'ResearchRequestError';
  }
}

/**
 * Validates research request parameters
 */
function validateRequest(params: {
  userId: string;
  query: string;
  deep?: boolean;
  scholarlyOnly?: boolean;
}): void {
  if (!params.userId?.trim()) {
    throw new ResearchRequestError(
      'Missing or invalid userId',
      'INVALID_USER_ID'
    );
  }

  if (!params.query?.trim()) {
    throw new ResearchRequestError(
      'Missing or empty query',
      'INVALID_QUERY'
    );
  }

  if (params.query.length < 3) {
    throw new ResearchRequestError(
      'Query must be at least 3 characters long',
      'QUERY_TOO_SHORT'
    );
  }

  if (params.query.length > 500) {
    throw new ResearchRequestError(
      'Query must not exceed 500 characters',
      'QUERY_TOO_LONG'
    );
  }
}

/**
 * POST /api/fetch-research
 * Performs research lookup based on provided query
 */
export async function POST(request: Request) {
  try {
    // Get the session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { topic, tone, audience } = body as ResearchRequest;

    // Validate required fields
    if (!topic || !tone || !audience) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get Firebase UID from session
    const firebaseToken = session.firebaseToken;
    if (!firebaseToken) {
      return NextResponse.json(
        { error: 'Firebase token not found in session' },
        { status: 401 }
      );
    }

    // Verify token and get UID
    const decodedToken = await getAuth().verifyIdToken(firebaseToken);
    const uid = decodedToken.uid;

    // Fetch research from Perplexity
    console.log('Fetching research for:', { topic, tone, audience });
    const query = generateResearchPrompt({ topic, tone, audience });
    const research = await fetchFromPerplexity(query);

    // Save research to Firebase
    await saveResearch(uid, research);

    // Return the research data
    return NextResponse.json(research);
  } catch (error) {
    console.error('Error in fetch-research:', error);
    return NextResponse.json(
      { error: 'Failed to fetch research' },
      { status: 500 }
    );
  }
} 