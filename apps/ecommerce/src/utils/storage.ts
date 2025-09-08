// Local storage utilities for cart and user preferences

export const storage = {
  // Cart storage
  getCart: (): any[] => {
    if (typeof window === 'undefined') return [];
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  },

  setCart: (cart: any[]): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  },

  clearCart: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('cart');
    } catch (error) {
      console.error('Failed to clear cart from localStorage:', error);
    }
  },

  // Auth storage
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem('auth_token');
    } catch {
      return null;
    }
  },

  setToken: (token: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('auth_token', token);
    } catch (error) {
      console.error('Failed to save token to localStorage:', error);
    }
  },

  removeToken: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.error('Failed to remove token from localStorage:', error);
    }
  },

  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user to localStorage:', error);
    }
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Failed to remove user from localStorage:', error);
    }
  },

  // Language preference
  getLanguage: (): 'en' | 'my' => {
    if (typeof window === 'undefined') return 'en';
    try {
      const lang = localStorage.getItem('language');
      return (lang === 'my' || lang === 'en') ? lang : 'en';
    } catch {
      return 'en';
    }
  },

  setLanguage: (language: 'en' | 'my'): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('language', language);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  },

  // Clear all data
  clearAll: (): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem('cart');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Keep language preference
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};
