// Copilot: Health check API route (public, no auth required)
// Returns frontend + backend health status

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check backend health if configured
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
    let backendHealthy = false;

    if (backendUrl) {
      try {
        const response = await fetch(`${backendUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        backendHealthy = response.ok;
      } catch (error) {
        console.error('Backend health check failed:', error);
      }
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      frontend: {
        healthy: true,
        version: '0.1.0',
      },
      backend: {
        healthy: backendHealthy,
        url: backendUrl || 'not configured',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
