# Auto-Dev-Engine Frontend Dashboard

Phase 3 frontend dashboard built with Next.js and React, providing a web interface for monitoring and controlling the Auto-Dev-Engine orchestrator.

## 🎯 Overview

The frontend dashboard provides:
- Real-time orchestrator status monitoring
- Agent status and management
- Pipeline execution visualization
- Deployment information display
- API endpoint testing interface

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Access the dashboard at `http://localhost:3000`

## 🌐 Environment Variables

Create a `.env.local` file for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ENV=development
```

For production (Vercel):
- `NEXT_PUBLIC_API_URL` - Cloud Run backend URL
- `NEXT_PUBLIC_ENV=production`

## 📦 Project Structure

```
frontend/
├── pages/
│   ├── index.js          # Main dashboard page
│   └── _app.js           # Next.js app wrapper
├── public/               # Static assets
├── vercel.json          # Vercel deployment config
├── next.config.js       # Next.js configuration
├── package.json         # Dependencies
└── README.md           # This file
```

## 🎨 Features

### Dashboard Components

1. **Orchestrator Status**
   - Current status (running/stopped)
   - Environment information
   - Last update timestamp
   - Regional deployment info

2. **Agent Monitor**
   - List of available agents
   - Agent status (ready/running/error)
   - Interactive agent cards

3. **Deployment Info**
   - Backend deployment details
   - Frontend deployment details
   - CI/CD pipeline status
   - API endpoint display

## 🐳 Deployment

### Vercel (Automatic)

Deployed automatically via GitHub Actions (`deploy-vercel.yml`) on push to main.

### Vercel CLI (Manual)

```bash
# Deploy to production
vercel --prod

# Deploy preview
vercel
```

### Environment Setup

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Link project:
```bash
vercel link
```

4. Deploy:
```bash
vercel --prod
```

## 🔧 Configuration

### next.config.js

```javascript
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
}
```

### vercel.json

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

## 🧪 Testing

### Local Testing

1. Start backend orchestrator:
```bash
cd ../orchestrator
npm start
```

2. Start frontend in another terminal:
```bash
cd frontend
NEXT_PUBLIC_API_URL=http://localhost:8080 npm run dev
```

3. Open browser to `http://localhost:3000`

### API Connection Testing

The dashboard will automatically connect to the backend API and display:
- ✅ Green badge: Connected and healthy
- ⚠️ Warning: Connection issues
- ❌ Error: Unable to connect

## 🎨 Styling

The dashboard uses inline styles with a dark theme inspired by GitHub's UI:
- Background: `#0d1117`
- Cards: `#161b22`
- Borders: `#30363d`
- Primary: `#58a6ff`
- Text: `#c9d1d9`

To customize, modify the `styles` object in `pages/index.js`.

## 📱 Responsive Design

The dashboard is responsive and works on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔍 Monitoring

### Vercel Analytics

Enable analytics in Vercel dashboard:
1. Go to project settings
2. Enable Analytics
3. View real-time metrics

### Performance

Monitor in Vercel dashboard:
- Page load times
- API response times
- Error rates
- Traffic patterns

## 🛠️ Development

### Adding New Pages

1. Create file in `pages/` directory:
```javascript
// pages/agents.js
export default function Agents() {
  return <div>Agents Page</div>
}
```

2. Access at `/agents`

### API Integration

Fetch data from backend:
```javascript
const apiUrl = process.env.NEXT_PUBLIC_API_URL;

const response = await fetch(`${apiUrl}/endpoint`);
const data = await response.json();
```

### State Management

Currently using React hooks (useState, useEffect). For complex state:
- Consider adding Context API
- Or use Redux/Zustand

## 🚀 Build Optimization

### Static Generation

Next.js automatically optimizes:
- Static page generation
- Image optimization
- Code splitting
- Bundle optimization

### Production Build

```bash
# Build optimized production bundle
npm run build

# Analyze bundle size
npm run build -- --analyze
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

---

Part of **Auto-Dev-Engine Phase 3** - Full-Stack Deployment
