'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInWithGoogleButton } from '@/components/auth/SignInWithGoogleButton';
import { SignInWithFacebookButton } from '@/components/auth/SignInWithFacebookButton';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebaseClient';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useEffect } from 'react';
import { useToast } from '@/hooks/useToast';

export default function SignInPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { toast } = useToast();

  useEffect(() => {
    // Check for session expiry flag
    const sessionExpired = localStorage.getItem('sessionExpired');
    if (sessionExpired) {
      localStorage.removeItem('sessionExpired');
      toast({
        title: 'Session expired',
        description: 'Please sign in again to continue.',
        variant: 'error'
      });
    }
  }, [toast]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // Update auth context with user data
      setUser({
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        emailVerified: result.user.emailVerified
      });

      // If email is not verified, redirect to verification page
      if (!result.user.emailVerified) {
        router.push('/email-verification');
      } else {
        // Otherwise, redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Email sign-in error:', err);
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-textPrimary">
      <div className="max-w-md w-full px-4 py-12 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-display text-textPrimary">
            Welcome back{' '}
            <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-lg text-textSecondary">
            Choose a sign-in method to continue.
          </p>
        </div>

        {/* Social Sign-In Buttons */}
        <div className="space-y-4">
          <SignInWithGoogleButton />
          <SignInWithFacebookButton />
        </div>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="h-px flex-1 bg-muted" />
          <span className="text-sm text-muted">or</span>
          <div className="h-px flex-1 bg-muted" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
          
          <div className="text-right">
            <Link 
              href="/forgot-password" 
              className="text-sm text-accent hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 text-center" role="alert">
              {error}
            </p>
          )}

          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </PrimaryButton>

          <p className="text-sm text-center text-textSecondary">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-accent hover:underline">
              Sign up
            </Link>
          </p>
        </form>

        {/* Terms & Privacy Notice */}
        <div className="text-xs text-muted text-center mt-4">
          By signing in, you agree to our{' '}
          <Link href="/terms" className="text-accent hover:underline">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </div>

        {/* Back Link */}
        <div className="text-center">
          <Link 
            href="/"
            className="text-muted hover:text-accent text-sm inline-flex items-center gap-1"
          >
            <span aria-hidden="true">←</span> Back to Home
          </Link>
        </div>

        {/* Gen Alpha Mode Decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-64 h-64 translate-x-1/2 translate-y-1/2 bg-primary/5 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
} 