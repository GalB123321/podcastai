import { NextResponse } from 'next/server';
import { env } from '@/env';
import { z } from 'zod';

const requestSchema = z.object({
  topic: z.string().min(1, 'Topic is required')
});

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const { topic } = requestSchema.parse(body);

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a creative podcast naming assistant.'
          },
          {
            role: 'user',
            content: `Suggest a unique and catchy name for a podcast about: ${topic}.`
          }
        ],
        temperature: 0.8
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      return NextResponse.json(
        { error: 'Failed to generate name' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const name = data.choices[0]?.message?.content?.trim();

    if (!name) {
      return NextResponse.json(
        { error: 'Failed to generate name' },
        { status: 500 }
      );
    }

    return NextResponse.json({ name });
  } catch (error) {
    console.error('Error generating name:', error);
    return NextResponse.json(
      { error: 'Failed to generate name' },
      { status: 500 }
    );
  }
} 