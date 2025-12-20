// Copilot: Projects page
// Protected route using requireOrg()
// Shows projects list with API integration placeholder

import { requireOrg } from '@/lib/org-context';

export default async function ProjectsPage() {
  const context = await requireOrg();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Projects
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your organization&apos;s projects
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
          Create Project
        </button>
      </div>

      {/* Organization Context Display */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Organization Context:</strong> {context.orgId}
        </div>
        <div className="text-sm text-blue-900 dark:text-blue-100 mt-1">
          <strong>Your Role:</strong> {context.orgRole}
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          All Projects
        </h2>
        
        {/* Empty State */}
        <div className="text-center py-12">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Get started by creating your first project
          </p>
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            Create Your First Project
          </button>
        </div>

        {/* API Integration Notice */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> This page is ready for API integration. Projects will be fetched from{' '}
            <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
              GET /api/projects
            </code>{' '}
            with automatic organization context injection.
          </p>
        </div>
      </div>
    </div>
  );
}
