import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Plus, Package, TrendingUp, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminApiClient } from '@/lib/api';
import { StockEntry, StockFormData, Product, InventorySummary } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';

const StockPage: React.FC = () => {
  const [stockEntries, setStockEntries] = useState<StockEntry[]>([]);
  const [inventory, setInventory] = useState<InventorySummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<StockFormData>();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [stockResponse, inventoryResponse, productsResponse] = await Promise.all([
          adminApiClient.getStockEntries({ limit: 50 }),
          adminApiClient.getInventorySummary(),
          adminApiClient.getProducts({ limit: 100 }),
        ]);
        
        setStockEntries(stockResponse.data);
        setInventory(inventoryResponse);
        setProducts(productsResponse.data);
      } catch (error) {
        console.error('Failed to load stock data:', error);
        setError('Failed to load stock data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [stockResponse, inventoryResponse, productsResponse] = await Promise.all([
        adminApiClient.getStockEntries({ limit: 50 }),
        adminApiClient.getInventorySummary(),
        adminApiClient.getProducts({ limit: 100 }),
      ]);
      
      setStockEntries(stockResponse.data);
      setInventory(inventoryResponse);
      setProducts(productsResponse.data);
    } catch (error) {
      console.error('Failed to refresh stock data:', error);
      setError('Failed to refresh stock data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: StockFormData) => {
    setIsSubmitting(true);
    try {
      const newStockEntry = await adminApiClient.addStockEntry(data);
      setStockEntries([newStockEntry, ...stockEntries]);
      
      // Update inventory summary
      const updatedInventory = inventory.map(item => {
        if (item.productId === data.productId) {
          return {
            ...item,
            currentStock: item.currentStock + data.quantity,
            totalValue: item.totalValue + (data.quantity * data.purchasePrice),
          };
        }
        return item;
      });
      setInventory(updatedInventory);
      
      reset();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add stock entry:', error);
    } finally {
      setIsSubmitting(false);
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
    });
  };

  const getStockStatus = (currentStock: number) => {
    if (currentStock < 0) {
      return { text: 'Backorder', color: 'text-red-800 bg-red-200 border border-red-300' };
    } else if (currentStock === 0) {
      return { text: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    } else if (currentStock <= 10) {
      return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' };
    } else {
      return { text: 'In Stock', color: 'text-green-600 bg-green-100' };
    }
  };

  return (
    <>
      <Head>
        <title>Stock Management - {process.env.NEXT_PUBLIC_ADMIN_APP_NAME || 'Nan Ayeyar Admin'}</title>
        <meta name="description" content="Manage inventory and stock entries" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
              <p className="text-gray-600">
                Manage inventory and track stock entries
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </div>

          {/* Backorder Alert */}
          {inventory.some(item => item.currentStock < 0) && (
            <Card className="border-red-200 bg-red-50">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Package className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Backorder Alert
                    </h3>
                    <p className="text-sm text-red-700">
                      {inventory.filter(item => item.currentStock < 0).length} product(s) are on backorder
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Package className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Inventory Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Current Inventory</h3>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : inventory.length > 0 ? (
                  <div className="space-y-4">
                    {inventory.slice(0, 10).map((item) => {
                      const status = getStockStatus(item.currentStock);
                      return (
                        <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.productName}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className={`text-sm font-medium ${
                                item.currentStock < 0 
                                  ? 'text-red-700' 
                                  : item.currentStock === 0 
                                    ? 'text-red-600' 
                                    : item.currentStock <= 10 
                                      ? 'text-yellow-600' 
                                      : 'text-gray-600'
                              }`}>
                                Stock: {item.currentStock < 0 ? `${item.currentStock} (Backorder)` : item.currentStock}
                              </span>
                              <span className="text-sm text-gray-600">
                                Value: {formatCurrency(item.totalValue)}
                              </span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No inventory data available</p>
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Stock Entries</h3>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : stockEntries.length > 0 ? (
                  <div className="space-y-3">
                    {stockEntries.slice(0, 10).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {entry.product?.name_en || 'Unknown Product'}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              +{entry.quantity} units
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatCurrency(entry.purchasePrice)} each
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {formatDate(entry.createdAt)}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(entry.quantity * entry.purchasePrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No stock entries found</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* All Stock Entries Table */}
          <Card>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Stock Entries</h3>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-gray-200 rounded mb-4"></div>
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
                  ))}
                </div>
              ) : stockEntries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Purchase Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Added
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.product?.name_en || 'Unknown Product'}
                            </div>
                            {entry.product?.sku && (
                              <div className="text-sm text-gray-500">
                                SKU: {entry.product.sku}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`font-medium ${
                              entry.quantity < 0 
                                ? 'text-red-700' 
                                : entry.quantity > 0 
                                  ? 'text-green-700' 
                                  : 'text-gray-700'
                            }`}>
                              {entry.quantity < 0 ? entry.quantity : `+${entry.quantity}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(entry.purchasePrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(entry.quantity * entry.purchasePrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(entry.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No stock entries</h3>
                  <p className="text-gray-500 mb-6">
                    Start by adding stock entries for your products.
                  </p>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Stock Entry
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Add Stock Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Stock Entry"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product
              </label>
              <select
                {...register('productId', { required: 'Product is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name_en} {product.sku && `(${product.sku})`}
                  </option>
                ))}
              </select>
              {errors.productId && (
                <p className="text-sm text-red-600 mt-1">{errors.productId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  {...register('quantity', { 
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' }
                  })}
                  type="number"
                  label="Quantity"
                  placeholder="0"
                  error={errors.quantity?.message}
                />
              </div>
              <div>
                <Input
                  {...register('purchasePrice', { 
                    required: 'Purchase price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  })}
                  type="number"
                  step="0.01"
                  label="Purchase Price"
                  placeholder="0.00"
                  error={errors.purchasePrice?.message}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
              >
                Add Stock
              </Button>
            </div>
          </form>
        </Modal>
      </AdminLayout>
    </>
  );
};

export default StockPage;
