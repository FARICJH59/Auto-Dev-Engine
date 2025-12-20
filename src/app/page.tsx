// Copilot: Homepage with authentication buttons
// Shows SignInButton and SignUpButton when signed out
// Shows UserButton and dashboard link when signed in

import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
              Q
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              QGPS Control Plane
            </span>
          </div>
          <div className="flex items-center space-x-4">
            {userId ? (
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  Go to Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary transition">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                    Sign Up
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Quantum-Grade Processing System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Advanced control plane for managing projects, executions, and resources
            with enterprise-grade multi-tenant architecture.
          </p>
          {!userId && (
            <div className="flex justify-center space-x-4">
              <SignUpButton mode="modal">
                <button className="px-8 py-3 bg-primary text-white text-lg rounded-lg hover:bg-primary/90 transition">
                  Get Started
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="px-8 py-3 border-2 border-primary text-primary text-lg rounded-lg hover:bg-primary/10 transition">
                  Sign In
                </button>
              </SignInButton>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Secure Multi-Tenant
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enterprise-grade security with organization-level isolation and role-based access control.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-300"
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
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              High Performance
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Built on Next.js 16 and React 19 for blazing-fast performance and optimal user experience.
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              API Key Management
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Programmatic access with secure API key generation and scope-based permissions.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>&copy; 2024 TechFusion QGPS. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link href="/docs" className="hover:text-primary transition">
              Documentation
            </Link>
            <Link href="/support" className="hover:text-primary transition">
              Support
            </Link>
            <Link href="/terms" className="hover:text-primary transition">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
