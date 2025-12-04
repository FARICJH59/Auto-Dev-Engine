import App from './App.svelte';
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = new App({
  target: document.getElementById('app'),
});

// Initialize Speed Insights on client side
if (typeof window !== 'undefined') {
  injectSpeedInsights();
}

export default app;
