import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CredentialsProvider } from './contexts/CredentialsContext';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const basePath = process.env.REACT_APP_BASE_PATH || '/';
  
  return (
    <BrowserRouter basename={basePath}>
      <CredentialsProvider>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </CredentialsProvider>
    </BrowserRouter>
  );
}

export default App;
