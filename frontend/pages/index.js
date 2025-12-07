import { useState, useEffect } from 'react';

export default function Home() {
  const [status, setStatus] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchStatus();
    fetchAgents();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${apiUrl}/status`);
      if (!response.ok) throw new Error('Failed to fetch status');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch(`${apiUrl}/agents`);
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data.agents || []);
    } catch (err) {
      console.error('Error fetching agents:', err);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🚀 Auto-Dev-Engine Dashboard</h1>
        <p style={styles.subtitle}>Phase 3: Full-Stack Deployment Automation</p>
      </header>

      <main style={styles.main}>
        {loading && <div style={styles.loading}>Loading...</div>}
        {error && <div style={styles.error}>Error: {error}</div>}

        {!loading && !error && (
          <>
            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Orchestrator Status</h2>
              <div style={styles.card}>
                {status ? (
                  <div>
                    <p><strong>Status:</strong> <span style={styles.badge}>{status.orchestrator}</span></p>
                    <p><strong>Environment:</strong> {status.config?.environment}</p>
                    <p><strong>Region:</strong> {status.config?.region}</p>
                    <p><strong>Last Updated:</strong> {new Date(status.timestamp).toLocaleString()}</p>
                  </div>
                ) : (
                  <p>Unable to connect to orchestrator</p>
                )}
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Available Agents</h2>
              <div style={styles.grid}>
                {agents.length > 0 ? (
                  agents.map((agent, index) => (
                    <div key={index} style={styles.card}>
                      <h3 style={styles.agentName}>{agent.name}</h3>
                      <p style={styles.agentStatus}>
                        Status: <span style={styles.badge}>{agent.status}</span>
                      </p>
                    </div>
                  ))
                ) : (
                  <p>No agents available</p>
                )}
              </div>
            </section>

            <section style={styles.section}>
              <h2 style={styles.sectionTitle}>Deployment Info</h2>
              <div style={styles.card}>
                <p><strong>Backend:</strong> Cloud Run (Google Cloud Platform)</p>
                <p><strong>Frontend:</strong> Vercel</p>
                <p><strong>CI/CD:</strong> GitHub Actions</p>
                <p><strong>API Endpoint:</strong> <code>{apiUrl}</code></p>
              </div>
            </section>
          </>
        )}
      </main>

      <footer style={styles.footer}>
        <p>Auto-Dev-Engine © 2024 | Powered by Phase 1, 2, and 3</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '0 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
  },
  header: {
    padding: '2rem 0',
    borderBottom: '1px solid #30363d',
    textAlign: 'center',
  },
  title: {
    margin: 0,
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#58a6ff',
  },
  subtitle: {
    margin: '0.5rem 0 0 0',
    fontSize: '1.2rem',
    color: '#8b949e',
  },
  main: {
    flex: 1,
    padding: '2rem 0',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
  section: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#f0f6fc',
  },
  card: {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '6px',
    padding: '1.5rem',
    marginBottom: '1rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  agentName: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    color: '#58a6ff',
  },
  agentStatus: {
    margin: 0,
    fontSize: '0.9rem',
  },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    backgroundColor: '#238636',
    color: '#ffffff',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '1.2rem',
    color: '#8b949e',
  },
  error: {
    backgroundColor: '#da3633',
    color: '#ffffff',
    padding: '1rem',
    borderRadius: '6px',
    marginBottom: '1rem',
  },
  footer: {
    padding: '2rem 0',
    borderTop: '1px solid #30363d',
    textAlign: 'center',
    color: '#8b949e',
  },
};
