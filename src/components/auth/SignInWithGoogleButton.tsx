'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { FaGoogle } from 'react-icons/fa';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';

export function SignInWithGoogleButton() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign in with Google');
      }

      // Update auth context with user data
      setUser(data.user);

      // Store the token in localStorage or a secure cookie
      localStorage.setItem('authToken', data.token);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <PrimaryButton
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white border border-gray-300 dark:border-gray-600"
      >
        <FaGoogle className="w-5 h-5" />
        <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
      </PrimaryButton>

      {error && (
        <p className="mt-2 text-sm text-red-500 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
} 