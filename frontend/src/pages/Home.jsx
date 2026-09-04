import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-ground">Loading...</div>;
  }

  // If not logged in, send them to the login screen
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, check their role and send them to their specific dashboard
  if (user?.role === 'guardian') {
    return <Navigate to="/guardian" replace />;
  }

  // Default fallback for 'primary' users
  return <Navigate to="/app" replace />;
}