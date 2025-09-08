import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, Eye, EyeOff, Key } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiClient } from '@/lib/api';

interface ResetPasswordForm {
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError
  } = useForm<ResetPasswordForm>();

  // Get email from URL query
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email as string);
    } else {
      // Redirect to forgot password if no email
      router.push('/forgot-password');
    }
  }, [router.query.email, router]);

  const onSubmit = async (data: ResetPasswordForm) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await apiClient.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword
      });
      
      // Auto-login the user after successful password reset
      if (response.data && response.data.token) {
        await login(email, data.newPassword);
        // Redirect to home page
        router.push('/');
      } else {
        setMessage({ 
          type: 'success', 
          text: t('auth.resetPassword.successMessage') 
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || t('auth.resetPassword.errorMessage');
      setMessage({ type: 'error', text: errorMessage });
      
      // Set specific field errors if available
      if (error.response?.data?.details) {
        error.response.data.details.forEach((detail: any) => {
          if (detail.path === 'otp') {
            setError('otp', { message: detail.msg });
          } else if (detail.path === 'newPassword') {
            setError('newPassword', { message: detail.msg });
          }
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{`${t('auth.resetPassword.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Reset your password" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Back to forgot password link */}
            <div className="mb-6">
              <Link 
                href="/forgot-password" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('auth.resetPassword.backToForgotPassword')}
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {t('auth.resetPassword.title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.resetPassword.subtitle')}
              </p>
              <p className="mt-1 text-sm font-medium text-primary-600">
                {email}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* OTP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.resetPassword.otp')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('otp', {
                      required: t('auth.resetPassword.otpRequired'),
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: t('auth.resetPassword.otpInvalid'),
                      },
                    })}
                    type="text"
                    placeholder={t('auth.resetPassword.otpPlaceholder')}
                    maxLength={6}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.otp ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.otp && (
                  <p className="text-sm text-red-600 mt-1">{errors.otp.message}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.resetPassword.newPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('newPassword', {
                      required: t('auth.resetPassword.newPasswordRequired'),
                      minLength: {
                        value: 8,
                        message: t('auth.resetPassword.passwordMinLength')
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: t('auth.resetPassword.passwordPattern')
                      }
                    })}
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder={t('auth.resetPassword.newPasswordPlaceholder')}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.resetPassword.confirmPassword')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('confirmPassword', {
                      required: t('auth.resetPassword.confirmPasswordRequired'),
                      validate: (value) => 
                        value === watch('newPassword') || t('auth.resetPassword.passwordsDoNotMatch')
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder={t('auth.resetPassword.confirmPasswordPlaceholder')}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Message */}
              {message && (
                <div className={`p-4 rounded-md ${
                  message.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <p className="text-sm">{message.text}</p>
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
                  {t('auth.resetPassword.submitButton')}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ResetPasswordPage;
