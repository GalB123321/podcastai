'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebaseClient';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  // Redirect if no user
  React.useEffect(() => {
    if (!user) {
      router.push('/sign-in');
    }
  }, [user, router]);

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;

    try {
      setIsLoading(true);
      setError('');
      await sendEmailVerification(auth.currentUser);
      setSuccess(true);
    } catch (err) {
      console.error('Error sending verification email:', err);
      setError(err instanceof Error ? err.message : 'Failed to send verification email');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-textPrimary">
      <div className="max-w-lg mx-auto py-20 px-6 text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-4xl font-display text-textPrimary">
            Check your inbox{' '}
            <span className="inline-block animate-bounce">📩</span>
          </h1>
          <p className="text-lg text-textSecondary">
            We've sent you a verification link to{' '}
            <span className="font-medium text-textPrimary">{user.email}</span>
          </p>
        </div>

        {/* Verification Status */}
        {!user.emailVerified && (
          <div className="space-y-6">
            <div className="bg-surface/50 border border-muted rounded-lg p-4">
              <p className="text-sm text-textSecondary">
                Haven't received the email? Check your spam folder or click below to resend.
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500" role="alert">
                {error}
              </p>
            )}

            {success && (
              <p className="text-sm text-green-500" role="alert">
                Verification email sent again! Please check your inbox.
              </p>
            )}

            <PrimaryButton
              onClick={handleResendEmail}
              disabled={isLoading || success}
              className="w-full sm:w-auto"
            >
              {isLoading ? 'Sending...' : 'Resend verification email'}
            </PrimaryButton>
          </div>
        )}

        {/* Navigation Links */}
        <div className="space-y-2">
          <Link 
            href="/dashboard"
            className="text-accent hover:underline text-sm block"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/sign-in"
            className="text-muted hover:text-accent text-sm block"
          >
            Sign in with a different account
          </Link>
        </div>

        {/* Gen Z Mode Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/2 translate-y-1/2 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
} 