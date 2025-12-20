import { OrganizationList } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SelectOrganizationPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  const { userId, orgId } = await auth();
  const params = await searchParams;

  // If user already has an org, redirect to destination or dashboard
  if (orgId) {
    const destination = params.redirect_url || '/dashboard';
    redirect(destination);
  }

  // If user is not authenticated, redirect to sign in
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      flexDirection: 'column',
      padding: '2rem',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          textAlign: 'center'
        }}>
          Select an Organization
        </h1>
        <p style={{ 
          marginBottom: '2rem', 
          color: '#666',
          textAlign: 'center'
        }}>
          Choose or create an organization to continue
        </p>
        
        <OrganizationList
          afterCreateOrganizationUrl={params.redirect_url || '/dashboard'}
          afterSelectOrganizationUrl={params.redirect_url || '/dashboard'}
          hidePersonal={false}
        />
      </div>
    </div>
  );
}
