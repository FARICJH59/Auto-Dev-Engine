// Copilot: Root layout with ClerkProvider
// Wraps entire application in Clerk authentication context
// Includes global styles and font configuration

import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TechFusion QGPS Control Plane',
  description: 'Quantum-Grade Processing System Control Plane',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
