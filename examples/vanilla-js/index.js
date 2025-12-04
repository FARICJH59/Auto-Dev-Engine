import { injectSpeedInsights } from '@vercel/speed-insights';

// Initialize your app
console.log('App initialized');

// Inject Speed Insights - must run on client side
if (typeof window !== 'undefined') {
  injectSpeedInsights();
  console.log('Speed Insights injected');
}

// Rest of your application code
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded');
});
