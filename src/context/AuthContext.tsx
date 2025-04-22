'use client';

import React, { createContext, useState, useEffect, useContext, useRef, useMemo } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import firebaseApp from '@/lib/firebase';
import { db } from '@/lib/firebaseClient';
import type { PlanTier } from '@/lib/planAccess';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/useToast';

// Comprehensive user shape
export interface User {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified?: boolean;
  plan?: PlanTier;
  credits?: number;
  planTier?: PlanTier;
  lastTokenRefresh?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  refreshToken: () => Promise<string | null>;
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  setUser: () => {},
  refreshToken: async () => null,
  isInitialized: false,
});

/**
 * Provider component for authentication state
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const tokenCheckInterval = useRef<NodeJS.Timeout | null>(null);

  const handleSignOut = async (message?: string) => {
    const auth = getAuth(firebaseApp);
    try {
      await auth.signOut();
    } catch (error) {
      console.error('[AuthContext] Sign out error:', error);
    }
    setUser(null);
    localStorage.removeItem('token');
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (message) {
      toast({
        title: "Session Expired",
        description: message,
        variant: "error",
      });
    }
    router.push('/sign-in');
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const auth = getAuth(firebaseApp);
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        console.log('[AuthContext] No user found during token refresh');
        return null;
      }

      // Always force a token refresh
      console.log('[AuthContext] Forcing token refresh');
      const newToken = await currentUser.getIdToken(true);
      
      // Get token result to check expiration
      const result = await currentUser.getIdTokenResult();
      const expirationTime = new Date(result.expirationTime).getTime();
      const now = new Date().getTime();
      
      // If token is already expired, return null
      if (expirationTime <= now) {
        console.log('[AuthContext] Token is expired');
        return null;
      }
      
      // Store the new token
      localStorage.setItem('token', newToken);
      console.log('[AuthContext] Token refreshed successfully');
      
      return newToken;
    } catch (error) {
      console.error('[AuthContext] Token refresh error:', error);
      return null;
    }
  };

  useEffect(() => {
    const auth = getAuth(firebaseApp);
    let authInitialized = false;

    // Set up periodic token refresh (every 2 minutes)
    tokenCheckInterval.current = setInterval(async () => {
      if (auth.currentUser && isInitialized) {
        console.log('[AuthContext] Running periodic token refresh');
        const token = await refreshToken();
        if (!token) {
          console.log('[AuthContext] Periodic refresh failed, signing out');
          await handleSignOut('Your session has expired. Please sign in again.');
        }
      }
    }, 120000); // 2 minutes

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // Mark auth as initialized
        if (!authInitialized) {
          authInitialized = true;
          setIsInitialized(true);
        }

        if (firebaseUser) {
          console.log('[AuthContext] Auth state changed - user signed in:', firebaseUser.uid);
          
          // Initial token refresh
          const token = await refreshToken();
          if (!token) {
            console.error('[AuthContext] Failed to get initial token');
            await handleSignOut('Authentication failed. Please sign in again.');
            return;
          }

          // Check email verification
          if (!firebaseUser.emailVerified) {
            toast({
              title: "Email not verified",
              description: "Please check your email and verify your account",
              variant: "error",
            });
          }

          // Set up Firestore listener for user data
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeRef.current = onSnapshot(userDocRef, 
            (doc) => {
              if (doc.exists()) {
                const userData = doc.data();
                setUser({
                  ...firebaseUser,
                  credits: userData.credits || 0,
                  planTier: userData.planTier,
                  lastTokenRefresh: Date.now(),
                });
              } else {
                setUser(firebaseUser);
              }
            },
            (error) => {
              console.error('[AuthContext] Firestore listener error:', error);
              // Don't sign out for Firestore errors
            }
          );
        } else {
          console.log('[AuthContext] Auth state changed - user signed out');
          setUser(null);
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error('[AuthContext] Auth state change error:', error);
        await handleSignOut('Authentication error. Please sign in again.');
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
    };
  }, [toast, router]);

  const value = useMemo(() => ({
    user,
    loading,
    signOut: () => handleSignOut(),
    setUser,
    refreshToken,
    isInitialized,
  }), [user, loading, isInitialized]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook for accessing authentication state
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider; 