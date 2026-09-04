import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('suraksha_token') || null);
  const [loading, setLoading] = useState(true);

 
  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('suraksha_token');

      if (storedToken) {
        try {
          // Validate the token and fetch fresh user data from the backend
          const response = await authService.getProfile();
          const freshUser = response.user; // authService returns response.data, which contains { user }

          // Token is valid: Update state and sync localStorage with fresh data
          setToken(storedToken);
          setUser(freshUser);
          localStorage.setItem('suraksha_user', JSON.stringify(freshUser));
        } catch (error) {
          // Token is invalid/expired: Wipe the dead session completely
          console.error('Session validation failed. Clearing stale session.', error);
          localStorage.removeItem('suraksha_token');
          localStorage.removeItem('suraksha_user');
          setToken(null);
          setUser(null);
        }
      } else {
        // No token found, ensure clean state
        setToken(null);
        setUser(null);
      }
      
      // Stop the loading spinner only AFTER the network check resolves
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (authToken, userData) => {
    localStorage.setItem('suraksha_token', authToken);
    localStorage.setItem('suraksha_user', JSON.stringify(userData));
    setToken(authToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('suraksha_token');
    localStorage.removeItem('suraksha_user');
    setToken(null);
    setUser(null);
    // Force a hard redirect to login so the app doesn't sit on a dead dashboard
    window.location.href = '/login'; 
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}