
import React, { createContext, useContext, useState, useEffect } from 'react';
import { registerUser, loginUser, logoutUser, getCurrentUser, isAuthenticated } from '../services/api';

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (userData: { username: string; email: string; password: string; role?: string }) => Promise<void>;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  isAuth: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState(isAuthenticated());

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          } else {
            const userData = await getCurrentUser();
            setUser(userData);
          }
          setIsAuth(true);
        } catch (err) {
          console.error('Authentication error:', err);
          logoutUser();
          setIsAuth(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const register = async (userData: { username: string; email: string; password: string; role?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await registerUser(userData);
      setUser(response.user);
      setIsAuth(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await loginUser(credentials);
      setUser(response.user);
      setIsAuth(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setIsAuth(false);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
