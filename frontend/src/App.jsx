import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import PrimaryDashboard from './pages/PrimaryDashboard';
import GuardianDashboard from './pages/GuardianDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/app" 
            element={
              <ProtectedRoute allowedRole="primary">
                <PrimaryDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/guardian" 
            element={
              <ProtectedRoute allowedRole="guardian">
                <GuardianDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;