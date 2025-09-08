import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface OtpForm {
  otp: string;
  root?: string;
}

const VerifyOtpPage: React.FC = () => {
  const router = useRouter();
  const { verifyOtp, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
    clearErrors,
  } = useForm<OtpForm>();

  const otpValue = watch('otp');

  // Get email from query params
  useEffect(() => {
    const { email: queryEmail } = router.query;
    if (queryEmail && typeof queryEmail === 'string') {
      setEmail(queryEmail);
    } else {
      // Redirect to register if no email
      router.push('/register');
    }
  }, [router]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-format OTP input
  useEffect(() => {
    if (otpValue && otpValue.length > 6) {
      setValue('otp', otpValue.slice(0, 6));
    }
  }, [otpValue, setValue]);

  const onSubmit = async (data: OtpForm) => {
    if (!email) return;

    setIsSubmitting(true);
    try {
      await verifyOtp(email, data.otp);
      // Redirect will happen automatically via useEffect
    } catch (error: any) {
      console.error('OTP verification error:', error);
      
      // Handle API error response
      if (error.response?.data) {
        const { error: errorMessage, errorCode, remainingAttempts } = error.response.data;
        
        switch (errorCode) {
          case 'INVALID_OTP':
            setError('otp', { 
              message: errorMessage || t('auth.otp.invalidCode'),
              type: 'manual'
            });
            break;
          case 'OTP_EXPIRED':
            setError('otp', { 
              message: errorMessage || t('auth.otp.expiredCode'),
              type: 'manual'
            });
            break;
          case 'MAX_ATTEMPTS_EXCEEDED':
            setError('otp', { 
              message: errorMessage || t('auth.otp.maxAttempts'),
              type: 'manual'
            });
            break;
          default:
            setError('root', { 
              message: errorMessage || 'OTP verification failed',
              type: 'manual'
            });
        }
      } else {
        // Handle network or other errors
        setError('root', { 
          message: error.message || 'OTP verification failed. Please try again.',
          type: 'manual'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || resendTimer > 0) return;

    setIsResending(true);
    try {
      await apiClient.requestOtp({ email });
      setResendTimer(60); // 60 seconds cooldown
    } catch (error: any) {
      setError('root', { message: error.message || 'Failed to resend OTP' });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToRegister = () => {
    router.push('/register');
  };

  const clearOtpInput = () => {
    setValue('otp', '');
    clearErrors(['otp', 'root']);
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
        <title>{`${t('auth.otp.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Verify your email address to complete registration" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                {t('auth.otp.title')}
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {t('auth.otp.subtitle')}
              </p>
              {email && (
                <p className="mt-1 text-sm font-medium text-primary-600">
                  {email}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.otp.code')}
                  </label>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-6 gap-2">
                      {[...Array(6)].map((_, index) => (
                        <input
                          key={index}
                          type="text"
                          maxLength={1}
                          className={`w-12 h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                            errors.otp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          value={otpValue?.[index] || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 1) {
                              const newOtp = (otpValue || '').split('');
                              newOtp[index] = value;
                              setValue('otp', newOtp.join(''));
                              
                              // Clear any existing errors when user starts typing
                              clearErrors(['otp', 'root']);
                              
                              // Auto-focus next input
                              if (value && index < 5) {
                                const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                                nextInput?.focus();
                              }
                            }
                          }}
                          onKeyDown={(e) => {
                            // Handle backspace
                            if (e.key === 'Backspace' && !otpValue?.[index] && index > 0) {
                              const target = e.target as HTMLInputElement;
                              const prevInput = target.parentElement?.children[index - 1] as HTMLInputElement;
                              prevInput?.focus();
                            }
                            
                            // Clear errors when user starts typing (including backspace)
                            if (e.key === 'Backspace' || (e.key.length === 1 && /[0-9]/.test(e.key))) {
                              clearErrors(['otp', 'root']);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  {errors.otp && (
                    <div className="mt-2 text-center">
                      <p className="text-sm text-red-600 mb-2">{errors.otp.message}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearOtpInput}
                        className="text-red-600 hover:text-red-700"
                      >
                        Clear and try again
                      </Button>
                    </div>
                  )}
                </div>

                {/* Error message */}
                {errors.root && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600 mb-2">{errors.root.message}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearOtpInput}
                      className="text-red-600 hover:text-red-700"
                    >
                      Clear and try again
                    </Button>
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
                    disabled={!otpValue || otpValue.length !== 6}
                  >
                    {t('auth.otp.verifyButton')}
                  </Button>
                </div>

                {/* Resend OTP */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Didn't receive the code?
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    loading={isResending}
                    disabled={resendTimer > 0}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : 'Resend OTP'
                    }
                  </Button>
                </div>

                {/* Back to register */}
                <div className="text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToRegister}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Registration
                  </Button>
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

export default VerifyOtpPage;
