import { progressBus, type ProgressEvent } from '@/lib/progressBus';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: Request,
  { params }: { params: { episodeId: string } }
) {
  const { episodeId } = params;

  // Verify password
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  if (key !== 'AAA') {
    return new Response('Unauthorized', { status: 401 });
  }

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      // Send initial message
      controller.enqueue('data: {"step":"connecting","data":{},"ts":' + Date.now() + '}\n\n');

      // Listen for progress events
      const listener = (event: ProgressEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`;
        controller.enqueue(data);
      };

      // Subscribe to events for this episode
      progressBus.on(episodeId, listener);

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        progressBus.off(episodeId, listener);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
} 