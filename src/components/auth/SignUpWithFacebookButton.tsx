'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FaFacebook } from 'react-icons/fa';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebaseClient';
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';

export function SignUpWithFacebookButton() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleFacebookSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Get the user's ID token
      const idToken = await result.user.getIdToken();

      // Update auth context with user data
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      });

      // Store the token
      localStorage.setItem('authToken', idToken);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Facebook sign-up error:', err);
      let errorMessage = 'Failed to sign up with Facebook';
      
      if (err instanceof Error) {
        if (err.message.includes('popup-closed-by-user')) {
          errorMessage = 'Sign up cancelled';
        } else if (err.message.includes('account-exists')) {
          errorMessage = 'An account already exists with this email';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <PrimaryButton
        onClick={handleFacebookSignUp}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#1874E8] text-white dark:bg-[#1877F2] dark:hover:bg-[#1874E8] dark:text-white border-none"
        aria-label="Sign up with Facebook"
      >
        <FaFacebook className="w-5 h-5" />
        <span>{isLoading ? 'Signing up...' : 'Sign up with Facebook'}</span>
      </PrimaryButton>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
} 