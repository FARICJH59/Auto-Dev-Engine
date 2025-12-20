// Copilot: Dashboard home page
// Shows welcome message, organization overview, and quick actions

import { clerkClient } from '@clerk/nextjs/server';
import { requireOrg } from '@/lib/org-context';

export default async function DashboardPage() {
  const context = await requireOrg();
  
  // Get user and organization details
  const client = await clerkClient();
  const user = await client.users.getUser(context.userId);
  const organization = await client.organizations.getOrganization({
    organizationId: context.orgId,
  });
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: context.orgId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome back, {user.firstName || 'User'}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here&apos;s an overview of your organization and recent activity.
        </p>
      </div>

      {/* Organization Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Organization Overview
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Organization Name
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {organization.name}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Organization ID
            </div>
            <div className="text-sm font-mono text-gray-900 dark:text-white">
              {context.orgId}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Your Role
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {context.orgRole.replace('org:', '').charAt(0).toUpperCase() +
                context.orgRole.replace('org:', '').slice(1)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Total Members
            </div>
            <div className="text-lg font-medium text-gray-900 dark:text-white">
              {memberships.data.length}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <a
            href="/dashboard/projects"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition"
          >
            <svg
              className="w-8 h-8 text-primary mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Create Project
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Start a new project
            </p>
          </a>
          <a
            href="/dashboard/executions"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition"
          >
            <svg
              className="w-8 h-8 text-primary mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Run Execution
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Execute a workflow
            </p>
          </a>
          <a
            href="/dashboard/api-keys"
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary hover:bg-primary/5 transition"
          >
            <svg
              className="w-8 h-8 text-primary mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Generate API Key
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create API access key
            </p>
          </a>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No recent activity to display</p>
          <p className="text-sm mt-2">Activity will appear here once you start using the platform</p>
        </div>
      </div>
    </div>
  );
}
