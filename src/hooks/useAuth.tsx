'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { onAuthStateChanged, setPersistence, browserLocalPersistence, User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/useToast';
import { createOrFetchUser, FirestoreUser } from '@/lib/firestoreUser';

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  // Add Firestore user data
  firestoreData?: FirestoreUser;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Convert Firebase user to our User type
function formatUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    emailVerified: firebaseUser.emailVerified,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasFetchedUser, setHasFetchedUser] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const previousAuthState = React.useRef<boolean>(false);

  // Effect to fetch Firestore user data
  React.useEffect(() => {
    async function fetchUserData() {
      // Remove emailVerified check since Google users are pre-verified
      if (user && !hasFetchedUser) {
        try {
          const firestoreData = await createOrFetchUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
          });
          setUser(currentUser => currentUser ? {
            ...currentUser,
            firestoreData
          } : null);
          setHasFetchedUser(true);
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load user data. Please refresh the page.',
            variant: 'error'
          });
        }
      }
    }

    fetchUserData();
  }, [user?.uid, user?.email, user?.displayName, hasFetchedUser, toast]);

  // Set up Firebase persistence and auth state listener
  React.useEffect(() => {
    // Enable persistent auth state
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error('Error setting persistence:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize authentication. Please refresh the page.',
        variant: 'error'
      });
    });

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Check if this is a sign-out after being signed in
      const isSignOut = previousAuthState.current && !firebaseUser;
      
      if (firebaseUser) {
        // User is signed in
        setUser(formatUser(firebaseUser));
        previousAuthState.current = true;
        // Reset hasFetchedUser on new sign in
        setHasFetchedUser(false);

        // If email is not verified, redirect to verification page
        if (!firebaseUser.emailVerified) {
          router.replace('/email-verification');
        }
      } else {
        // User is signed out
        setUser(null);
        setHasFetchedUser(false);
        if (isSignOut) {
          // Only set session expired if it was a sign-out after being signed in
          localStorage.setItem('sessionExpired', 'true');
          router.replace('/sign-in');
        }
      }
      setIsLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      toast({
        title: 'Authentication Error',
        description: 'There was a problem with your authentication. Please sign in again.',
        variant: 'error'
      });
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [router, toast]);

  // Sign out function
  const signOut = React.useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setHasFetchedUser(false);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'error'
      });
    }
  }, [router, toast]);

  const value = React.useMemo(
    () => ({
      user,
      setUser,
      isLoading,
      signOut,
    }),
    [user, isLoading, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 