import type { AppProps } from 'next.js';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      {/* Speed Insights component for Next.js Pages Router */}
      <SpeedInsights />
    </>
  );
}
