import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

const promptSchema = z.object({
  name: z.string().min(1),
  topic: z.string().min(1),
  targetAudience: z.array(z.string()),
  customAudience: z.string().optional(),
  tone: z.string(),
  episodeLength: z.number(),
  episodeCount: z.number(),
  includePromo: z.boolean(),
  promoText: z.string().optional(),
  isCourse: z.boolean(),
  courseTitle: z.string().optional(),
  customLabel: z.string().optional(),
  customInstructions: z.string().optional(),
  scheduleEpisodes: z.boolean(),
  episodeDates: z.array(z.date().nullable()),
  visibility: z.enum(['public', 'private', 'unlisted']),
  enableTeamAccess: z.boolean(),
  teamEmails: z.array(z.string())
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const json = await request.json();
    const body = promptSchema.parse(json);

    const prompt = await db.prompt.create({
      data: {
        ...body,
        userId: session.user.id,
        status: 'pending'
      }
    });

    return NextResponse.json({ promptId: prompt.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 });
    }

    console.error('Error saving prompt:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 