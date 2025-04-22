import { env } from '@/env';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyPublishResponse {
  id: string;
  external_urls: {
    spotify: string;
  };
}

async function getAccessToken(): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN
    })
  });

  if (!response.ok) {
    throw new Error('Failed to get Spotify access token');
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

export async function publishEpisode({ 
  title, 
  description, 
  audioUrl 
}: { 
  title: string;
  description: string;
  audioUrl: string;
}): Promise<{ episodeSpotifyId: string; external_url: string }> {
  const accessToken = await getAccessToken();

  // First, create a draft episode
  const episodeResponse = await fetch('https://api.spotify.com/v1/me/episodes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: title,
      description,
      audio_url: audioUrl,
      visibility: 'public'
    })
  });

  if (!episodeResponse.ok) {
    throw new Error('Failed to publish episode to Spotify');
  }

  const episodeData: SpotifyPublishResponse = await episodeResponse.json();

  return {
    episodeSpotifyId: episodeData.id,
    external_url: episodeData.external_urls.spotify
  };
} 