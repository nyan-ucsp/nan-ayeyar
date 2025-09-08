import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'my', name: 'မြန်မာ', flag: '🇲🇲' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    setLocale(languageCode as 'en' | 'my');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-gray-300"
        >
          <span className="mr-2">{currentLanguage.flag}</span>
          <span className="hidden sm:inline">{currentLanguage.name}</span>
        </Button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                  locale === language.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                }`}
              >
                <span className="mr-3">{language.flag}</span>
                {language.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
