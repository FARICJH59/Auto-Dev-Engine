// Copilot: API Keys management page
// Shows user-scoped API keys from Clerk
// Instructions for API usage and scope selection

'use client';

import { useState } from 'react';

export default function APIKeysPage() {
  const [showSecret, setShowSecret] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            API Keys
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your API keys for programmatic access
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
          Create API Key
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          How to use API Keys
        </h2>
        <div className="space-y-2 text-sm text-blue-900 dark:text-blue-100">
          <p>1. Create an API key with appropriate scopes for your use case</p>
          <p>2. Include the key in your request headers:</p>
          <code className="block mt-2 p-3 bg-blue-100 dark:bg-blue-900/40 rounded text-xs font-mono">
            Authorization: Bearer YOUR_API_KEY
          </code>
          <p className="mt-2">3. Your requests will automatically use your organization context</p>
        </div>
      </div>

      {/* API Keys List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Your API Keys
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
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No API keys yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first API key for programmatic access
          </p>
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
            Create Your First API Key
          </button>
        </div>

        {/* Example API Key Entry (hidden by default) */}
        <div className="hidden space-y-4">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Production Key</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Created on Jan 1, 2024
                </p>
              </div>
              <button className="text-red-600 hover:text-red-700 text-sm">Revoke</button>
            </div>
            <div className="flex items-center space-x-2">
              <code className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded font-mono text-sm">
                {showSecret ? 'sk_test_1234567890abcdef' : '••••••••••••••••'}
              </code>
              <button
                onClick={() => copyToClipboard('sk_test_1234567890abcdef', 'key-1')}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
              >
                {copiedKey === 'key-1' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Scopes: read:projects, write:executions
            </div>
          </div>
        </div>

        {/* Scope Selection Guide */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Available Scopes</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <code className="text-xs">read:projects</code> - Read project data</li>
            <li>• <code className="text-xs">write:projects</code> - Create and modify projects</li>
            <li>• <code className="text-xs">read:executions</code> - Read execution data</li>
            <li>• <code className="text-xs">write:executions</code> - Create and run executions</li>
          </ul>
        </div>
      </div>

      {/* Example Usage */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Example Usage
        </h2>
        <pre className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm overflow-x-auto">
          <code className="text-gray-900 dark:text-gray-100">{`curl -X GET https://api.example.com/v1/projects \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
        </pre>
      </div>
    </div>
  );
}
