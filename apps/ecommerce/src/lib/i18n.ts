import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslations from '../locales/en.json';
import myTranslations from '../locales/my.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  my: {
    translation: myTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Always start with 'en' to match server-side rendering
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    // Enable language persistence
    saveMissing: false,
    // Disable language detection to prevent hydration mismatch
    detection: {
      order: [],
      caches: [],
    },
  });

export default i18n;