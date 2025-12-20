# Auto-Dev-Engine

A Next.js application for automated development workflows with Clerk authentication.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/FARICJH59/Auto-Dev-Engine.git
cd Auto-Dev-Engine
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Then edit `.env.local` and add your actual Clerk API keys:
- Get your keys from [Clerk Dashboard](https://dashboard.clerk.com/)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your publishable key
- `CLERK_SECRET_KEY`: Your secret key

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

- `/src/app` - Next.js App Router pages and layouts
  - `/dashboard/projects` - Projects dashboard page
- `/src/types` - TypeScript type definitions
- `.env.local` - Local environment variables (not committed)
- `.env.example` - Example environment variables template

## Features

- ✅ TypeScript support
- ✅ Clerk authentication
- ✅ Projects dashboard
- ✅ Simulation, deployment, and SDK generation workflows

## Environment Variables

See `.env.example` for required environment variables. Never commit `.env.local` to version control.

## License

MIT License - see LICENSE file for details
