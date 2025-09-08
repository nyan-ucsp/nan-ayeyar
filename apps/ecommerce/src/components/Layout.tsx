import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { i18n } = useTranslation();

  return (
    <div className={`min-h-screen flex flex-col ${i18n.language === 'my' ? 'myanmar' : ''}`}>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <LanguageSwitcher />
    </div>
  );
}
