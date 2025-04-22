'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from '@/components/auth/SignOutButton';
import { useAuth } from '@/hooks/useAuth';
import { 
  HomeIcon, 
  MicrophoneIcon, 
  ChartBarIcon, 
  CogIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: HomeIcon },
  { href: '/dashboard/episodes', label: 'Episodes', icon: MicrophoneIcon },
  { href: '/dashboard/analytics', label: 'Analytics', icon: ChartBarIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: CogIcon },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border">
        <div className="h-full flex flex-col">
          <div className="p-4">
            <Link href="/dashboard" className="text-2xl font-display text-textPrimary">
              PodcastAI
            </Link>
          </div>
          
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-primary text-white' 
                          : 'text-textSecondary hover:bg-surface-hover'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b border-border bg-surface sticky top-0 z-10">
          <div className="h-full px-6 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-textPrimary">Dashboard</h1>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <UserCircleIcon className="w-8 h-8 text-textSecondary" />
                <div>
                  <p className="text-sm font-medium text-textPrimary">
                    {user?.email}
                  </p>
                </div>
              </div>
              <SignOutButton />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
} 