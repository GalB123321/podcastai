import { useState, useEffect } from 'react';
import { db } from '@/lib/firebaseClient';
import { doc, onSnapshot } from 'firebase/firestore';

interface EpisodeStats {
  listens: number;
  published?: {
    spotify?: {
      id: string;
      url: string;
      date: string;
    };
  };
}

export function useEpisodeAnalytics(id: string) {
  const [stats, setStats] = useState<EpisodeStats | null>(null);

  useEffect(() => {
    if (!id) return;

    const unsubscribe = onSnapshot(
      doc(db, 'episodes', id),
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setStats({
            listens: data.listens || 0,
            published: data.published
          });
        }
      },
      (error) => {
        console.error('Error fetching episode stats:', error);
      }
    );

    return () => unsubscribe();
  }, [id]);

  return stats;
} 