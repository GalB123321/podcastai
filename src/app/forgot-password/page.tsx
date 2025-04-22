'use client';

import * as React from 'react';
import Link from 'next/link';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { auth } from '@/lib/firebaseClient';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  // Check Firebase initialization
  React.useEffect(() => {
    try {
      // Just checking if auth is properly initialized
      if (!auth) throw new Error('Firebase Auth not initialized');
    } catch (err) {
      console.error('Firebase initialization error:', err);
      setInitError('Failed to initialize authentication. Please try again later.');
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err instanceof Error) {
        // Handle specific Firebase errors
        if (err.message.includes('auth/invalid-email')) {
          setError('Please enter a valid email address');
        } else if (err.message.includes('auth/user-not-found')) {
          setError('No account found with this email');
        } else if (err.message.includes('auth/network-request-failed')) {
          setError('Network error. Please check your connection and try again.');
        } else if (err.message.includes('auth/too-many-requests')) {
          setError('Too many attempts. Please try again later.');
        } else if (err.message.includes('auth/api-key-not-valid')) {
          setError('Authentication service is temporarily unavailable. Please try again later.');
          console.error('Firebase API key error. Please check environment configuration.');
        } else {
          setError('Failed to send reset email. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-textPrimary">
        <div className="max-w-md w-full mx-auto px-4 py-12 space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-display text-red-500">
              Service Unavailable
              <span role="img" aria-label="error" className="ml-2">⚠️</span>
            </h1>
            <p className="text-textSecondary">{initError}</p>
            <Link 
              href="/sign-in"
              className="text-accent hover:underline block mt-4"
            >
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-textPrimary">
      <div className="max-w-md w-full mx-auto px-4 py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-display text-textPrimary mb-2">
            Reset your password{' '}
            <span role="img" aria-label="lock">🔒</span>
          </h1>
          <p className="text-textSecondary mb-6 text-sm">
            We'll send you a link to reset it.
          </p>
        </div>

        {/* Password Reset Form */}
        <form onSubmit={handleReset} className="space-y-6">
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            aria-label="Email"
            disabled={loading || success}
            error={error}
          />
          
          {error && (
            <p className="text-sm text-red-500 text-center" role="alert">
              {error}
            </p>
          )}
          
          {success && (
            <p className="text-sm text-green-500 text-center" role="alert">
              Reset email sent! Check your inbox for further instructions.
            </p>
          )}

          <PrimaryButton
            type="submit"
            disabled={loading || success}
            className="w-full"
            aria-label="Send password reset link"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </PrimaryButton>
        </form>

        {/* Back to Sign In Link */}
        <p className="text-xs text-muted text-center">
          Remembered your password?{' '}
          <Link href="/sign-in" className="text-accent hover:underline">
            Go back
          </Link>
        </p>

        {/* Gen Z Mode Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/2 translate-y-1/2 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
} 