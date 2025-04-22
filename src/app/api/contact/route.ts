import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactMessage = await request.json();
    
    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Add your email sending logic here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 