import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ShoppingCart, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import { cn } from '@/utils/cn';

const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { locale, setLocale, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  const toggleLanguage = () => {
    setLocale(locale === 'en' ? 'my' : 'en');
  };

  const navigation = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.products'), href: '/products' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.contact'), href: '/contact' },
  ];

  const handleNavigation = (href: string) => {
    console.log('Navigating to:', href);
    router.push(href);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center space-x-3">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌾</span>
              </div>
              {/* Brand name - only show on desktop */}
              <span className="hidden md:block text-xl font-bold text-gray-900">
                {process.env.NEXT_PUBLIC_APP_NAME}
              </span>
            </Link>
            
            {/* Mobile menu button - positioned next to logo */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 relative z-50">
            {navigation.map((item) => (
              <button
                key={item.name}
                className={cn(
                  'text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors cursor-pointer relative z-50 bg-transparent border-none',
                  router.pathname === item.href && 'text-primary-600'
                )}
                onClick={() => handleNavigation(item.href)}
              >
                {item.name}
              </button>
            ))}
          </nav>


          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="hidden sm:flex"
            >
              {locale === 'en' ? 'မြန်မာ' : 'English'}
            </Button>

            {/* Cart */}
            <Link href="/cart" className="relative p-2 text-gray-700 hover:text-primary-600">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative group">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:block">{user?.name}</span>
                </Button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('navigation.profile')}
                  </Link>
                  <Link
                    href="/orders"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('navigation.orders')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {t('navigation.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    {t('navigation.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    {t('navigation.register')}
                  </Button>
                </Link>
              </div>
            )}

          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="space-y-4">
              {/* Mobile Branding */}
              <div className="px-2">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">🌾</span>
                  </div>
                  <span className="text-xl font-bold text-gray-900">
                    {process.env.NEXT_PUBLIC_APP_NAME}
                  </span>
                </Link>
              </div>


              {/* Mobile Navigation */}
              {navigation.map((item) => (
                <button
                  key={item.name}
                  className={cn(
                    'block w-full text-left px-3 py-2 text-base font-medium transition-colors cursor-pointer bg-transparent border-none',
                    router.pathname === item.href
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  )}
                  onClick={() => {
                    console.log('Mobile navigating to:', item.href);
                    handleNavigation(item.href);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {item.name}
                </button>
              ))}

              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                {locale === 'en' ? 'မြန်မာ' : 'English'}
              </button>

              {/* Mobile Auth */}
              {!isAuthenticated && (
                <div className="px-3 py-2 space-y-2">
                  <Link href="/login" className="block">
                    <Button variant="outline" className="w-full">
                      {t('navigation.login')}
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button variant="primary" className="w-full">
                      {t('navigation.register')}
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
