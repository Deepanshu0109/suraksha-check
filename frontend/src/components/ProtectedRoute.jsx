import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user, loading } = useAuth(); // Pull state from your existing context

  if (loading) {
    return <div>Loading...</div>; // Wait for the auth check to finish before making routing decisions
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Send unauthenticated traffic to the login page
  }

  if (allowedRole && user?.role !== allowedRole) {
    return <Navigate to="/" replace />; // Bounce users trying to access the wrong role's dashboard
  }

  return children; // Render the actual dashboard if all checks pass
}