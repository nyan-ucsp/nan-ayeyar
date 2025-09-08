import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { adminApiClient } from '@/lib/api';
import { 
  User, 
  Mail, 
  MapPin, 
  Shield, 
  Eye, 
  EyeOff, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import AdminLayout from '@/components/layout/AdminLayout';
import toast from 'react-hot-toast';

interface ProfileFormData {
  name: string;
  email: string;
  address: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<ProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      address: user?.address || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm<PasswordFormData>();

  const newPassword = watch('newPassword');

  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const updatedUser = await adminApiClient.updateProfile({
        name: data.name,
        address: data.address,
      });
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      toast.success('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update profile';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      await adminApiClient.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      toast.success('Password changed successfully!');
      resetPassword();
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.error || 'Failed to change password';
      setMessage({ type: 'error', text: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600">Manage your account information and security settings</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-md ${
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
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'password'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Shield className="h-4 w-4 inline mr-2" />
              Change Password
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile Information</h2>
              <p className="text-gray-600">Update your personal information and contact details.</p>
            </div>

            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile('name', { required: 'Name is required' })}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                        profileErrors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {profileErrors.name && (
                    <p className="text-sm text-red-600 mt-1">{profileErrors.name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...registerProfile('email', { 
                        required: 'Email is required',
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
                      placeholder="Enter your email"
                    />
                  </div>
                  {profileErrors.email && (
                    <p className="text-sm text-red-600 mt-1">{profileErrors.email.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed for security reasons
                  </p>
                </div>
              </div>

              {/* Address */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    {...registerProfile('address', { required: 'Address is required' })}
                    rows={3}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      profileErrors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your address"
                  />
                </div>
                {profileErrors.address && (
                  <p className="text-sm text-red-600 mt-1">{profileErrors.address.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  className="flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h2>
              <p className="text-gray-600">Update your password to keep your account secure.</p>
            </div>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-6">
              {/* Current Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerPassword('currentPassword', { required: 'Current password is required' })}
                    type={showCurrentPassword ? 'text' : 'password'}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      passwordErrors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>
                )}
              </div>

              {/* New Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      }
                    })}
                    type={showNewPassword ? 'text' : 'password'}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      passwordErrors.newPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...registerPassword('confirmPassword', { 
                      required: 'Please confirm your password',
                      validate: value => value === newPassword || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`block w-full pl-10 pr-10 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
                      passwordErrors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Confirm your new password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
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
                  className="flex items-center"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Account Actions */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Actions</h3>
            <p className="text-gray-600">Manage your account session and security.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center text-red-600 border-red-300 hover:bg-red-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AccountPage;
