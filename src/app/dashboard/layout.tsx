import { OrganizationSwitcher, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { requireOrg } from '@/lib/org-context';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user has org context (will redirect if not)
  await requireOrg();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '1rem 2rem', 
        borderBottom: '1px solid #eaeaea',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/dashboard">
            <h1 style={{ margin: 0, fontSize: '1.5rem', cursor: 'pointer' }}>
              Auto Dev Engine
            </h1>
          </Link>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <Link href="/dashboard" style={{ color: '#666' }}>
              Dashboard
            </Link>
            <Link href="/dashboard/projects" style={{ color: '#666' }}>
              Projects
            </Link>
            <Link href="/dashboard/settings" style={{ color: '#666' }}>
              Settings
            </Link>
          </nav>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <OrganizationSwitcher
            hidePersonal={false}
            afterCreateOrganizationUrl="/dashboard"
            afterSelectOrganizationUrl="/dashboard"
          />
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main style={{ flex: 1, backgroundColor: '#f9fafb' }}>
        {children}
      </main>

      <footer style={{ 
        padding: '1.5rem 2rem', 
        borderTop: '1px solid #eaeaea',
        textAlign: 'center',
        backgroundColor: 'white'
      }}>
        <p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>
          © 2024 Auto Dev Engine. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
