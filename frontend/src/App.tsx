import React from 'react';
import { CredentialsProvider } from './contexts/CredentialsContext';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  return (
    <CredentialsProvider>
      <div className="App">
        <Dashboard />
      </div>
    </CredentialsProvider>
  );
}

export default App;
