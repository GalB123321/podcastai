import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getApp } from 'firebase-admin/app';
import { publishEpisode } from '@/lib/spotifyClient';
import { getPlanForUid } from '@/lib/billingHelpers';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // 1. Verify Firebase ID token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // 2. Check user's plan
    const plan = await getPlanForUid(uid);
    if (plan !== 'creator' && plan !== 'business') {
      return NextResponse.json(
        { error: 'Requires Creator or Business plan' },
        { status: 402 }
      );
    }

    // 3. Get episode data
    const body = await request.json();
    const { episodeId } = body;

    const db = getFirestore(getApp());
    const episodeDoc = await db.collection('episodes').doc(episodeId).get();

    if (!episodeDoc.exists) {
      return NextResponse.json(
        { error: 'Episode not found' },
        { status: 404 }
      );
    }

    const episode = episodeDoc.data();
    if (!episode) {
      return NextResponse.json(
        { error: 'Episode data missing' },
        { status: 404 }
      );
    }

    if (episode.status !== 'ready') {
      return NextResponse.json(
        { error: 'Episode not ready for publishing' },
        { status: 400 }
      );
    }

    if (episode.published?.spotify) {
      return NextResponse.json(
        { error: 'Episode already published to Spotify' },
        { status: 400 }
      );
    }

    // 4. Publish to Spotify
    const { episodeSpotifyId, external_url } = await publishEpisode({
      title: episode.title,
      description: episode.summary,
      audioUrl: episode.audioUrl
    });

    // 5. Update Firestore
    await db.collection('episodes').doc(episodeId).update({
      published: {
        spotify: {
          id: episodeSpotifyId,
          url: external_url,
          date: new Date().toISOString()
        }
      }
    });

    // 6. Return success
    return NextResponse.json({
      link: external_url
    });
  } catch (error) {
    console.error('Error publishing to Spotify:', error);
    return NextResponse.json(
      { error: 'Failed to publish episode' },
      { status: 500 }
    );
  }
} 