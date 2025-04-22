'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebaseClient';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function SignUpWithGoogleButton() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the user's ID token
      const idToken = await result.user.getIdToken();
      
      // Update auth context with user data
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified
      });

      // Store the token
      localStorage.setItem('authToken', idToken);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Google sign-up error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <PrimaryButton
        onClick={handleGoogleSignUp}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
        aria-label="Sign up with Google"
      >
        <FaGoogle className="w-5 h-5" />
        <span>{isLoading ? 'Signing up...' : 'Sign up with Google'}</span>
      </PrimaryButton>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
} 