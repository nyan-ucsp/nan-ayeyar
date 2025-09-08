import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  RotateCcw,
  Edit3,
  AlertCircle,
  MapPin,
  CreditCard,
  Calendar,
  User
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name_en: string;
    name_my: string;
    images: string[];
  };
}

interface Order {
  id: string;
  status: string;
  paymentType: string;
  totalAmount: number;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    name: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  paymentMethod?: {
    id: string;
    type: string;
    accountNumber: string;
    accountName: string;
  };
}

const OrderTrackingPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t, locale } = useLanguage();
  const { user } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingTransaction, setIsEditingTransaction] = useState(false);
  const [newTransactionId, setNewTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadOrder(id);
    }
  }, [id]);

  const loadOrder = async (orderId: string) => {
    try {
      const response = await apiClient.getOrder(orderId);
      setOrder(response.order);
      setNewTransactionId(response.order.transactionId || '');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'PROCESSING':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'SHIPPED':
        return <Truck className="h-5 w-5 text-purple-600" />;
      case 'DELIVERED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'CANCELED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'RETURNED':
        return <RotateCcw className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELED':
        return 'bg-red-100 text-red-800';
      case 'RETURNED':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEditTransaction = () => {
    return order && ['PENDING', 'PROCESSING'].includes(order.status) && order.paymentType === 'ONLINE_TRANSFER';
  };

  const canCancelOrder = () => {
    return order && ['PENDING', 'PROCESSING'].includes(order.status);
  };

  const canReturnOrder = () => {
    return order && order.status === 'DELIVERED';
  };

  const handleEditTransaction = async () => {
    if (!order || !newTransactionId.trim()) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await apiClient.updateOrderTransaction(order.id, newTransactionId);
      setOrder({ ...order, transactionId: newTransactionId });
      setIsEditingTransaction(false);
      setMessage({ type: 'success', text: t('orders.transactionUpdated') });
    } catch (error: any) {
      console.error('Failed to update transaction:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || t('orders.updateFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    if (!confirm(t('orders.confirmCancel'))) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await apiClient.cancelOrder(order.id);
      setOrder({ ...order, status: 'CANCELED' });
      setMessage({ type: 'success', text: t('orders.orderCancelled') });
    } catch (error: any) {
      console.error('Failed to cancel order:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || t('orders.cancelFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnOrder = async () => {
    if (!order) return;

    if (!confirm(t('orders.confirmReturn'))) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      await apiClient.returnOrder(order.id);
      setOrder({ ...order, status: 'RETURNED' });
      setMessage({ type: 'success', text: t('orders.returnRequested') });
    } catch (error: any) {
      console.error('Failed to request return:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || t('orders.returnFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{`${t('orders.tracking')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
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
          <title>{`${t('orders.tracking')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
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
              <Button onClick={() => router.push('/orders')}>
                {t('orders.backToOrders')}
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
        <title>{`${t('orders.tracking')} #${order.id.slice(-8).toUpperCase()} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Track your order status and manage your order" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {t('orders.tracking')}
              </h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </div>
            </div>
            <p className="text-lg text-gray-600">
              {t('orders.orderNumber')}: #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Order Status Timeline */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('orders.statusTimeline')}
            </h2>
            
            <div className="space-y-4">
              {/* Pending */}
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'RETURNED'].includes(order.status)
                    ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('orders.statuses.PENDING')}</p>
                  <p className="text-sm text-gray-500">{t('orders.statuses.PENDING_DESC')}</p>
                </div>
              </div>

              {/* Processing */}
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'RETURNED'].includes(order.status)
                    ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('orders.statuses.PROCESSING')}</p>
                  <p className="text-sm text-gray-500">{t('orders.statuses.PROCESSING_DESC')}</p>
                </div>
              </div>

              {/* Shipped */}
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ['SHIPPED', 'DELIVERED', 'RETURNED'].includes(order.status)
                    ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  <Truck className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('orders.statuses.SHIPPED')}</p>
                  <p className="text-sm text-gray-500">{t('orders.statuses.SHIPPED_DESC')}</p>
                </div>
              </div>

              {/* Delivered */}
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  ['DELIVERED', 'RETURNED'].includes(order.status)
                    ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t('orders.statuses.DELIVERED')}</p>
                  <p className="text-sm text-gray-500">{t('orders.statuses.DELIVERED_DESC')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {t('orders.shippingInfo')}
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">{t('orders.recipient')}:</span> {order.shippingAddress.name}</p>
                <p><span className="font-medium">{t('orders.address')}:</span> {order.shippingAddress.address}</p>
                <p><span className="font-medium">{t('orders.phone')}:</span> {order.shippingAddress.phone}</p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                {t('orders.paymentInfo')}
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">{t('orders.paymentMethod')}:</span> {getPaymentTypeText(order.paymentType)}</p>
                <p><span className="font-medium">{t('orders.totalAmount')}:</span> {formatPrice(Number(order.totalAmount))}</p>
                {order.paymentType === 'ONLINE_TRANSFER' && (
                  <div>
                    <p><span className="font-medium">{t('orders.transactionId')}:</span></p>
                    {isEditingTransaction ? (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={newTransactionId}
                          onChange={(e) => setNewTransactionId(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                          placeholder={t('orders.transactionIdPlaceholder')}
                        />
                        <div className="mt-2 flex space-x-2">
                          <Button
                            onClick={handleEditTransaction}
                            disabled={isSubmitting || !newTransactionId.trim()}
                            size="sm"
                          >
                            {t('common.save')}
                          </Button>
                          <Button
                            onClick={() => setIsEditingTransaction(false)}
                            variant="outline"
                            size="sm"
                          >
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">{order.transactionId}</span>
                        {canEditTransaction() && (
                          <button
                            onClick={() => setIsEditingTransaction(true)}
                            className="text-primary-600 hover:text-primary-700"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
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

          {/* Order Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {t('orders.actions')}
            </h2>

            <div className="flex flex-wrap gap-4">
              {canCancelOrder() && (
                <Button
                  onClick={handleCancelOrder}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('orders.cancelOrder')}
                </Button>
              )}

              {canReturnOrder() && (
                <Button
                  onClick={handleReturnOrder}
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('orders.requestReturn')}
                </Button>
              )}

              <Button
                onClick={() => router.push('/orders')}
                variant="outline"
                className="flex items-center"
              >
                <Package className="h-4 w-4 mr-2" />
                {t('orders.backToOrders')}
              </Button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default OrderTrackingPage;
