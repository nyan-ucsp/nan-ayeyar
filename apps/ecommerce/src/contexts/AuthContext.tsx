import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  address?: string;
  locale: 'en' | 'my';
  role: 'customer' | 'admin';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, address: string, locale: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      return;
    }

    const initializeAuth = async () => {
      try {
        const token = Cookies.get('token');
        console.log('AuthProvider - Initializing auth, token exists:', !!token);
        console.log('AuthProvider - Window object available:', typeof window !== 'undefined');
        console.log('AuthProvider - Document object available:', typeof document !== 'undefined');
        
        if (token) {
          console.log('AuthProvider - Token found, calling refreshUser');
          // Verify token and get user data
          await refreshUser();
        } else {
          console.log('AuthProvider - No token found, setting loading to false');
          setUser(null);
        }
      } catch (error) {
        console.error('AuthProvider - Error during initialization:', error);
        setUser(null);
      } finally {
        console.log('AuthProvider - Setting loading to false');
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const token = Cookies.get('token');
      console.log('RefreshUser - Token:', token ? 'exists' : 'missing');
      
      if (!token) {
        console.log('RefreshUser - No token found');
        setUser(null);
        return;
      }

      // Check if token is expired before making API call
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < currentTime) {
          console.log('RefreshUser - Token is expired');
          Cookies.remove('token');
          setUser(null);
          return;
        }
      } catch (decodeError) {
        console.error('RefreshUser - Failed to decode token:', decodeError);
        Cookies.remove('token');
        setUser(null);
        return;
      }

      // Get user data from API
      console.log('RefreshUser - Making API call to /api/auth/me');
      const response = await apiClient.get('/api/auth/me');
      console.log('RefreshUser - API response:', response.data);
      
      if (response.data && response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
        console.log('RefreshUser - User data updated successfully:', response.data.data.user);
      } else {
        console.error('RefreshUser - Invalid response structure:', response.data);
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('RefreshUser - Failed to refresh user:', error);
      console.error('RefreshUser - Error details:', error.response?.data);
      console.error('RefreshUser - Error status:', error.response?.status);
      
      // Only remove token and logout if it's a 401 (unauthorized) error
      if (error.response?.status === 401) {
        console.log('RefreshUser - Token is invalid (401), removing token');
        Cookies.remove('token');
        setUser(null);
      } else {
        // For other errors, try to maintain user state from token
        console.log('RefreshUser - Non-auth error, attempting to maintain user state');
        const token = Cookies.get('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const fallbackUser: User = {
              id: payload.id || 'unknown',
              email: payload.email || 'unknown@example.com',
              name: payload.name || 'User',
              address: payload.address || '',
              locale: payload.locale || 'en',
              role: payload.role || 'customer',
              isEmailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setUser(fallbackUser);
            console.log('RefreshUser - Set fallback user from token');
          } catch (decodeError) {
            console.error('RefreshUser - Failed to decode token for fallback:', decodeError);
            Cookies.remove('token');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Login - Starting login process');
      const response = await apiClient.login({ email, password });
      console.log('Login - Full response:', response);
      
      // Handle different possible response structures
      let token, user;
      
      const responseData = response as any;
      
      if (responseData && responseData.data) {
        // Check if response.data has the nested structure
        if (responseData.data.data && responseData.data.data.token) {
          token = responseData.data.data.token;
          user = responseData.data.data.user;
          console.log('Login - Using nested structure (response.data.data)');
        } else if (responseData.data.token) {
          token = responseData.data.token;
          user = responseData.data.user;
          console.log('Login - Using flat structure (response.data)');
        } else {
          console.error('Login - Unexpected response structure:', responseData);
          throw new Error('Unexpected API response structure');
        }
      } else {
        console.error('Login - No response or response.data:', responseData);
        throw new Error('Invalid API response');
      }
      
      if (!token || !user) {
        console.error('Login - Missing token or user data');
        console.error('Login - Token:', token);
        console.error('Login - User:', user);
        throw new Error('Missing token or user data in response');
      }
      
      Cookies.set('token', token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      console.log('Login - Token set in cookie');
      
      // Set user directly from login response
      setUser(user);
      console.log('Login - User set:', user);
      setIsLoading(false);
      console.log('Login - Redirecting to home');
      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (email: string, name: string, password: string, address: string, locale: string) => {
    try {
      await apiClient.register({ email, name, password, address, locale });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    try {
      const response = await apiClient.verifyOtp({ email, otp });
      console.log('VerifyOtp - Full response:', response);
      
      // Handle different possible response structures
      let token, user;
      
      const responseData = response as any;
      
      if (responseData && responseData.data) {
        // Check if response.data has the nested structure
        if (responseData.data.data && responseData.data.data.token) {
          token = responseData.data.data.token;
          user = responseData.data.data.user;
          console.log('VerifyOtp - Using nested structure (response.data.data)');
        } else if (responseData.data.token) {
          token = responseData.data.token;
          user = responseData.data.user;
          console.log('VerifyOtp - Using flat structure (response.data)');
        } else {
          console.error('VerifyOtp - Unexpected response structure:', responseData);
          throw new Error('Unexpected API response structure');
        }
      } else {
        console.error('VerifyOtp - No response or response.data:', responseData);
        throw new Error('Invalid API response');
      }
      
      if (!token || !user) {
        console.error('VerifyOtp - Missing token or user data');
        console.error('VerifyOtp - Token:', token);
        console.error('VerifyOtp - User:', user);
        throw new Error('Missing token or user data in response');
      }
      
      Cookies.set('token', token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
      });
      console.log('VerifyOtp - Token set in cookie');
      
      // Set user directly from OTP verification response
      setUser(user);
      console.log('VerifyOtp - User set:', user);
      setIsLoading(false);
      router.push('/');
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    router.push('/');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyOtp,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};