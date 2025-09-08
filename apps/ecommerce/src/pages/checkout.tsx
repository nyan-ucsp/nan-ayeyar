import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  Upload, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface PaymentMethod {
  id: string;
  type: string;
  details: {
    accountName: string;
    accountNumber: string;
  };
}

interface CompanyPaymentAccount {
  id: string;
  name: string;
  type: string;
  displayName: string;
  icon: string;
  details: {
    accountNo: string;
    accountName: string;
    phone?: string;
    branch?: string;
    swiftCode?: string;
    notes?: string;
  };
}

interface CheckoutFormData {
  paymentType: 'COD' | 'ONLINE_TRANSFER';
  selectedPaymentMethodId?: string;
  transactionId?: string;
  paymentScreenshot?: File;
  shippingAddress: string;
  phone: string;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t, locale } = useLanguage();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [companyAccounts, setCompanyAccounts] = useState<CompanyPaymentAccount[]>([]);
  const [selectedCompanyAccount, setSelectedCompanyAccount] = useState<CompanyPaymentAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadedScreenshot, setUploadedScreenshot] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<CheckoutFormData>({
    defaultValues: {
      paymentType: 'COD',
      shippingAddress: user?.address || '',
      phone: '',
    }
  });

  const paymentType = watch('paymentType');
  const selectedPaymentMethodId = watch('selectedPaymentMethodId');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load payment methods and company accounts
  useEffect(() => {
    if (isAuthenticated) {
      loadPaymentMethods();
      loadCompanyAccounts();
    }
  }, [isAuthenticated]);

  // Update company account when payment method changes
  useEffect(() => {
    if (paymentType === 'ONLINE_TRANSFER' && selectedPaymentMethodId && companyAccounts.length > 0) {
      const selectedMethod = paymentMethods.find(method => method.id === selectedPaymentMethodId);
      if (selectedMethod) {
        const matchingAccount = companyAccounts.find(account => account.type === selectedMethod.type);
        setSelectedCompanyAccount(matchingAccount || null);
      }
    } else {
      setSelectedCompanyAccount(null);
    }
  }, [paymentType, selectedPaymentMethodId, paymentMethods, companyAccounts]);

  const loadPaymentMethods = async () => {
    try {
      const response = await apiClient.getPaymentMethods();
      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const loadCompanyAccounts = async () => {
    try {
      const response = await apiClient.getCompanyPaymentAccounts();
      setCompanyAccounts(response.data);
    } catch (error) {
      console.error('Failed to load company accounts:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      const response = await apiClient.uploadFile(file);
      // Prefer processedUrl if available, else url
      const url = response?.image?.processedUrl || response?.image?.url;
      if (!url) throw new Error('No URL returned from upload API');
      setUploadedScreenshot(url);
      setValue('paymentScreenshot', file);
    } catch (error) {
      console.error('Failed to upload file:', error);
      setMessage({ type: 'error', text: 'Failed to upload payment screenshot' });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' MMK';
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.05);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 300000 ? 0 : 5000;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity
        })),
        shippingAddress: {
          name: user?.name || '',
          address: data.shippingAddress,
          phone: data.phone
        },
        paymentType: data.paymentType,
        paymentMethodId: data.selectedPaymentMethodId,
        transactionId: data.transactionId,
        paymentScreenshot: uploadedScreenshot || undefined
      };

      console.log('Creating order with data:', orderData);
      const response = await apiClient.createOrder(orderData);
      console.log('Order creation response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Check if response has the expected structure
      if (!response) {
        console.error('No response received');
        throw new Error('No response from API');
      }
      
      if (!response.order) {
        console.error('No order in response');
        console.log('Available keys in response:', Object.keys(response));
        throw new Error('No order in API response');
      }
      
      if (!response.order.id) {
        console.error('No order ID in response');
        console.log('Order object:', response.order);
        throw new Error('No order ID in API response');
      }
      
      // Clear cart and redirect to success page
      clearCart();
      console.log('Redirecting to success page with orderId:', response.order.id);
      
      try {
        console.log('Attempting router.push to:', `/order-success?orderId=${response.order.id}`);
        await router.push(`/order-success?orderId=${response.order.id}`);
        console.log('Router push completed successfully');
      } catch (routerError) {
        console.error('Router push failed:', routerError);
        console.log('Falling back to window.location');
        // Fallback: try window.location
        window.location.href = `/order-success?orderId=${response.order.id}`;
      }
      
    } catch (error: any) {
      console.error('Order creation error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create order';
      const errorDetails = error.response?.data?.details;
      
      if (errorDetails) {
        console.error('Validation errors:', errorDetails);
        setMessage({ type: 'error', text: `${errorMessage}: ${errorDetails.map((d: any) => d.msg).join(', ')}` });
      } else {
        setMessage({ type: 'error', text: errorMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentMethodDisplayName = (type: string) => {
    switch (type) {
      case 'AYA_BANK': return t('checkout.paymentMethods.ayaBank');
      case 'KBZ_BANK': return t('checkout.paymentMethods.kbzBank');
      case 'AYA_PAY': return t('checkout.paymentMethods.ayaPay');
      case 'KBZ_PAY': return t('checkout.paymentMethods.kbzPay');
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>{`${t('checkout.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {t('checkout.emptyCart')}
              </h1>
              <p className="text-gray-600 mb-8">
                {t('checkout.emptyCartSubtitle')}
              </p>
              <Button onClick={() => router.push('/products')}>
                {t('checkout.continueShopping')}
              </Button>
            </div>
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${t('checkout.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Complete your order" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('checkout.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {t('checkout.subtitle')}
            </p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-md ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <AlertCircle className="h-5 w-5" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    {t('checkout.shippingAddress')}
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.form.phone')} *
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { 
                        required: t('checkout.form.phoneRequired'),
                        pattern: {
                          value: /^[0-9+\-\s()]+$/,
                          message: t('checkout.form.invalidPhone')
                        }
                      })}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+959123456789"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('checkout.form.address')} *
                    </label>
                    <textarea
                      {...register('shippingAddress', { required: t('checkout.addressRequired') })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                        errors.shippingAddress ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={t('checkout.addressPlaceholder')}
                    />
                    {errors.shippingAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.shippingAddress.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Type Selection */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  {t('checkout.paymentMethod')}
                </h2>

                <div className="space-y-4">
                  {/* COD Option */}
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="COD"
                      {...register('paymentType')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <Truck className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('checkout.paymentTypes.cod')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('checkout.paymentTypes.codDescription')}
                        </p>
                      </div>
                    </div>
                  </label>

                  {/* Online Transfer Option */}
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="ONLINE_TRANSFER"
                      {...register('paymentType')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                    />
                    <div className="ml-3 flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t('checkout.paymentTypes.onlineTransfer')}
                        </p>
                        <p className="text-sm text-gray-500">
                          {t('checkout.paymentTypes.onlineTransferDescription')}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method Selection (for Online Transfer) */}
              {paymentType === 'ONLINE_TRANSFER' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('checkout.selectPaymentMethod')}
                  </h3>

                  {paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <label key={method.id} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            value={method.id}
                            {...register('selectedPaymentMethodId', { 
                              required: paymentType === 'ONLINE_TRANSFER' ? t('checkout.paymentMethodRequired') : false 
                            })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {getPaymentMethodDisplayName(method.type)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {method.details.accountName} - {method.details.accountNumber}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500 mb-4">
                        {t('checkout.noPaymentMethods')}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/profile')}
                      >
                        {t('checkout.addPaymentMethod')}
                      </Button>
                    </div>
                  )}

                  {errors.selectedPaymentMethodId && (
                    <p className="mt-2 text-sm text-red-600">{errors.selectedPaymentMethodId.message}</p>
                  )}
                </div>
              )}

              {/* Company Payment Account Info */}
              {paymentType === 'ONLINE_TRANSFER' && selectedCompanyAccount && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-4">
                    {t('checkout.transferTo')} {selectedCompanyAccount.displayName}
                  </h3>
                  
                  <div className="bg-white rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('checkout.accountName')}:</span>
                      <span className="text-sm font-medium">{selectedCompanyAccount.details.accountName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">{t('checkout.accountNumber')}:</span>
                      <span className="text-sm font-medium">{selectedCompanyAccount.details.accountNo}</span>
                    </div>
                    {selectedCompanyAccount.details.branch && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">{t('checkout.branch')}:</span>
                        <span className="text-sm font-medium">{selectedCompanyAccount.details.branch}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>{t('checkout.important')}:</strong> {t('checkout.transferInstructions')}
                    </p>
                  </div>
                </div>
              )}

              {/* Transaction Details (for Online Transfer) */}
              {paymentType === 'ONLINE_TRANSFER' && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t('checkout.transactionDetails')}
                  </h3>

                  <div className="space-y-4">
                    {/* Transaction ID */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('checkout.transactionId')} *
                      </label>
                      <input
                        type="text"
                        {...register('transactionId', { 
                          required: paymentType === 'ONLINE_TRANSFER' ? t('checkout.transactionIdRequired') : false 
                        })}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          errors.transactionId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder={t('checkout.transactionIdPlaceholder')}
                      />
                      {errors.transactionId && (
                        <p className="mt-1 text-sm text-red-600">{errors.transactionId.message}</p>
                      )}
                    </div>

                    {/* Payment Screenshot */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('checkout.paymentScreenshot')} ({t('common.optional')})
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                              <span>{t('checkout.uploadScreenshot')}</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleFileUpload(file);
                                  }
                                }}
                              />
                            </label>
                            <p className="pl-1">{t('checkout.orDragDrop')}</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB
                          </p>
                        </div>
                      </div>
                      {uploadedScreenshot && (
                        <div className="mt-3">
                          <div className="flex items-center text-sm text-green-600 mb-2">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {t('checkout.screenshotUploaded')}
                          </div>
                          <div className="w-full max-w-xs">
                            <img
                              src={uploadedScreenshot}
                              alt="Payment screenshot preview"
                              className="w-full h-auto rounded border"
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('checkout.orderSummary')}
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg">🌾</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.subtotal')}</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.shipping')}</span>
                    <span className="font-medium text-green-600">
                      {calculateShipping() === 0 ? 'Free' : formatPrice(calculateShipping())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.tax')}</span>
                    <span className="font-medium">{formatPrice(calculateTax())}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        {t('cart.total')}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full mb-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('checkout.placingOrder') : t('checkout.placeOrder')}
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    {t('cart.freeShipping')}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CheckoutPage;
