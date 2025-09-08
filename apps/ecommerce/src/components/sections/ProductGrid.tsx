import React from 'react';
import { ProductCard, ProductCardProps } from '../ui/ProductCard';
import { cn } from '../../utils/cn';

export interface ProductGridProps {
  products: ProductCardProps[];
  title?: string;
  subtitle?: string;
  className?: string;
  loading?: boolean;
  emptyMessage?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  title,
  subtitle,
  className,
  loading = false,
  emptyMessage = 'No products found',
}) => {
  if (loading) {
    return (
      <section className={cn('py-8 sm:py-12 lg:py-16', className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-8 sm:mb-12">
              {title && (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Loading Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-soft border border-neutral-200 overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-neutral-200" />
                <div className="p-3 sm:p-4">
                  <div className="h-4 bg-neutral-200 rounded mb-2" />
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3" />
                  <div className="h-6 bg-neutral-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={cn('py-8 sm:py-12 lg:py-16', className)}>
        <div className="container mx-auto px-4">
          {/* Header */}
          {(title || subtitle) && (
            <div className="text-center mb-8 sm:mb-12">
              {title && (
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {emptyMessage}
            </h3>
            <p className="text-neutral-500">
              Check back later for new products
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={cn('py-8 sm:py-12 lg:py-16', className)}>
      <div className="container mx-auto px-4">
        {/* Header */}
        {(title || subtitle) && (
          <div className="text-center mb-8 sm:mb-12">
            {title && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              onClick={() => {
                // Handle product click - navigate to product detail
                console.log('Navigate to product:', product.id);
              }}
            />
          ))}
        </div>

        {/* Load More Button (if needed) */}
        {products.length >= 8 && (
          <div className="text-center mt-8 sm:mt-12">
            <button className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors">
              Load More Products
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
