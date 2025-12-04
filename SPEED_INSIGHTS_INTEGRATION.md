# Vercel Speed Insights Integration Guide

This guide provides comprehensive instructions for integrating Vercel Speed Insights into various types of web applications.

## Overview

Vercel Speed Insights helps you track and analyze your website's Core Web Vitals and other performance metrics in real-time.

## Installation

### Plain HTML Sites

For plain HTML sites, no package installation is needed. Simply add the script tag directly to your HTML file.

**Example:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your Site</title>
</head>
<body>
    <!-- Your content -->
    
    <!-- Add this just before closing </body> tag -->
    <script>
        window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    </script>
    <script defer src="https://cdn.vercel-insights.com/v1/speed-insights/script.js"></script>
</body>
</html>
```

See the complete example in `examples/plain-html/index.html`.

### Framework-Based Applications

For applications using frameworks (React, Next.js, Vue, Svelte, etc.), install the package:

```bash
# Using npm
npm install @vercel/speed-insights

# Using pnpm
pnpm add @vercel/speed-insights

# Using yarn
yarn add @vercel/speed-insights

# Using bun
bun add @vercel/speed-insights
```

## Framework-Specific Integration

### Next.js (Recommended Method)

Next.js has first-class support with a dedicated component.

#### App Router (Next.js 13+)

Add the `<SpeedInsights />` component to your root layout:

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

See example: `examples/nextjs/app/layout.tsx`

#### Pages Router (Next.js 12 and earlier)

Add the component to your `_app.tsx`:

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
```

See example: `examples/nextjs/pages/_app.tsx`

### React

For React applications, inject Speed Insights in your app's entry point or root component:

```jsx
import React from 'react';
import { injectSpeedInsights } from '@vercel/speed-insights';

function App() {
  React.useEffect(() => {
    // Only inject on client side
    if (typeof window !== 'undefined') {
      injectSpeedInsights();
    }
  }, []);

  return (
    <div className="App">
      {/* Your app content */}
    </div>
  );
}

export default App;
```

See example: `examples/react/App.jsx`

### Vue.js

Inject Speed Insights in your main entry file:

```javascript
import { createApp } from 'vue';
import App from './App.vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = createApp(App);
app.mount('#app');

// Initialize Speed Insights on client side
if (typeof window !== 'undefined') {
  injectSpeedInsights();
}
```

See example: `examples/vue/main.js`

### Svelte

Add Speed Insights to your main entry file:

```javascript
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
```

See example: `examples/svelte/main.js`

### Vanilla JavaScript

For vanilla JavaScript applications with a build system:

```javascript
import { injectSpeedInsights } from '@vercel/speed-insights';

// Inject Speed Insights - must run on client side
if (typeof window !== 'undefined') {
  injectSpeedInsights();
}

// Rest of your application code
```

See example: `examples/vanilla-js/index.js`

## Important Notes

### Client-Side Only

⚠️ **Critical:** Speed Insights must run on the client side only. Always ensure:

1. The code runs in the browser environment
2. Use the `typeof window !== 'undefined'` check for SSR frameworks
3. For Next.js, use the provided `<SpeedInsights />` component (handles this automatically)

### Server-Side Rendering (SSR)

If your framework supports SSR (Next.js, Nuxt, SvelteKit, etc.):

- Always check for `window` object existence before injecting
- Use framework-specific lifecycle methods (e.g., `useEffect` in React)
- For Next.js, the `<SpeedInsights />` component automatically handles client-side only rendering

### Configuration Options

Speed Insights can be configured with additional options:

```javascript
injectSpeedInsights({
  // Custom configuration options
  debug: false, // Enable debug mode in development
  // Add other options as needed per Vercel's documentation
});
```

For Next.js component:

```tsx
<SpeedInsights
  debug={false}
  // Add other props as needed
/>
```

## Verification

After integration:

1. **Build your application** to ensure no errors are introduced
2. **Run your development server** and open the browser console
3. **Check for Speed Insights** in the Network tab (look for requests to `vercel-insights.com`)
4. **Deploy to Vercel** to see metrics in your Vercel dashboard

## Troubleshooting

### Speed Insights not loading

1. Check that the package is installed correctly
2. Verify the code runs on client side (check browser console)
3. Ensure no ad blockers are interfering
4. Check the browser console for errors

### TypeScript Errors

If using TypeScript, install type definitions:

```bash
npm install --save-dev @types/node
```

The `@vercel/speed-insights` package includes its own TypeScript definitions.

## Resources

- [Official Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Web Vitals Documentation](https://web.dev/vitals/)

## Support

For issues or questions:
- Check [Vercel's official documentation](https://vercel.com/docs)
- Visit [Vercel's GitHub discussions](https://github.com/vercel/next.js/discussions)
- Contact Vercel support if you're a paying customer
