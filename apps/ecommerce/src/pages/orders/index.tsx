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
  Eye,
  Calendar
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
}

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { t, locale } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: currentPage,
        limit: 10
      };
      
      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await apiClient.getOrders(params);
      setOrders(response.orders || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      setError(error.response?.data?.error || 'Failed to load orders');
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductName = (product: any) => {
    return locale === 'my' && product.name_my ? product.name_my : product.name_en;
  };

  const getStatusText = (status: string) => {
    return t(`orders.statuses.${status}`);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'PROCESSING':
        return <Package className="h-4 w-4" />;
      case 'SHIPPED':
        return <Truck className="h-4 w-4" />;
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELED':
        return <XCircle className="h-4 w-4" />;
      case 'RETURNED':
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const handleViewOrder = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (isLoading) {
    return (
      <>
        <Head>
          <title>{`${t('orders.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
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

  return (
    <>
      <Head>
        <title>{`${t('orders.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="View your order history and track orders" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t('orders.title')}
            </h1>
            <p className="text-lg text-gray-600">
              {t('orders.subtitle')}
            </p>
          </div>

          {/* Status Filter */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  statusFilter === '' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {t('orders.allOrders')}
              </button>
              {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED', 'RETURNED'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    statusFilter === status 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {getStatusText(status)}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg">
              {error}
            </div>
          )}

          {/* Orders List */}
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('orders.empty')}
              </h3>
              <p className="text-gray-600 mb-8">
                {t('orders.emptySubtitle')}
              </p>
              <Button onClick={() => router.push('/products')}>
                {t('orders.startShopping')}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          {t('orders.orderNumber')}: #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          {formatPrice(Number(order.totalAmount))}
                        </p>
                        <p className="text-sm text-gray-500">
                          {order.items.length} {order.items.length === 1 ? t('orders.item') : t('orders.items')}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleViewOrder(order.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {t('orders.viewDetails')}
                      </Button>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="border-t pt-4">
                    <div className="flex items-center space-x-4">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-2">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                            {item.product.images && item.product.images.length > 0 ? (
                              <img
                                src={item.product.images[0]}
                                alt={getProductName(item.product)}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-lg">🌾</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getProductName(item.product)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {t('cart.quantity')}: {item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 3} {t('orders.moreItems')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex space-x-2">
                <Button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  {t('common.previous')}
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </>
  );
};

export default OrdersPage;
