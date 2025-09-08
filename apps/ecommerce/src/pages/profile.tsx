import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { 
  User, 
  Mail, 
  MapPin, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { User as UserType, PaymentMethod } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { apiClient } from '@/lib/api';

interface ProfileFormData {
  name: string;
  email: string;
  address: string;
}

interface PaymentMethodFormData {
  type: string;
  accountName: string;
  accountNumber: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshUser } = useAuth();
  const { t, locale } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'payment' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword
  } = useForm<PasswordFormData>();

  const {
    register: registerPayment,
    handleSubmit: handleSubmitPayment,
    formState: { errors: paymentErrors },
    reset: resetPayment,
  } = useForm<PaymentMethodFormData>();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load user data
  useEffect(() => {
    if (user && isAuthenticated) {
      resetProfile({
        name: user.name,
        email: user.email,
        address: (user as UserType).address || '',
      });
      loadPaymentMethods();
    }
  }, [user, isAuthenticated, resetProfile]);


  const loadPaymentMethods = async () => {
    try {
      const response = await apiClient.getPaymentMethods();
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setMessage(null); // Clear any previous messages
    
    try {
      const response = await apiClient.updateProfile({
        name: data.name,
        address: data.address,
        locale: locale
      });
      
      // Update the user context with the new data
      await refreshUser();
      
      setIsEditing(false);
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.error || t('profile.updateError');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await apiClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      setMessage({ type: 'success', text: t('profile.passwordChangeSuccess') });
      resetPassword();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.error || t('profile.passwordChangeError');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPayment = async (data: PaymentMethodFormData) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      if (editingPaymentMethod) {
        // Update existing payment method
        await apiClient.updatePaymentMethod(editingPaymentMethod, {
          type: data.type,
          details: {
            accountName: data.accountName,
            accountNumber: data.accountNumber,
          },
        });
        setMessage({ type: 'success', text: t('profile.paymentMethodUpdated') });
      } else {
        // Add new payment method
        await apiClient.addPaymentMethod({
          type: data.type,
          details: {
            accountName: data.accountName,
            accountNumber: data.accountNumber,
          },
        });
        setMessage({ type: 'success', text: t('profile.paymentMethodAdded') });
      }
      
      setShowAddPayment(false);
      setEditingPaymentMethod(null);
      resetPayment();
      loadPaymentMethods();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to save payment method:', error);
      const errorMessage = error.response?.data?.error || t('profile.paymentMethodError');
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const editPaymentMethod = (method: PaymentMethod) => {
    setEditingPaymentMethod(method.id);
    setShowAddPayment(true);
    resetPayment({
      type: method.type,
      accountName: method.details.accountName,
      accountNumber: method.details.accountNumber,
    });
  };

  const deletePaymentMethod = async (id: string) => {
    if (confirm(t('profile.confirmDelete'))) {
      try {
        await apiClient.deletePaymentMethod(id);
        setMessage({ type: 'success', text: t('profile.paymentMethodDeleted') });
        loadPaymentMethods();
        setTimeout(() => setMessage(null), 3000);
      } catch (error: any) {
        console.error('Failed to delete payment method:', error);
        const errorMessage = error.response?.data?.error || t('profile.paymentMethodError');
        setMessage({ type: 'error', text: errorMessage });
      }
    }
  };


  const getPaymentMethodDisplayName = (type: string) => {
    switch (type) {
      case 'AYA_BANK':
        return t('checkout.paymentMethods.ayaBank');
      case 'KBZ_BANK':
        return t('checkout.paymentMethods.kbzBank');
      case 'AYA_PAY':
        return t('checkout.paymentMethods.ayaPay');
      case 'KBZ_PAY':
        return t('checkout.paymentMethods.kbzPay');
      default:
        return type;
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{`${t('profile.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Manage your profile, view orders, and payment methods" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('profile.title')}</h1>
            <p className="mt-2 text-gray-600">
              {t('profile.personalInfo')}
            </p>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <User className="h-4 w-4 inline mr-2" />
                  {t('profile.personalInfo')}
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'payment'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4 inline mr-2" />
                  {t('profile.paymentMethods')}
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'password'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Lock className="h-4 w-4 inline mr-2" />
                  {t('profile.changePassword')}
                </button>
              </nav>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{t('profile.personalInfo')}</h2>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.form.name')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerProfile('name', { required: t('auth.messages.nameRequired') })}
                        type="text"
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                          profileErrors.name ? 'border-red-300' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    {profileErrors.name && (
                      <p className="text-sm text-red-600 mt-1">{profileErrors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.form.email')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...registerProfile('email', { 
                          required: t('auth.messages.emailRequired'),
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address',
                          }
                        })}
                        type="email"
                        disabled={true}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                          profileErrors.email ? 'border-red-300' : 'border-gray-300'
                        } bg-gray-50 cursor-not-allowed`}
                      />
                    </div>
                    {profileErrors.email && (
                      <p className="text-sm text-red-600 mt-1">{profileErrors.email.message}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Email cannot be changed for security reasons
                    </p>
                  </div>

                  {/* Address */}
                  <div className="relative md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('profile.form.address')}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <textarea
                        {...registerProfile('address', { required: t('auth.messages.addressRequired') })}
                        rows={3}
                        disabled={!isEditing}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                          profileErrors.address ? 'border-red-300' : 'border-gray-300'
                        } ${!isEditing ? 'bg-gray-50' : ''}`}
                      />
                    </div>
                    {profileErrors.address && (
                      <p className="text-sm text-red-600 mt-1">{profileErrors.address.message}</p>
                    )}
                  </div>

                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        resetProfile();
                      }}
                    >
                      {t('common.cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                    >
                      {t('profile.form.updateProfile')}
                    </Button>
                  </div>
                )}
              </form>
            </Card>
          )}


          {/* Payment Methods Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{t('profile.paymentMethods')}</h2>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowAddPayment(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t('profile.addPaymentMethod')}
                  </Button>
                </div>

                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('profile.noPaymentMethods')}</h3>
                    <p className="text-gray-600 mb-4">{t('profile.addFirst')}</p>
                    <Button onClick={() => setShowAddPayment(true)}>
                      {t('profile.addPaymentMethod')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <CreditCard className="h-5 w-5 text-gray-400" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {getPaymentMethodDisplayName(method.type)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {method.details.accountName} - {method.details.accountNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => editPaymentMethod(method)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deletePaymentMethod(method.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Add Payment Method Modal */}
              {showAddPayment && (
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingPaymentMethod ? t('profile.editPaymentMethod') : t('profile.addPaymentMethod')}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowAddPayment(false);
                        setEditingPaymentMethod(null);
                        resetPayment();
                      }}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmitPayment(onSubmitPayment)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.paymentMethods.title')}
                        </label>
                        <select
                          {...registerPayment('type', { required: 'Payment method is required' })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        >
                          <option value="">Select payment method</option>
                          <option value="AYA_BANK">{t('checkout.paymentMethods.ayaBank')}</option>
                          <option value="KBZ_BANK">{t('checkout.paymentMethods.kbzBank')}</option>
                          <option value="AYA_PAY">{t('checkout.paymentMethods.ayaPay')}</option>
                          <option value="KBZ_PAY">{t('checkout.paymentMethods.kbzPay')}</option>
                        </select>
                        {paymentErrors.type && (
                          <p className="text-sm text-red-600 mt-1">{paymentErrors.type.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.paymentMethods.accountName')}
                        </label>
                        <input
                          {...registerPayment('accountName', { required: 'Account name is required' })}
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {paymentErrors.accountName && (
                          <p className="text-sm text-red-600 mt-1">{paymentErrors.accountName.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('checkout.paymentMethods.accountNumber')}
                        </label>
                        <input
                          {...registerPayment('accountNumber', { required: 'Account number is required' })}
                          type="text"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        {paymentErrors.accountNumber && (
                          <p className="text-sm text-red-600 mt-1">{paymentErrors.accountNumber.message}</p>
                        )}
                      </div>

                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowAddPayment(false);
                          setEditingPaymentMethod(null);
                          resetPayment();
                        }}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isSubmitting}
                      >
                        {editingPaymentMethod ? t('common.save') : t('profile.addPaymentMethod')}
                      </Button>
                    </div>
                  </form>
                </Card>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {t('profile.changePassword')}
                  </h3>
                  
                  <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.currentPassword')}
                      </label>
                      <div className="relative">
                        <input
                          {...registerPassword('currentPassword', { 
                            required: t('profile.currentPasswordRequired') 
                          })}
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.newPassword')}
                      </label>
                      <div className="relative">
                        <input
                          {...registerPassword('newPassword', { 
                            required: t('profile.newPasswordRequired'),
                            minLength: {
                              value: 8,
                              message: t('profile.passwordMinLength')
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                              message: t('profile.passwordPattern')
                            }
                          })}
                          type={showNewPassword ? 'text' : 'password'}
                          className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('profile.confirmPassword')}
                      </label>
                      <div className="relative">
                        <input
                          {...registerPassword('confirmPassword', { 
                            required: t('profile.confirmPasswordRequired'),
                            validate: (value) => 
                              value === watchPassword('newPassword') || t('profile.passwordsDoNotMatch')
                          })}
                          type={showConfirmPassword ? 'text' : 'password'}
                          className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isSubmitting}
                      >
                        {t('profile.changePassword')}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProfilePage;
