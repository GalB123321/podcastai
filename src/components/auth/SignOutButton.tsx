import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebaseClient';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/hooks/useAuth';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      localStorage.removeItem('authToken');
      setUser(null);
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PrimaryButton
      onClick={handleSignOut}
      disabled={isLoading}
      className="text-sm"
      variant="ghost"
    >
      {isLoading ? 'Signing out...' : 'Sign out'}
    </PrimaryButton>
  );
} 