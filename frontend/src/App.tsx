/**
 * Auto-Dev-Engine Frontend Application
 * Phase-2 Shell with Routing Placeholder
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

/**
 * Home page component
 */
const Home: React.FC = () => {
  return (
    <div className="page home">
      <h1>Auto-Dev-Engine</h1>
      <p>Welcome to the Auto-Dev-Engine Phase-2 Frontend</p>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/orchestrator">Orchestrator</Link></li>
          <li><Link to="/services">Services</Link></li>
          <li><Link to="/tools">Tools</Link></li>
        </ul>
      </nav>
    </div>
  );
};

/**
 * Dashboard placeholder
 */
const Dashboard: React.FC = () => (
  <div className="page dashboard">
    <h2>Dashboard</h2>
    <p>Orchestration status and metrics will appear here.</p>
    <Link to="/">Back to Home</Link>
  </div>
);

/**
 * Orchestrator placeholder
 */
const Orchestrator: React.FC = () => (
  <div className="page orchestrator">
    <h2>Orchestrator</h2>
    <p>Level-6 execution graph and control loops will be displayed here.</p>
    <Link to="/">Back to Home</Link>
  </div>
);

/**
 * Services placeholder
 */
const Services: React.FC = () => (
  <div className="page services">
    <h2>Services</h2>
    <p>Policy Engine, Quota Engine, and Model Router status will appear here.</p>
    <Link to="/">Back to Home</Link>
  </div>
);

/**
 * Tools placeholder
 */
const Tools: React.FC = () => (
  <div className="page tools">
    <h2>Tool Bus</h2>
    <p>Plugin registry and capability negotiation will be managed here.</p>
    <Link to="/">Back to Home</Link>
  </div>
);

/**
 * Not Found page
 */
const NotFound: React.FC = () => (
  <div className="page not-found">
    <h2>404 - Page Not Found</h2>
    <Link to="/">Return to Home</Link>
  </div>
);

/**
 * Main App component with routing
 */
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header>
          <h1>ADE</h1>
          <span className="version">Phase-2</span>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orchestrator" element={<Orchestrator />} />
            <Route path="/services" element={<Services />} />
            <Route path="/tools" element={<Tools />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer>
          <p>Auto-Dev-Engine &copy; 2024</p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;
export { Home, Dashboard, Orchestrator, Services, Tools, NotFound };
