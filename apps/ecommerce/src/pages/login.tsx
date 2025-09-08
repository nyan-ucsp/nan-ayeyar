import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LoginForm } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginForm>();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      // Redirect will happen automatically via useEffect
    } catch (error: any) {
      if (error.message.includes('Invalid credentials')) {
        setError('root', { message: t('auth.messages.invalidCredentials') });
      } else {
        setError('root', { message: error.message || 'Login failed' });
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
        <title>{`${t('auth.login.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Login to your account to access premium rice products" />
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
                {t('auth.login.title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.login.subtitle')}
              </p>
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.login.email')}
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

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.login.password')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('password', {
                        required: t('auth.messages.passwordRequired'),
                      })}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        errors.password ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                  )}
                </div>

                {/* Remember me and Forgot password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      {...register('rememberMe')}
                      type="checkbox"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      {t('auth.login.rememberMe')}
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                      {t('auth.login.forgotPassword')}
                    </Link>
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
                    {t('auth.login.loginButton')}
                  </Button>
                </div>

                {/* Sign up link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {t('auth.login.noAccount')}{' '}
                    <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
                      {t('auth.login.signUpLink')}
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

export default LoginPage;
