'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import Link from 'next/link';

export default function EmailVerificationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [email, setEmail] = React.useState<string | null>(null);

  const oobCode = searchParams.get('oobCode');
  const mode = searchParams.get('mode');

  React.useEffect(() => {
    if (!oobCode) {
      setError('Invalid verification link');
      return;
    }

    // Verify the action code and get the email
    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
      })
      .catch((error) => {
        console.error('Error verifying code:', error);
        setError('This link is invalid or has expired. Please request a new one.');
      });
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push('/sign-in');
      }, 2000);
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to reset password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-textPrimary">
        <div className="max-w-md w-full mx-auto px-4 py-12 space-y-8 text-center">
          <div className="space-y-4">
            <h1 className="text-3xl font-display text-red-500">
              Error 
              <span role="img" aria-label="error" className="ml-2">❌</span>
            </h1>
            <p className="text-textSecondary">{error}</p>
            <Link 
              href="/forgot-password"
              className="text-accent hover:underline block mt-4"
            >
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Verifying...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-textPrimary">
      <div className="max-w-md w-full mx-auto px-4 py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-display text-textPrimary">
            Reset Password
            <span role="img" aria-label="lock" className="ml-2">🔒</span>
          </h1>
          <p className="text-textSecondary">
            Enter your new password for <strong>{email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="new-password"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            required
            disabled={loading || success}
          />

          <InputField
            id="confirm-password"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            required
            disabled={loading || success}
          />

          {error && (
            <p className="text-sm text-red-500 text-center" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-green-500 text-center" role="alert">
              Password reset successful! Redirecting to sign in...
            </p>
          )}

          <PrimaryButton
            type="submit"
            disabled={loading || success}
            className="w-full"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </PrimaryButton>
        </form>

        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/2 translate-y-1/2 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
}

// We need to move metadata to a separate file since this is a client component
// Create a new file: src/app/email-verification/metadata.ts 