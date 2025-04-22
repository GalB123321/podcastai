import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';
import { useToast } from '@/hooks/useToast';
import { CreditContext } from '@/context/CreditContext';
import { deductCredits as deductCreditsFromDb, addCredits as addCreditsToDb } from '@/lib/creditUtils';

export interface UseCreditsReturn {
  credits: number;
  loading: boolean;
  error: Error | null;
  spendCredits: (amount: number) => Promise<boolean>;
  addCredits: (amount: number) => Promise<boolean>;
}

/**
 * Hook for managing user credits
 * Handles spending and adding credits with optimistic updates and error handling
 */
export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          setCredits(doc.data()?.credits || 0);
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const spendCredits = async (amount: number): Promise<boolean> => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be signed in to spend credits',
        variant: 'error'
      });
      return false;
    }

    if (!credits || credits < amount) {
      toast({
        title: 'Not enough credits',
        description: 'Please upgrade your plan or purchase more credits',
        variant: 'error'
      });
      return false;
    }

    const previousCredits = credits;
    
    try {
      // Optimistic update
      setCredits(credits - amount);
      
      // Actual update
      await deductCreditsFromDb(user.uid, amount);
      return true;
    } catch (error) {
      // Rollback on error
      setCredits(previousCredits);
      console.error('Error spending credits:', error);
      toast({
        title: 'Error',
        description: 'Failed to spend credits. Please try again.',
        variant: 'error'
      });
      return false;
    }
  };

  const addMoreCredits = async (amount: number): Promise<boolean> => {
    if (!user?.uid) {
      toast({
        title: 'Error',
        description: 'You must be signed in to add credits',
        variant: 'error'
      });
      return false;
    }

    if (amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Credit amount must be greater than 0',
        variant: 'error'
      });
      return false;
    }

    const previousCredits = credits;
    try {
      // Optimistic update
      setCredits(credits ? credits + amount : amount);
      
      // Actual update
      await addCreditsToDb(user.uid, amount);
      return true;
    } catch (error) {
      // Rollback on error
      setCredits(previousCredits);
      console.error('Error adding credits:', error);
      toast({
        title: 'Error',
        description: 'Failed to add credits. Please try again.',
        variant: 'error'
      });
      return false;
    }
  };

  return { 
    credits, 
    loading, 
    error,
    spendCredits,
    addCredits: addMoreCredits
  };
}