import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  Truck,
  Package,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminApiClient } from '@/lib/api';
import { Order, OrderFilters, OrderStatus } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import OrderDetailModal from '@/components/orders/OrderDetailModal';
import { cn } from '@/utils/cn';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { register, watch, setValue } = useForm<OrderFilters>();
  const filters = watch();
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search || '');

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search || '');
    }, 500); // 500ms delay

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filters.search]);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: filters.status || undefined,
    paymentType: filters.paymentType || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined
  }), [debouncedSearch, filters.status, filters.paymentType, filters.startDate, filters.endDate]);

  // Load orders function
  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApiClient.getOrders({
        ...memoizedFilters,
        page: currentPage,
        limit: 20,
      });
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalOrders(response.pagination.total);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, memoizedFilters]);

  // Load orders on mount and when dependencies change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [memoizedFilters]);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await adminApiClient.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(order => 
        order.id === orderId ? updatedOrder : order
      ));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' MMK';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-100';
      case 'ON_HOLD':
        return 'text-orange-600 bg-orange-100';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-100';
      case 'DELIVERED':
        return 'text-green-600 bg-green-100';
      case 'CANCELED':
        return 'text-red-600 bg-red-100';
      case 'RETURNED':
        return 'text-gray-600 bg-gray-100';
      case 'REFUNDED':
        return 'text-pink-600 bg-pink-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
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
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentTypeColor = (paymentType: string) => {
    return paymentType === 'COD' 
      ? 'text-green-600 bg-green-100' 
      : 'text-blue-600 bg-blue-100';
  };

  return (
    <>
      <Head>
        <title>Orders - {process.env.NEXT_PUBLIC_ADMIN_APP_NAME || 'Nan Ayeyar Admin'}</title>
        <meta name="description" content="Manage orders and order status" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600">
                Manage customer orders ({totalOrders} total)
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('search')}
                      type="text"
                      placeholder="Search by order ID or customer..."
                      className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELED">Canceled</option>
                    <option value="RETURNED">Returned</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                  <select
                    {...register('paymentType')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Payment Types</option>
                    <option value="COD">Cash on Delivery</option>
                    <option value="ONLINE_TRANSFER">Online Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

              </div>
            </div>
          </Card>

          {/* Orders Table */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Order List</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded mb-2"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Orders</h3>
                  <p className="text-gray-500 mb-6">{error}</p>
                  <Button onClick={loadOrders}>
                    Try Again
                  </Button>
                </div>
              ) : orders.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                #{order.id.slice(-8)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {order.customerName || 'Unknown'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {order.customerEmail || 'No email'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                getStatusColor(order.status)
                              )}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">{order.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                                getPaymentTypeColor(order.paymentType)
                              )}>
                                {order.paymentType}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatCurrency(order.total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(order.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex justify-center">
                      <nav className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          const isCurrentPage = page === currentPage;
                          const shouldShow = 
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1);

                          if (!shouldShow) {
                            if (page === currentPage - 2 || page === currentPage + 2) {
                              return <span key={page} className="px-2">...</span>;
                            }
                            return null;
                          }

                          return (
                            <Button
                              key={page}
                              variant={isCurrentPage ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </nav>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-500">
                    No orders match your current filters.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onStatusUpdate={handleStatusUpdate}
        />
      </AdminLayout>
    </>
  );
};

export default OrdersPage;
