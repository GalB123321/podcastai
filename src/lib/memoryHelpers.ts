import { getAuth } from 'firebase/auth';
import firebaseApp, { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import type { ResearchResult } from './researchEngine';

/**
 * Interface representing a user's memory data
 */
export interface UserMemory {
  // Past topics and their timestamps
  topics?: {
    [topicId: string]: {
      name: string;
      lastAccessed: Date;
      timesAccessed: number;
    };
  };

  // User preferences
  preferences?: {
    tone?: string;
    style?: string;
    targetAudience?: string;
    preferredDuration?: number;
  };

  // Series progress tracking
  seriesProgress?: {
    [seriesId: string]: {
      currentEpisode: number;
      totalEpisodes: number;
      lastAccessed: Date;
      completed: boolean;
    };
  };

  // Custom user-specific data
  customData?: Record<string, unknown>;

  // Metadata
  lastUpdated?: Date;
  version?: number;
}

/**
 * Error thrown when memory operations fail
 */
export class MemoryError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly userId?: string
  ) {
    super(message);
    this.name = 'MemoryError';
  }
}

/**
 * Loads a user's memory data from the API
 * @returns The user's memory object, or an empty object if none exists
 * @throws {MemoryError} If the API operation fails
 */
export async function loadUserMemory(): Promise<UserMemory> {
  try {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
      throw new MemoryError('User not authenticated', 'UNAUTHENTICATED');
    }

    const response = await fetch('/api/memory', {
      headers: {
        'X-User-Id': user.uid
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Convert ISO strings back to Date objects
    if (data.lastUpdated) {
      data.lastUpdated = new Date(data.lastUpdated);
    }

    if (data.topics) {
      Object.values(data.topics).forEach((topic: any) => {
        if (topic.lastAccessed) {
          topic.lastAccessed = new Date(topic.lastAccessed);
        }
      });
    }

    if (data.seriesProgress) {
      Object.values(data.seriesProgress).forEach((progress: any) => {
        if (progress.lastAccessed) {
          progress.lastAccessed = new Date(progress.lastAccessed);
        }
      });
    }

    return data;
  } catch (error: unknown) {
    throw new MemoryError(
      `Failed to load user memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      (error as { code?: string })?.code
    );
  }
}

/**
 * Saves a user's memory data via the API
 * @param memory - The memory object to save
 * @throws {MemoryError} If the API operation fails
 */
export async function saveUserMemory(memory: Partial<UserMemory>): Promise<void> {
  try {
    const auth = getAuth(firebaseApp);
    const user = auth.currentUser;
    if (!user) {
      throw new MemoryError('User not authenticated', 'UNAUTHENTICATED');
    }

    // Validate memory structure before saving
    validateMemoryStructure(memory);

    const response = await fetch('/api/memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user.uid
      },
      body: JSON.stringify(memory)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error: unknown) {
    throw new MemoryError(
      `Failed to save user memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
      (error as { code?: string })?.code
    );
  }
}

/**
 * Validates the structure of a memory object
 * @param memory - The memory object to validate
 * @throws {MemoryError} If the memory structure is invalid
 */
function validateMemoryStructure(memory: Partial<UserMemory>): void {
  // Ensure topics have required fields
  if (memory.topics) {
    for (const [topicId, topic] of Object.entries(memory.topics)) {
      if (!topic.name || !topic.lastAccessed || typeof topic.timesAccessed !== 'number') {
        throw new MemoryError(
          `Invalid topic structure for topic ${topicId}`,
          'INVALID_STRUCTURE'
        );
      }
    }
  }

  // Ensure series progress has required fields
  if (memory.seriesProgress) {
    for (const [seriesId, progress] of Object.entries(memory.seriesProgress)) {
      if (
        typeof progress.currentEpisode !== 'number' ||
        typeof progress.totalEpisodes !== 'number' ||
        !progress.lastAccessed ||
        typeof progress.completed !== 'boolean'
      ) {
        throw new MemoryError(
          `Invalid series progress structure for series ${seriesId}`,
          'INVALID_STRUCTURE'
        );
      }
    }
  }
}

export async function saveResearch(uid: string, research: ResearchResult): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid, 'research', new Date().toISOString());
    await setDoc(docRef, {
      ...research,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error saving research:', error);
    throw error;
  }
} 