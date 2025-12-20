// Copilot: Sign-up page using Clerk's <SignUp /> component
// Proper catch-all routing with custom appearance configuration
// Redirects to organization selection after successful sign-up

import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md">
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
            Create your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get started with the Control Plane
          </p>
        </div>
        <SignUp
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
