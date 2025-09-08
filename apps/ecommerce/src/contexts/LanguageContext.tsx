import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useHydration } from '@/hooks/useHydration';

type Locale = 'en' | 'my';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { i18n } = useTranslation();
  const [locale, setLocale] = useState<Locale>('en');
  const isHydrated = useHydration();

  // Initialize language from localStorage after hydration
  useEffect(() => {
    if (!isHydrated) return;

    const savedLanguage = localStorage.getItem('i18nextLng') as Locale;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'my')) {
      setLocale(savedLanguage);
      if (i18n.language !== savedLanguage) {
        i18n.changeLanguage(savedLanguage);
      }
    } else {
      // Set default language
      setLocale('en');
      i18n.changeLanguage('en');
    }
  }, [i18n, isHydrated]);

  // Listen for language changes from i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setLocale(lng as Locale);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    i18n.changeLanguage(newLocale);
    // Save to localStorage
    localStorage.setItem('i18nextLng', newLocale);
  };

  const t = (key: string): string => {
    return i18n.t(key);
  };

  const value: LanguageContextType = {
    locale,
    setLocale: handleSetLocale,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};