import { requireOrg } from '@/lib/org-context';

export default async function ProjectsPage() {
  const { orgId } = await requireOrg();

  // In a real app, fetch projects from API using apiClient
  // const projects = await apiClient<Project[]>('/projects');

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '2.25rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem' 
            }}>
              Projects
            </h1>
            <p style={{ color: '#666' }}>
              Manage your organization&apos;s projects
            </p>
          </div>
          <button style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            + New Project
          </button>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '1rem'
          }}>
            📁
          </div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            marginBottom: '0.5rem'
          }}>
            No projects yet
          </h3>
          <p style={{ 
            color: '#666',
            marginBottom: '1.5rem',
            maxWidth: '500px',
            margin: '0 auto 1.5rem'
          }}>
            Get started by creating your first project. Projects help you organize your work and collaborate with your team.
          </p>
          <button style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            Create your first project
          </button>
          
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.375rem',
            textAlign: 'left'
          }}>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#666',
              marginBottom: '0.5rem'
            }}>
              <strong>Note:</strong> All projects are automatically filtered by your organization context:
            </p>
            <code style={{
              display: 'block',
              padding: '0.5rem',
              backgroundColor: '#1f2937',
              color: '#10b981',
              borderRadius: '0.25rem',
              fontSize: '0.75rem',
              fontFamily: 'monospace'
            }}>
              org_id = &quot;{orgId}&quot;
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
