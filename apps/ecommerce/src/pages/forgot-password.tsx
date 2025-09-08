import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiClient } from '@/lib/api';

interface ForgotPasswordForm {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordForm>();

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await apiClient.forgotPassword(data.email);
      // Redirect to reset password page with email
      router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error || t('auth.forgotPassword.errorMessage');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{`${t('auth.forgotPassword.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Reset your password" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {/* Back to login link */}
            <div className="mb-6">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('auth.forgotPassword.backToLogin')}
              </Link>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {t('auth.forgotPassword.title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.forgotPassword.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('auth.forgotPassword.email')}
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
                        message: t('auth.messages.invalidEmail'),
                      },
                    })}
                    type="email"
                    placeholder={t('auth.forgotPassword.emailPlaceholder')}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
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
                  {t('auth.forgotPassword.submitButton')}
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

export default ForgotPasswordPage;
