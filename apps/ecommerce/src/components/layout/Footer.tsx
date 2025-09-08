import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.products'), href: '/products' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  const customerService = [
    { name: t('footer.shipping'), href: '/shipping' },
    { name: t('footer.returns'), href: '/returns' },
    { name: t('footer.faq'), href: '/faq' },
    { name: t('footer.contact'), href: '/contact' },
  ];

  const legal = [
    { name: t('footer.privacy'), href: '/privacy' },
    { name: t('footer.terms'), href: '/terms' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              <span className="text-xl font-bold">
                {process.env.NEXT_PUBLIC_APP_NAME}
              </span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875zm-7.83 1.75c-1.297 0-2.448.49-3.323 1.297-.807.875-1.297 2.026-1.297 3.323s.49 2.448 1.297 3.323c.875.807 2.026 1.297 3.323 1.297s2.448-.49 3.323-1.297c.807-.875 1.297-2.026 1.297-3.323s-.49-2.448-1.297-3.323c-.875-.807-2.026-1.297-3.323-1.297z"/>
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.customerService')}</h3>
            <ul className="space-y-2">
              {customerService.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.newsletter')}</h3>
            <p className="text-gray-300 text-sm">
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="space-y-3">
              <div>
                <input
                  type="email"
                  placeholder={t('footer.newsletterPlaceholder')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                {t('footer.subscribe')}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-gray-400 text-sm">
                {t('footer.copyright')}
              </p>
              <div className="flex space-x-6">
                {legal.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">Follow us:</span>
              <div className="flex space-x-2">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.281c-.49 0-.875-.385-.875-.875s.385-.875.875-.875.875.385.875.875-.385.875-.875.875zm-7.83 1.75c-1.297 0-2.448.49-3.323 1.297-.807.875-1.297 2.026-1.297 3.323s.49 2.448 1.297 3.323c.875.807 2.026 1.297 3.323 1.297s2.448-.49 3.323-1.297c.807-.875 1.297-2.026 1.297-3.323s-.49-2.448-1.297-3.323c-.875-.807-2.026-1.297-3.323-1.297z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
