// Copilot: Organization selection page
// Uses <OrganizationList /> component for creating/joining organizations
// Handles redirect_url query parameter for post-selection navigation

import { OrganizationList } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SelectOrganizationPage(props: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { userId, orgId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect('/sign-in');
  }

  // If user already has an organization, redirect to dashboard or specified URL
  if (orgId) {
    const redirectUrl = searchParams.redirect_url || '/dashboard';
    redirect(redirectUrl);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl">
              Q
            </div>
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              QGPS
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Select an organization
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose an organization to continue or create a new one
          </p>
        </div>
        <OrganizationList
          afterCreateOrganizationUrl={searchParams.redirect_url || '/dashboard'}
          afterSelectOrganizationUrl={searchParams.redirect_url || '/dashboard'}
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-lg',
            },
          }}
        />
      </div>
    </div>
  );
}
