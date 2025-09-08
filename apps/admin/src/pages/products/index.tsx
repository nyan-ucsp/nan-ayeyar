import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Head from 'next/head';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { adminApiClient } from '@/lib/api';
import { Product, ProductFilters } from '@/types';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ProductFormModal from '@/components/products/ProductFormModal';
import ProductImage from '@/components/ui/ProductImage';
import { cn } from '@/utils/cn';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const { register, watch, setValue } = useForm<ProductFilters>();
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
    disabled: filters.disabled !== undefined ? filters.disabled : undefined,
    outOfStock: filters.outOfStock !== undefined ? filters.outOfStock : undefined,
    sortBy: filters.sortBy || 'newest'
  }), [debouncedSearch, filters.disabled, filters.outOfStock, filters.sortBy]);

  // Load products function
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApiClient.getProducts({
        ...memoizedFilters,
        page: currentPage,
        limit: 12,
      });
      setProducts(response.data);
      setTotalPages(response.pagination.pages);
      setTotalProducts(response.pagination.total);
    } catch (error) {
      console.error('Failed to load products:', error);
      setError('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, memoizedFilters]);

  // Load products on mount and when dependencies change
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [memoizedFilters]);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(productId);
    try {
      await adminApiClient.deleteProduct(productId);
      setProducts(products.filter(p => p.id !== productId));
      setTotalProducts(totalProducts - 1);
    } catch (error) {
      console.error('Failed to delete product:', error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (product: Product, field: 'disabled' | 'outOfStock') => {
    try {
      const updatedProduct = await adminApiClient.updateProduct(product.id, {
        [field]: !product[field],
      });
      setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  const handleFormSuccess = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([product, ...products]);
      setTotalProducts(totalProducts + 1);
    }
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' MMK';
  };

  const getStatusBadge = (product: Product) => {
    if (product.disabled) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <EyeOff className="h-3 w-3 mr-1" />
          Disabled
        </span>
      );
    }
    if (product.outOfStock) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Out of Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Package className="h-3 w-3 mr-1" />
        Active
      </span>
    );
  };

  return (
    <>
      <Head>
        <title>Products - {process.env.NEXT_PUBLIC_ADMIN_APP_NAME || 'Nan Ayeyar Admin'}</title>
        <meta name="description" content="Manage products" />
      </Head>

      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600">
                Manage your product catalog ({totalProducts} products)
              </p>
            </div>
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      {...register('search')}
                      type="text"
                      placeholder="Search products..."
                      className="pl-10 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    {...register('disabled')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Status</option>
                    <option value="false">Active</option>
                    <option value="true">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Status</label>
                  <select
                    {...register('outOfStock')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">All Stock Status</option>
                    <option value="false">In Stock</option>
                    <option value="true">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                  <select
                    {...register('sortBy')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name A-Z</option>
                    <option value="price">Price</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <Button onClick={loadProducts}>
                  Try Again
                </Button>
              </div>
            </Card>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative">
                      <ProductImage
                        src={product.images && product.images.length > 0 ? product.images[0] : undefined}
                        alt={product.name_en}
                        className="w-full h-full"
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 left-2">
                        {getStatusBadge(product)}
                      </div>
                    </div>

                    <div className="p-4">
                      {/* Product Info */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                          {product.name_en}
                        </h3>
                        {product.sku && (
                          <p className="text-sm text-gray-500 mb-2">SKU: {product.sku}</p>
                        )}
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(product, 'disabled')}
                            className={product.disabled ? 'text-green-600 hover:text-green-700' : 'text-gray-600 hover:text-gray-700'}
                          >
                            {product.disabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(product, 'outOfStock')}
                            className={product.outOfStock ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
                          >
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          loading={isDeleting === product.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
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
            <Card>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">
                  Get started by adding your first product to the catalog.
                </p>
                <Button onClick={handleCreateProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Product Form Modal */}
        <ProductFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setEditingProduct(null);
          }}
          product={editingProduct}
          onSuccess={handleFormSuccess}
        />
      </AdminLayout>
    </>
  );
};

export default ProductsPage;
