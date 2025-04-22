import { getFirestore, Timestamp, Query, DocumentData, CollectionReference } from 'firebase-admin/firestore';
import { initializeFirebaseAdmin } from './firebase-admin';

/**
 * Episode metadata interface
 */
export interface EpisodeMetadata {
  userId: string;
  episodeId: string;
  audioUrl: string;
  script: string;
  published: boolean;
  metadata: {
    finalizedAt: string;
    publishMode: 'personal' | 'promotional';
    costPaid: number;
  };
}

/**
 * Error thrown by episode storage operations
 */
export class EpisodeStorageError extends Error {}

const db = getFirestore();

/**
 * Saves an episode's metadata, audio, and script
 * @param data - Episode data
 * @throws {EpisodeStorageError} If storage operations fail
 */
export async function saveEpisode(data: EpisodeMetadata) {
  try {
    const ref = db.collection('episodes').doc(data.episodeId);
    await ref.set(data, { merge: true });
  } catch (err: any) {
    throw new EpisodeStorageError(err.message);
  }
}

/**
 * Retrieves an episode's data
 * @param episodeId - The ID of the episode to retrieve
 * @returns Episode data or null if not found
 * @throws {EpisodeStorageError} If retrieval fails
 */
export async function getEpisode(episodeId: string): Promise<EpisodeMetadata> {
  try {
    const ref = db.collection('episodes').doc(episodeId);
    const snap = await ref.get();
    if (!snap.exists) throw new EpisodeStorageError('Episode not found');
    return snap.data() as EpisodeMetadata;
  } catch (err: any) {
    throw new EpisodeStorageError(err.message);
  }
}

export interface Episode {
  id: string;
  userId: string;
  title: string;
  status: string;
  createdAt: Timestamp;
  length: number;
  isPublic: boolean;
}

export interface EpisodeFilters {
  status?: string;
  sortBy?: 'newest' | 'oldest' | 'longest' | 'shortest';
}

export async function getUserEpisodes(
  userId: string,
  filters?: EpisodeFilters
): Promise<Episode[]> {
  try {
    initializeFirebaseAdmin();
    const db = getFirestore();
    
    // Start with base query
    const episodesRef = db.collection('episodes');
    let query = episodesRef.where('userId', '==', userId);
    
    // Add status filter if specified
    if (filters?.status) {
      query = query.where('status', '==', filters.status);
    }
    
    // Add sort
    switch (filters?.sortBy) {
      case 'oldest':
        query = query.orderBy('createdAt', 'asc');
        break;
      case 'longest':
        query = query.orderBy('length', 'desc');
        break;
      case 'shortest':
        query = query.orderBy('length', 'asc');
        break;
      case 'newest':
      default:
        query = query.orderBy('createdAt', 'desc');
    }
    
    const snapshot = await query.get();
    
    // Get all episodes
    const episodes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as Episode[];

    return episodes;
  } catch (error) {
    console.error('Error fetching user episodes:', error);
    throw error;
  }
}

/**
 * Lists all episodes for a user
 * @param userId - The ID of the user
 * @param pageSize - Number of episodes to retrieve
 * @param cursor - Cursor to start after
 * @returns Array of episode summaries
 * @throws {EpisodeStorageError} If listing fails
 */
export async function listEpisodes(userId: string, pageSize = 10, cursor?: string) {
  try {
    initializeFirebaseAdmin();
    const db = getFirestore();
    const episodesRef = db.collection('episodes');
    
    let q = episodesRef
      .where('userId', '==', userId)
      .orderBy('metadata.finalizedAt', 'desc')
      .limit(pageSize);
      
    if (cursor) {
      const last = await getEpisode(cursor);
      q = q.startAfter(last.metadata.finalizedAt);
    }
    
    const snaps = await q.get();
    return snaps.docs.map(doc => doc.data() as EpisodeMetadata);
  } catch (err: any) {
    throw new EpisodeStorageError(err.message);
  }
} 