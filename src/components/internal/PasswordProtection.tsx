import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PASSWORD = 'AAA';
const STORAGE_KEY = 'internal_auth';

export function PasswordProtection({ children }: PasswordProtectionProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedAuth = sessionStorage.getItem(STORAGE_KEY);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-emerald-500">Internal Access</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter the password to access internal tools
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              error={error}
              className="w-full"
              autoFocus
            />
          </div>

          <PrimaryButton
            type="submit"
            className="w-full"
          >
            Access Internal Tools
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
} 