import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RefreshCw,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { adminApiClient } from '@/lib/api';

interface DashboardStats {
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  ordersByStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
  recentOrders: Array<{
    id: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
  userGrowth: Array<{
    month: string;
    users: number;
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    ordersByStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
    recentOrders: [],
    monthlyRevenue: [],
    topProducts: [],
    userGrowth: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch dashboard metrics from API
      const metrics = await adminApiClient.getDashboardMetrics();

      // Transform the data to match our interface
      setStats({
        totalOrders: metrics.totalOrders || 0,
        totalProducts: metrics.totalProducts || 0,
        totalUsers: metrics.totalUsers || 0,
        totalRevenue: metrics.totalRevenue || 0,
        ordersByStatus: metrics.ordersByStatus || {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
        recentOrders: (metrics.recentOrders || []).map((order: any) => ({
          id: order.id,
          customerName: order.user?.name || 'Unknown',
          total: parseFloat(order.totalAmount || order.total) || 0,
          status: order.status,
          createdAt: order.createdAt,
        })),
        monthlyRevenue: [],
        topProducts: [],
        userGrowth: [],
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to mock data if API fails
      setStats({
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0,
        totalRevenue: 0,
        ordersByStatus: {
          pending: 0,
          processing: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
        },
        recentOrders: [],
        monthlyRevenue: [],
        topProducts: [],
        userGrowth: [],
      });
    } finally {
      setIsLoading(false);
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
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome to your admin dashboard - Manage your ecommerce platform</p>
          </div>
          <button
            onClick={loadDashboardData}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-400">All time orders</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-xs text-gray-400">Active products</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-400">Registered customers</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-xs text-gray-400">From delivered orders</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Orders by Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Orders by Status</h3>
            <Activity className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Pending</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.ordersByStatus.pending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <RefreshCw className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Processing</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.ordersByStatus.processing}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center">
                <Truck className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Shipped</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.ordersByStatus.shipped}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Delivered</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.ordersByStatus.delivered}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">Cancelled</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{stats.ordersByStatus.cancelled}</span>
            </div>
          </div>
        </Card>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
            <Eye className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent orders</p>
              </div>
            ) : (
              stats.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(order.total)}</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
      </div>
  );
};

export default Dashboard;