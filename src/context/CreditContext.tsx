'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebaseClient';

interface CreditContextType {
  credits: number | null;
  setCredits: (credits: number) => void;
  isLoading: boolean;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  // Set up real-time listener for credits
  useEffect(() => {
    if (!user?.uid) {
      setCredits(null);
      setIsLoading(false);
      return;
    }

    // Initialize credits from user.firestoreData if available
    if (user.firestoreData?.credits !== undefined) {
      setCredits(user.firestoreData.credits);
      setIsLoading(false);
    }

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (doc) => {
        if (doc.exists()) {
          setCredits(doc.data().credits);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to credits:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.firestoreData?.credits]);

  const value = React.useMemo(
    () => ({
      credits,
      setCredits,
      isLoading
    }),
    [credits, isLoading]
  );

  return <CreditContext.Provider value={value}>{children}</CreditContext.Provider>;
}

export function useCreditsContext() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCreditsContext must be used within a CreditProvider');
  }
  return context;
} 