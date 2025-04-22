'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignUpWithGoogleButton } from '@/components/auth/SignUpWithGoogleButton';
import { SignUpWithFacebookButton } from '@/components/auth/SignUpWithFacebookButton';
import { InputField } from '@/components/ui/InputField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebaseClient';
import { createUserWithEmailAndPassword, sendEmailVerification, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { useToast } from '@/hooks/useToast';

export default function SignUpPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const { toast } = useToast();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      setError('');

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Send verification email
      await sendEmailVerification(userCredential.user);
      
      // Update auth context with the new user
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        emailVerified: userCredential.user.emailVerified,
      });

      // Show success toast
      toast({
        title: 'Success',
        description: 'Please check your email to verify your account',
        variant: 'success'
      });

      // Redirect to email verification page
      router.push('/email-verification');
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setError(err.message || 'Failed to create account');
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
            Create your account{' '}
            <span className="inline-block animate-pulse">✨</span>
          </h1>
          <p className="text-lg text-textSecondary">
            Start your AI-powered podcasting journey today.
          </p>
        </div>

        {/* Social Sign-Up Buttons */}
        <div className="space-y-4">
          <SignUpWithGoogleButton />
          <SignUpWithFacebookButton />
        </div>

        {/* Divider */}
        <div className="relative flex items-center text-sm text-muted">
          <div className="flex-grow border-t border-muted" />
          <span className="px-3">or</span>
          <div className="flex-grow border-t border-muted" />
        </div>

        {/* Email Registration Form */}
        <form onSubmit={handleEmailSignUp} className="space-y-6">
          <InputField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            aria-label="Email address"
          />
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            aria-label="Password"
          />
          <InputField
            id="confirm-password"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            aria-label="Confirm password"
          />
          
          {error && (
            <p className="text-sm text-red-500 text-center" role="alert">
              {error}
            </p>
          )}

          <PrimaryButton
            type="submit"
            disabled={isLoading}
            className="w-full"
            aria-label="Create account"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </PrimaryButton>
        </form>

        {/* Terms & Privacy Notice */}
        <p className="text-xs text-muted text-center mt-4">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-accent hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-accent hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Sign In Link */}
        <p className="text-sm text-textSecondary text-center">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-accent hover:underline">
            Sign in here
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