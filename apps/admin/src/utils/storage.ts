// Local storage utilities for admin preferences

export const adminStorage = {
  // Auth storage
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('admin_token');
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('admin_token', token);
    } catch (error) {
      console.error('Failed to save token to localStorage:', error);
    }
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('admin_token');
    } catch (error) {
      console.error('Failed to remove token from localStorage:', error);
    }
  },

  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('admin_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('admin_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('admin_user');
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error);
    }
  },

  // Language preference
  getLanguage: (): 'en' | 'my' => {
    if (typeof window === 'undefined') return 'en';
    try {
      const lang = localStorage.getItem('admin_language');
      return (lang === 'my' || lang === 'en') ? lang : 'en';
    } catch {
      return 'en';
    }
  },

  setLanguage: (language: 'en' | 'my'): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('admin_language', language);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // Keep language preference
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};
