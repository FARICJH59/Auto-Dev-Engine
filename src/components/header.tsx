// Copilot: Shared header component
// Used in dashboard layout with navigation and Clerk components

'use client';

import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              QGPS Control Plane
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <OrganizationSwitcher
              appearance={{
                elements: {
                  rootBox: 'flex items-center',
                  organizationSwitcherTrigger:
                    'px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700',
                },
              }}
              afterCreateOrganizationUrl="/dashboard"
              afterSelectOrganizationUrl="/dashboard"
            />
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'w-10 h-10',
                },
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
