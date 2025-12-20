import { requireRole } from '@/lib/org-context';

export default async function SettingsPage() {
  // Require admin role to access settings
  const { orgId, orgRole } = await requireRole(['org:admin']);

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
          Settings
        </h1>
        <p style={{ 
          color: '#666', 
          marginBottom: '2rem' 
        }}>
          Manage your organization settings (Admin only)
        </p>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: '#dbeafe',
            borderRadius: '0.375rem',
            marginBottom: '1.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>ℹ️</span>
            <div>
              <p style={{ fontWeight: 'bold', marginBottom: '0.25rem', color: '#1e40af' }}>
                Admin Access Confirmed
              </p>
              <p style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>
                You have {orgRole} permissions for this organization
              </p>
            </div>
          </div>

          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #eaeaea'
          }}>
            Organization Information
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500',
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Organization ID
            </label>
            <input
              type="text"
              value={orgId}
              disabled
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                fontSize: '0.875rem'
              }}
            />
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 'bold', 
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #eaeaea'
          }}>
            Billing & Usage
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>Plan</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>Trial</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#666' }}>Executions Used</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>0 / 100</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px',
              overflow: 'hidden',
              marginTop: '0.5rem'
            }}>
              <div style={{ 
                width: '0%', 
                height: '100%', 
                backgroundColor: '#0070f3' 
              }} />
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
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid #eaeaea'
          }}>
            Danger Zone
          </h3>
          
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            These actions are irreversible. Please proceed with caution.
          </p>
          
          <button style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            Delete Organization
          </button>
        </div>
      </div>
    </div>
  );
}
