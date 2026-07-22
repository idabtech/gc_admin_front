import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../service/auth.service';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const getUserProfile = async () => {
    try {
      const response = await authService.getUserProfile();
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('userData', JSON.stringify(response.user));
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
  };

  const login = (userData, token) => {
    setUser(userData);
    setIsAuthenticated(true);
    const jwtToken = token || userData?.token || userData?.accessToken;
    if (jwtToken) {
      localStorage.setItem('token', jwtToken);
    }
    localStorage.setItem('userData', JSON.stringify(userData));
    getUserProfile(); // immediately fetch full profile (roles, etc.)
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
  };

  useEffect(() => {
    // Check if user is already authenticated in localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userData');

    if (token) {
      setIsAuthenticated(true);
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      getUserProfile(); // refresh user profile details and roles
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
