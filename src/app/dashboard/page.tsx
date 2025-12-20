import { requireOrg } from '@/lib/org-context';

export default async function DashboardPage() {
  const { orgId, userId, orgRole } = await requireOrg();

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <h1 style={{ 
          fontSize: '2.25rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem' 
        }}>
          Dashboard
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem' 
        }}>
          Welcome to your organization dashboard
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              color: '#0070f3'
            }}>
              Organization Context
            </h3>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Organization ID:</strong> {orgId}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>User ID:</strong> {userId}
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Role:</strong> {orgRole}
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              color: '#10b981'
            }}>
              Quick Stats
            </h3>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Projects:</strong> 0
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Executions:</strong> 0
              </p>
              <p style={{ marginBottom: '0.5rem' }}>
                <strong>Status:</strong> Active
              </p>
            </div>
          </div>

          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.125rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              color: '#f59e0b'
            }}>
              Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a 
                href="/dashboard/projects"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#0070f3',
                  color: 'white',
                  borderRadius: '0.375rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                View Projects
              </a>
              <a 
                href="/dashboard/settings"
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#666',
                  color: 'white',
                  borderRadius: '0.375rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Settings
              </a>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem'
          }}>
            Getting Started
          </h3>
          <ol style={{ paddingLeft: '1.5rem', color: '#666', lineHeight: '1.8' }}>
            <li>Create your first project in the Projects section</li>
            <li>Configure your organization settings</li>
            <li>Invite team members to collaborate</li>
            <li>Start running executions and automations</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
