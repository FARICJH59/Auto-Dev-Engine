import type { Metadata } from 'next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Next.js with Speed Insights',
  description: 'Example Next.js app with Vercel Speed Insights',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* Speed Insights component - automatically handles client-side only rendering */}
        <SpeedInsights />
      </body>
    </html>
  );
}
