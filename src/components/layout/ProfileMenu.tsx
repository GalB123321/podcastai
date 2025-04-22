'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export function ProfileMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link href="/sign-in">
        <PrimaryButton>
          Sign in
        </PrimaryButton>
      </Link>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-accent rounded-full"
        aria-label="Open profile menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.photoURL ? (
          <Image
            src={user.photoURL}
            alt="Profile"
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            {user.displayName?.charAt(0) || user.email?.charAt(0) || '?'}
          </div>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-56 bg-surface border border-muted rounded-lg shadow-lg py-1 z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="profile-menu"
        >
          {/* User Info */}
          <div className="px-4 py-3 border-b border-muted">
            <p className="text-sm font-medium text-textPrimary truncate">
              {user.displayName || 'User'}
            </p>
            <p className="text-xs text-textSecondary truncate">
              {user.email}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-1" role="none">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-textPrimary hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Dashboard
            </Link>
            <Link
              href="/account"
              className="block px-4 py-2 text-sm text-textPrimary hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Account Settings
            </Link>
            <Link
              href="/credits"
              className="block px-4 py-2 text-sm text-textPrimary hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Credits & Billing
            </Link>
          </div>

          {/* Help Section */}
          <div className="py-1 border-t border-muted" role="none">
            <Link
              href="/help"
              className="block px-4 py-2 text-sm text-textPrimary hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Help Center
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-sm text-textPrimary hover:bg-muted transition-colors"
              onClick={() => setIsOpen(false)}
              role="menuitem"
            >
              Contact Support
            </Link>
          </div>

          {/* Sign Out */}
          <div className="py-1 border-t border-muted" role="none">
            <div className="px-4 py-2" role="menuitem">
              <SignOutButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 