import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
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

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Admin Login - {process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}</title>
          <meta name="description" content="Admin login for Nan Ayeyar" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  const onSubmit = async (data: LoginForm) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      // Redirect will happen automatically via useEffect
    } catch (error: any) {
      if (error.message.includes('Invalid credentials')) {
        setError('root', { message: 'Invalid email or password' });
      } else if (error.message.includes('Admin role required')) {
        setError('root', { message: 'Access denied. Admin role required.' });
      } else {
        setError('root', { message: error.message || 'Login failed' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        <title>Admin Login - {process.env.NEXT_PUBLIC_ADMIN_APP_NAME || 'Nan Ayeyar Admin'}</title>
        <meta name="description" content="Admin login for Nan Ayeyar management system" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Admin Login
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the admin dashboard
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div className="relative">
                <Input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  error={errors.email?.message}
                  className="pl-10"
                />
                <div className="absolute bottom-3 left-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <Input
                  {...register('password', {
                    required: 'Password is required',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  className="pl-10 pr-10"
                />
                <div className="absolute bottom-3 left-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <button
                  type="button"
                  className="absolute bottom-3 right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <input
                  {...register('rememberMe')}
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
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
                  Sign In
                </Button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                This is a secure admin area. Only authorized personnel should access this system.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
