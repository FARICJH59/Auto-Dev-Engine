'use client';

import { useEffect } from 'react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      flexDirection: 'column',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{ fontSize: '1.875rem', marginBottom: '1rem', color: '#e00' }}>
        Dashboard Error
      </h2>
      <p style={{ marginBottom: '2rem', color: '#666', maxWidth: '500px' }}>
        {error.message || 'An error occurred while loading the dashboard. Please try again.'}
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Try again
        </button>
        <button
          onClick={() => window.location.href = '/dashboard'}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#666',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
