import * as React from 'react';
import { loadUserMemory, saveUserMemory, UserMemory, MemoryError } from '@/lib/memoryHelpers';
import { useAuth } from '@/context/AuthContext';

/**
 * Return type for the useMemory hook
 */
interface UseMemoryReturn {
  memory: UserMemory | null;
  isLoading: boolean;
  error: string | null;
  updateMemory: (updates: Partial<UserMemory>) => Promise<void>;
  reloadMemory: () => Promise<void>;
}

/**
 * Hook for managing user memory state
 * @throws {Error} If used outside of AuthProvider or without a logged-in user
 */
export function useMemory(): UseMemoryReturn {
  const { user } = useAuth();
  if (!user) throw new Error('useMemory requires an authenticated user');

  const [memory, setMemory] = React.useState<UserMemory | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Loads user memory from Firestore
   */
  const reloadMemory = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loadUserMemory(user.uid);
      setMemory(data);
    } catch (err) {
      const message = err instanceof MemoryError ? err.message : 'Failed to load memory';
      setError(message);
      setMemory(null);
    } finally {
      setIsLoading(false);
    }
  }, [user.uid]);

  /**
   * Updates user memory with new data
   * @param updates - Partial memory object to merge with existing data
   */
  const updateMemory = React.useCallback(async (updates: Partial<UserMemory>) => {
    if (!memory) throw new Error('No memory loaded');

    const merged = {
      ...memory,
      ...updates,
      lastUpdated: new Date()
    };

    setIsLoading(true);
    setError(null);
    try {
      await saveUserMemory(user.uid, merged);
      setMemory(merged);
    } catch (err) {
      const message = err instanceof MemoryError ? err.message : 'Failed to update memory';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [memory, user.uid]);

  // Load memory on mount
  React.useEffect(() => {
    reloadMemory();
  }, [reloadMemory]);

  return {
    memory,
    isLoading,
    error,
    updateMemory,
    reloadMemory
  };
} 