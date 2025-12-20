import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '1rem 2rem', 
        borderBottom: '1px solid #eaeaea',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Auto Dev Engine</h1>
        <div>
          <SignedOut>
            <SignInButton mode="modal">
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#0070f3',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '1rem'
              }}>
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </header>

      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Welcome to Auto Dev Engine
        </h1>
        <p style={{ fontSize: '1.25rem', marginBottom: '2rem', textAlign: 'center', maxWidth: '600px' }}>
          A multi-tenant development automation platform with organization-based access control.
        </p>
        
        <SignedOut>
          <p style={{ marginBottom: '1rem' }}>Get started by signing in</p>
          <SignInButton mode="modal">
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}>
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        
        <SignedIn>
          <Link href="/dashboard">
            <button style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: 'bold'
            }}>
              Go to Dashboard
            </button>
          </Link>
        </SignedIn>
      </main>

      <footer style={{ 
        padding: '2rem', 
        borderTop: '1px solid #eaeaea',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, color: '#666' }}>
          Powered by Next.js 16 + Clerk v6
        </p>
      </footer>
    </div>
  );
}
