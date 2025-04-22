'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import { ProfileMenu } from './ProfileMenu';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
}

export default function MainLayout({ children, hideHeader = false, hideFooter = false }: MainLayoutProps) {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <div className="bg-background text-textPrimary min-h-screen flex flex-col">
      {!hideHeader && (
        <header className="bg-surface/50 backdrop-blur-sm border-b border-muted/20">
          <nav className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Image
                  src="/logo.svg"
                  alt="PodcastAI Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-display text-textPrimary">
                  PodcastAI
                </span>
              </Link>
              
              <div className="hidden md:flex items-center gap-6">
                <Link href="/discover" className="text-textSecondary hover:text-textPrimary transition-colors">
                  Discover
                </Link>
                <Link href="/plans" className="text-textSecondary hover:text-textPrimary transition-colors">
                  Pricing
                </Link>
                <Link href="/features" className="text-textSecondary hover:text-textPrimary transition-colors">
                  Features
                </Link>
                <Link href="/blog" className="text-textSecondary hover:text-textPrimary transition-colors">
                  Blog
                </Link>
                <Link href="/contact" className="text-textSecondary hover:text-textPrimary transition-colors">
                  Contact
                </Link>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="btn-secondary">
                🌙
              </button>
              <button className="btn-secondary">
                ✨ Gen Alpha Mode
              </button>
              <ProfileMenu />
            </div>
          </nav>
        </header>
      )}

      <main className={cn("flex-1")}>
        {children}
      </main>

      {!hideFooter && (
        <footer className="bg-surface mt-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-display text-lg mb-4">About</h4>
                <p className="text-textSecondary">
                  Create amazing podcasts with AI assistance.
                </p>
              </div>
              <div>
                <h4 className="font-display text-lg mb-4">Quick Links</h4>
                <ul className="space-y-2">
                  <li>
                    <Link href="/features" className="text-textSecondary hover:text-accent">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="text-textSecondary hover:text-accent">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-textSecondary hover:text-accent">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-display text-lg mb-4">Contact</h4>
                <ul className="space-y-2">
                  <li>
                    <a href="mailto:support@podcastai.com" className="text-textSecondary hover:text-accent">
                      support@podcastai.com
                    </a>
                  </li>
                  <li>
                    <Link href="/help" className="text-textSecondary hover:text-accent">
                      Help Center
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-muted text-center text-textSecondary">
              <p>&copy; {new Date().getFullYear()} PodcastAI. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
} 