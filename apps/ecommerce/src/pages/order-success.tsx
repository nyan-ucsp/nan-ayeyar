import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { CheckCircle, ShoppingBag, Package, Clock, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Order {
  id: string;
  status: string;
  paymentType: string;
  totalAmount: number;
  transactionId: string;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    product: {
      id: string;
      name_en: string;
      name_my: string;
      images: string[];
    };
  }>;
}

const OrderSuccessPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const { t, locale } = useLanguage();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId && typeof orderId === 'string') {
      loadOrder(orderId);
    }
  }, [orderId]);

  const loadOrder = async (id: string) => {
    try {
      const response = await apiClient.getOrder(id);
      setOrder(response.order);
    } catch (error: any) {
      console.error('Failed to load order:', error);
      setError(error.response?.data?.error || 'Failed to load order details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' MMK';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'my' ? 'my-MM' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductName = (product: any) => {
    return locale === 'my' && product.name_my ? product.name_my : product.name_en;
  };

  const getStatusText = (status: string) => {
    return t(`orders.statuses.${status}`);
  };

  const getPaymentTypeText = (paymentType: string) => {
    return paymentType === 'COD' ? t('checkout.cod') : t('checkout.onlineTransfer');
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{`${t('checkout.success.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <Head>
          <title>{`${t('checkout.success.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        </Head>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('errors.notFound')}
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {error || t('orders.empty')}
              </p>
              <Button onClick={() => router.push('/products')}>
                {t('checkout.success.continueShopping')}
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
        <title>{`${t('checkout.success.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Order placed successfully" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('checkout.success.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('checkout.success.subtitle')}
            </p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('checkout.success.orderNumber')}: #{order.id.slice(-8).toUpperCase()}
              </h2>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {formatDate(order.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('orders.status')}
                </h3>
                <p className="text-sm text-gray-600">
                  {getStatusText(order.status)}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('checkout.paymentMethod')}
                </h3>
                <p className="text-sm text-gray-600">
                  {getPaymentTypeText(order.paymentType)}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">₿</span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {t('cart.total')}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatPrice(Number(order.totalAmount))}
                </p>
              </div>
            </div>

            {order.transactionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">
                  {t('checkout.transactionId')}
                </h3>
                <p className="text-sm text-gray-600 font-mono">
                  {order.transactionId}
                </p>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('orders.details.items')}
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={getProductName(item.product)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-2xl">🌾</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-gray-900">
                      {getProductName(item.product)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t('cart.quantity')}: {item.quantity}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      {formatPrice(Number(item.unitPrice) * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPrice(Number(item.unitPrice))} {t('products.price')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/orders')}
              variant="outline"
              size="lg"
              className="flex items-center justify-center"
            >
              <Package className="h-5 w-5 mr-2" />
              {t('checkout.success.trackOrder')}
            </Button>

            <Button
              onClick={() => router.push('/orders')}
              variant="outline"
              size="lg"
              className="flex items-center justify-center"
            >
              <Package className="h-5 w-5 mr-2" />
              {t('checkout.success.viewMyOrders')}
            </Button>

            <Button
              onClick={() => router.push('/products')}
              size="lg"
              className="flex items-center justify-center"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              {t('checkout.success.continueShopping')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {t('checkout.success.additionalInfo')}
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default OrderSuccessPage;
