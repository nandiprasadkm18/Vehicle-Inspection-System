import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import InspectionWizard from './components/InspectionWizard';
import Report from './components/Report';
import Login from './components/Login';

const AUTH_KEY = 'vehicle_inspection_auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem(AUTH_KEY) === 'true'
  );

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_KEY, 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(AUTH_KEY);
  };

  const RequireAuth = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />

        <Route path="/" element={
          <RequireAuth>
            <Dashboard onLogout={handleLogout} />
          </RequireAuth>
        } />

        <Route path="/inspect/:id" element={
          <RequireAuth>
            <InspectionWizard />
          </RequireAuth>
        } />

        <Route path="/report/:id" element={
          <RequireAuth>
            <Report />
          </RequireAuth>
        } />
      </Routes>
    </Router>
  );
}

export default App;
