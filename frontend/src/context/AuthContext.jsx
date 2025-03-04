import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, []);
  
  // Login function
  const login = async (apiKey) => {
    try {
      setLoading(true);
      
      // In a real app, we'd validate the API key with the server
      // For demo purposes, we're just storing it
      localStorage.setItem('auth_token', apiKey);
      
      // Mock user data - in a real app, we'd get this from the server
      const userData = {
        id: '1',
        name: 'Admin User',
        role: 'admin',
        apiKey: apiKey
      };
      
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setIsAuthenticated(true);
      setUser(userData);
      setError(null);
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to login');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
