// Copilot: Sign-in page using Clerk's <SignIn /> component
// Proper catch-all routing with custom appearance configuration
// Redirects to dashboard after successful sign-in

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
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
            Sign in to your account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back to the Control Plane
          </p>
        </div>
        <SignIn
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
