import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Search, Filter, SortAsc, Grid, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/lib/api';
import { Product, ProductFilters } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ProductsPage: React.FC = () => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    variety: '',
    priceMin: undefined,
    priceMax: undefined,
    inStock: false,
    sortBy: 'newest',
  });

  // Debounced search state to prevent too many API calls
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || '');
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [filters.search]);

  // No mock fallback – show empty state if API fails

  // Load products based on current filters and page
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Use real API call
        const params: any = {
          page: currentPage,
          limit: 12,
          locale,
          disabled: false, // Only show enabled products
        };
        
        // Add filters to params
        if (debouncedSearch) params.search = debouncedSearch;
        if (filters.variety) params.variety = filters.variety;
        if (filters.priceMin !== undefined) params.priceMin = filters.priceMin;
        if (filters.priceMax !== undefined) params.priceMax = filters.priceMax;
        if (filters.inStock) params.inStock = filters.inStock;
        if (filters.sortBy) params.sortBy = filters.sortBy;
        
        console.log('Loading products with params:', params); // Debug log
        
        const response = await apiClient.getProducts(params);
        setProducts(response.data);
        setTotalPages(response.pagination.totalPages);
        setTotalProducts(response.pagination.total);
      } catch (error) {
        console.error('Failed to load products from API:', error);
        // No fallback – show empty state
        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [currentPage, debouncedSearch, filters.variety, filters.priceMin, filters.priceMax, filters.inStock, filters.sortBy, locale]);

  // Load filters from URL on mount only
  useEffect(() => {
    const { query } = router;
    const newFilters: ProductFilters = { ...filters };
    
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (typeof value === 'string') {
        if (key === 'priceMin' || key === 'priceMax') {
          newFilters[key] = parseFloat(value);
        } else if (key === 'inStock') {
          newFilters[key] = value === 'true';
        } else {
          (newFilters as any)[key] = value;
        }
      }
    });

    setFilters(newFilters);
  }, []); // Only run on mount

  // Update URL when filters change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== false) {
          query.set(key, value.toString());
        }
      });
      
      const newUrl = query.toString() ? `/products?${query.toString()}` : '/products';
      router.replace(newUrl, undefined, { shallow: true });
    }, 300); // Debounce URL updates

    return () => clearTimeout(timeoutId);
  }, [filters, router]);

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };


  const clearFilters = () => {
    setFilters({
      search: '',
      variety: '',
      priceMin: undefined,
      priceMax: undefined,
      inStock: false,
      sortBy: 'newest',
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const riceVarieties = [
    'Jasmine',
    'Basmati',
    'Arborio',
    'Brown Rice',
    'Wild Rice',
    'Sticky Rice',
  ];

  

  return (
    <>
      <Head>
        <title>Products - {process.env.NEXT_PUBLIC_APP_NAME}</title>
        <meta name="description" content="Browse our premium rice collection with various varieties and weights" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t('products.title')}
            </h1>
            <p className="text-gray-600">
              {totalProducts} products found
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t('products.filters.title')}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-primary-600"
                  >
                    {t('products.filters.clearFilters')}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        placeholder={t('products.search.placeholder')}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* Variety */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('products.filters.variety')}
                    </label>
                    <select
                      value={filters.variety || ''}
                      onChange={(e) => handleFilterChange('variety', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">All Varieties</option>
                      {riceVarieties.map((variety) => (
                        <option key={variety} value={variety}>
                          {variety}
                        </option>
                      ))}
                    </select>
                  </div>

                  

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('products.filters.priceRange')}
                    </label>
                    <div className="space-y-2">
                      <input
                        type="number"
                        placeholder="Min Price"
                        value={filters.priceMin || ''}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                      <input
                        type="number"
                        placeholder="Max Price"
                        value={filters.priceMax || ''}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>

                  {/* In Stock Only */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={filters.inStock || false}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                      {t('products.filters.inStock')}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md ${
                          viewMode === 'grid'
                            ? 'bg-primary-100 text-primary-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <Grid className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md ${
                          viewMode === 'list'
                            ? 'bg-primary-100 text-primary-600'
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        <List className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <SortAsc className="h-4 w-4 text-gray-400" />
                      <select
                        value={filters.sortBy || 'newest'}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                      >
                        <option value="newest">{t('products.sort.newest')}</option>
                        <option value="oldest">{t('products.sort.oldest')}</option>
                        <option value="priceLow">{t('products.sort.priceLow')}</option>
                        <option value="priceHigh">{t('products.sort.priceHigh')}</option>
                        <option value="name">{t('products.sort.name')}</option>
                        <option value="popularity">{t('products.sort.popularity')}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                    : 'grid-cols-1'
                }`}>
                  {[...Array(12)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className={`grid gap-6 ${
                    viewMode === 'grid'
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  }`}>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <nav className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
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
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
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
                  <div className="text-6xl mb-4">🌾</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('products.search.noResults')}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {t('products.search.tryDifferent')}
                  </p>
                  <Button onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default ProductsPage;
