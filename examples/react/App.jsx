import React from 'react';
import { injectSpeedInsights } from '@vercel/speed-insights';

function App() {
  // Initialize Speed Insights on component mount
  React.useEffect(() => {
    // Only inject on client side
    if (typeof window !== 'undefined') {
      injectSpeedInsights();
    }
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React App with Vercel Speed Insights</h1>
        <p>Speed Insights is now tracking this application's performance.</p>
      </header>
    </div>
  );
}

export default App;
