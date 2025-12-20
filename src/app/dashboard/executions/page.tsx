// Copilot: Executions page
// Protected route using requireOrg()
// Shows executions list with quota tracking

import { requireOrg } from '@/lib/org-context';

export default async function ExecutionsPage() {
  await requireOrg();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Executions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and manage workflow executions
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
          New Execution
        </button>
      </div>

      {/* Quota Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quota Usage
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Executions this month</span>
              <span className="font-medium text-gray-900 dark:text-white">0 / 1000</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-gray-400">Storage used</span>
              <span className="font-medium text-gray-900 dark:text-white">0 GB / 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Executions List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Executions
          </h2>
          <div className="flex space-x-2">
            <select className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm">
              <option>All Status</option>
              <option>Running</option>
              <option>Completed</option>
              <option>Failed</option>
            </select>
          </div>
        </div>

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
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No executions yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Start your first workflow execution
          </p>
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            Run First Execution
          </button>
        </div>

        {/* API Integration Notice */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>Note:</strong> Executions are quota-limited. API endpoint{' '}
            <code className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded">
              POST /api/executions
            </code>{' '}
            will return 402 Payment Required if quota is exceeded.
          </p>
        </div>
      </div>
    </div>
  );
}
