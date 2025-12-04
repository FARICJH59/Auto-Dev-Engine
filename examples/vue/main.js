import { createApp } from 'vue';
import App from './App.vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = createApp(App);

// Inject Speed Insights after app is mounted (client-side only)
app.mount('#app');

// Initialize Speed Insights on client side
if (typeof window !== 'undefined') {
  injectSpeedInsights();
}
