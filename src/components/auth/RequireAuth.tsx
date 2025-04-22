'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { useToast } from '@/hooks/useToast';

export interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireVerified?: boolean;
}

export function RequireAuth({ 
  children, 
  redirectTo = '/sign-in',
  requireVerified = true 
}: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Check if this was due to session expiry
        const sessionExpired = localStorage.getItem('sessionExpired');
        if (sessionExpired) {
          localStorage.removeItem('sessionExpired');
          toast({
            title: 'Session expired',
            description: 'Please sign in again to continue.',
            variant: 'error'
          });
        }
        router.replace(redirectTo);
      } else if (requireVerified && !user.emailVerified) {
        // Redirect to email verification if email is not verified
        router.replace('/email-verification');
      }
    }
  }, [user, isLoading, router, redirectTo, toast, requireVerified]);

  // Show loading screen while checking auth state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If not authenticated, render nothing (redirect will happen)
  if (!user) {
    return null;
  }

  // If email verification is required but not verified, render nothing
  if (requireVerified && !user.emailVerified) {
    return null;
  }

  // If all checks pass, render children
  return <>{children}</>;
} 