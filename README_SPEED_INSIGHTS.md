# Vercel Speed Insights Integration

This repository includes comprehensive examples and documentation for integrating Vercel Speed Insights into your web applications.

## 📊 What is Speed Insights?

Vercel Speed Insights helps you monitor and analyze your website's performance metrics, including Core Web Vitals like:
- **LCP (Largest Contentful Paint)** - Loading performance
- **FID (First Input Delay)** - Interactivity
- **CLS (Cumulative Layout Shift)** - Visual stability
- **TTFB (Time to First Byte)** - Server response time

## 🚀 Quick Start

### For Plain HTML Sites

No installation needed! Just add the script tag:

```html
<script>
    window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="https://cdn.vercel-insights.com/v1/speed-insights/script.js"></script>
```

### For Framework-Based Applications

1. **Install the package:**
   ```bash
   npm install @vercel/speed-insights
   ```

2. **Import and inject in your app's entry point:**
   ```javascript
   import { injectSpeedInsights } from '@vercel/speed-insights';
   
   // Client-side only!
   if (typeof window !== 'undefined') {
     injectSpeedInsights();
   }
   ```

## 📁 Repository Structure

```
├── package.json                          # Package configuration with @vercel/speed-insights
├── SPEED_INSIGHTS_INTEGRATION.md         # Comprehensive integration guide
└── examples/                             # Framework-specific examples
    ├── plain-html/
    │   └── index.html                    # Plain HTML implementation
    ├── react/
    │   └── App.jsx                       # React component example
    ├── nextjs/
    │   ├── app/layout.tsx                # Next.js App Router
    │   └── pages/_app.tsx                # Next.js Pages Router
    ├── vue/
    │   └── main.js                       # Vue.js integration
    ├── svelte/
    │   └── main.js                       # Svelte integration
    └── vanilla-js/
        └── index.js                      # Vanilla JavaScript
```

## 📖 Documentation

See [SPEED_INSIGHTS_INTEGRATION.md](./SPEED_INSIGHTS_INTEGRATION.md) for detailed integration instructions covering:

- ✅ Plain HTML sites
- ✅ React applications
- ✅ Next.js (App Router & Pages Router)
- ✅ Vue.js applications
- ✅ Svelte applications
- ✅ Vanilla JavaScript
- ✅ SSR considerations
- ✅ Configuration options
- ✅ Troubleshooting guide

## 🎯 Integration Examples

### Next.js (Recommended)

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

### React

```jsx
import { useEffect } from 'react';
import { injectSpeedInsights } from '@vercel/speed-insights';

function App() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      injectSpeedInsights();
    }
  }, []);
  
  return <div>Your App</div>;
}
```

### Vue.js

```javascript
import { createApp } from 'vue';
import { injectSpeedInsights } from '@vercel/speed-insights';

const app = createApp(App);
app.mount('#app');

if (typeof window !== 'undefined') {
  injectSpeedInsights();
}
```

## ⚠️ Important Notes

### Client-Side Only

Speed Insights **must** run on the client side. For SSR frameworks:

```javascript
// Always check for window
if (typeof window !== 'undefined') {
  injectSpeedInsights();
}
```

### Next.js Special Case

Next.js has a dedicated component that handles SSR automatically:

```tsx
import { SpeedInsights } from '@vercel/speed-insights/next';
```

No need for manual client-side checks!

## 🔍 Verification

After integrating, verify it's working:

1. **Open your app** in a browser
2. **Check Network tab** - Look for requests to `vercel-insights.com`
3. **Deploy to Vercel** - View metrics in your Vercel dashboard
4. **Check Console** - No errors related to Speed Insights

## 📦 Dependencies

This repository includes:

```json
{
  "dependencies": {
    "@vercel/speed-insights": "^1.3.1"
  }
}
```

## 🔗 Resources

- [Official Documentation](https://vercel.com/docs/speed-insights)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Vercel Analytics](https://vercel.com/docs/analytics)

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Feel free to submit issues and pull requests for additional framework examples or improvements to the integration guide.

---

**Note:** This integration was added to demonstrate how to implement Vercel Speed Insights across different frameworks and application types. All examples are production-ready and follow Vercel's official recommendations.
