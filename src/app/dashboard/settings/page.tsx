// Copilot: Organization settings page (admin only)
// Protected with requireRole(['org:admin'])
// Uses Clerk's <OrganizationProfile /> component

import { OrganizationProfile } from '@clerk/nextjs';
import { requireRole } from '@/lib/org-context';

export default async function SettingsPage() {
  // Require admin role
  await requireRole(['org:admin']);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Organization Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage organization members, roles, and settings
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <OrganizationProfile
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-none',
            },
          }}
        />
      </div>
    </div>
  );
}
