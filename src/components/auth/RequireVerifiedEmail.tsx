'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function RequireVerifiedEmail({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/sign-in');
      } else if (!user.emailVerified) {
        router.push('/email-verification');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  if (!user.emailVerified) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
} 