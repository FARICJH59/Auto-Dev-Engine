// Copilot: Shared footer component
// Displays copyright and links

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p className="mb-2">&copy; 2024 TechFusion QGPS. All rights reserved.</p>
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/docs" className="hover:text-primary transition">
              Documentation
            </Link>
            <Link href="/support" className="hover:text-primary transition">
              Support
            </Link>
            <Link href="/terms" className="hover:text-primary transition">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:text-primary transition">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
