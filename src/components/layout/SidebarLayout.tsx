import { useState } from 'react';
import Link from 'next/link';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/podcasts', label: 'My Podcasts' },
    { href: '/favorites', label: 'Favorites' },
    { href: '/playlists', label: 'Playlists' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <div className="min-h-screen">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md"
        aria-label="Open sidebar"
      >
        <Bars3Icon className="w-6 h-6 text-gray-600" />
      </button>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50
          h-full w-64 bg-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static md:shadow-none
        `}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Close Button (Mobile) */}
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 p-2 text-gray-600 hover:text-gray-900"
          aria-label="Close sidebar"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="p-6">
          <Link 
            href="/" 
            className="text-xl font-bold text-gray-900"
            onClick={() => setIsSidebarOpen(false)}
          >
            PodcastAI
          </Link>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <ul className="space-y-2">
            {navigationItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="
                    block px-4 py-2 rounded-lg
                    text-gray-600 hover:text-gray-900
                    hover:bg-gray-50
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-colors duration-200
                  "
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Link
            href="/profile"
            className="
              flex items-center gap-3 px-4 py-2 rounded-lg
              hover:bg-gray-50
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
            "
            onClick={() => setIsSidebarOpen(false)}
          >
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div>
              <div className="font-medium text-gray-900">John Doe</div>
              <div className="text-sm text-gray-600">View Profile</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
} 