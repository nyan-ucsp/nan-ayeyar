import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { User, AuthContextType } from '@/types';
import { adminApiClient } from '@/lib/api';
import { adminStorage } from '@/utils/storage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!token && user.role === 'admin';

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = adminStorage.getToken();
        const savedUser = adminStorage.getUser();

        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(savedUser);
          
          // Verify token is still valid and user is admin
          try {
            const currentUser = await adminApiClient.getCurrentUser();
            if (currentUser.role !== 'admin') {
              throw new Error('Access denied. Admin role required.');
            }
            setUser(currentUser);
            adminStorage.setUser(currentUser);
          } catch (error) {
            // Token is invalid or user is not admin
            adminStorage.clearAll();
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        adminStorage.clearAll();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await adminApiClient.login(email, password);
      
      // Check if response has the expected structure
      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response from server');
      }
      
      const { token: newToken, user: newUser } = response;
      
      // Verify we have the required data
      if (!newToken || !newUser) {
        throw new Error('Missing authentication data from server');
      }
      
      // Verify user is admin
      if (newUser.role !== 'admin') {
        throw new Error('Access denied. Admin role required.');
      }
      
      setToken(newToken);
      setUser(newUser);
      adminStorage.setToken(newToken);
      adminStorage.setUser(newUser);
      
      toast.success('Welcome back, Admin!');
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Login failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setToken(null);
    setUser(null);
    adminStorage.clearAll();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
