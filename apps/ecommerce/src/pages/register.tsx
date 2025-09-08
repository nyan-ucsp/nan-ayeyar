import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Mail, User, MapPin, Globe, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { RegisterForm } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isLoading } = useAuth();
  const { t, locale } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterForm>({
    defaultValues: {
      locale: locale,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: RegisterForm) => {
    setIsSubmitting(true);
    try {
      await registerUser(data.email, data.name, data.password, data.address || '', data.locale);
      // Redirect to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        setError('email', { message: 'An account with this email already exists' });
      } else {
        setError('root', { message: error.message || 'Registration failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>{`${t('auth.register.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Create your account to start shopping for premium rice products" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🌾</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {t('auth.register.title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.register.subtitle')}
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('email', {
                        required: t('auth.messages.emailRequired'),
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      placeholder="Enter your email"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                  )}
                </div>

                {/* Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.name')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('name', {
                        required: t('auth.messages.nameRequired'),
                        minLength: {
                          value: 2,
                          message: 'Name must be at least 2 characters',
                        },
                      })}
                      type="text"
                      placeholder="Enter your full name"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('password', {
                        required: t('auth.messages.passwordRequired'),
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
                        },
                      })}
                      type="password"
                      placeholder="Enter your password"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.confirmPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('confirmPassword', {
                        required: t('auth.messages.confirmPasswordRequired'),
                        validate: (value) => {
                          const password = watch('password');
                          return value === password || 'Passwords do not match';
                        },
                      })}
                      type="password"
                      placeholder="Confirm your password"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.address')}
                  </label>
                  <div className="relative">
                    <div className="absolute top-2 left-2 z-10">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      {...register('address', {
                        required: t('auth.messages.addressRequired'),
                        minLength: {
                          value: 10,
                          message: 'Address must be at least 10 characters',
                        },
                      })}
                      rows={3}
                      placeholder="Enter your complete address"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address.message}</p>
                  )}
                </div>

                {/* Language Preference */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.register.locale')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Globe className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('locale', { required: true })}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm appearance-none bg-white"
                    >
                      <option value="en">{t('auth.register.localeEn')}</option>
                      <option value="my">{t('auth.register.localeMy')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      required
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <p className="text-gray-600">
                      {t('auth.register.terms')}
                    </p>
                  </div>
                </div>

                {/* Error message */}
                {errors.root && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{errors.root.message}</p>
                  </div>
                )}

                {/* Submit button */}
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    loading={isSubmitting}
                  >
                    {t('auth.register.registerButton')}
                  </Button>
                </div>

                {/* Sign in link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {t('auth.register.hasAccount')}{' '}
                    <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                      {t('auth.register.loginLink')}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default RegisterPage;
