import React from 'react';
import Image from 'next/image';
import { cn } from '../../utils/cn';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  outOfStock?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  imageUrl,
  outOfStock = false,
  className,
  onClick,
}) => {
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' MMK';
  };

  return (
    <div
      className={cn(
        'group relative bg-white rounded-lg shadow-soft border border-neutral-200 overflow-hidden transition-all duration-300',
        'hover:shadow-medium hover:-translate-y-1',
        outOfStock && 'opacity-75',
        className
      )}
      onClick={onClick}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className={cn(
            'object-cover transition-transform duration-300',
            'group-hover:scale-105',
            outOfStock && 'grayscale'
          )}
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
        
        {/* Out of Stock Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-error-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-sm sm:text-base text-neutral-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-lg sm:text-xl font-bold text-primary-600">
            {formatPrice(price)}
          </span>
          
          {/* Add to Cart Button (hidden on mobile, shown on hover) */}
          <button
            className={cn(
              'hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white',
              'opacity-0 group-hover:opacity-100 transition-all duration-300',
              'hover:bg-primary-600 hover:scale-110',
              outOfStock && 'hidden'
            )}
            onClick={(e) => {
              e.stopPropagation();
              // Handle add to cart
            }}
            aria-label={`Add ${name} to cart`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </button>
        </div>
        
        {/* Mobile Add to Cart Button */}
        <button
          className={cn(
            'sm:hidden w-full mt-3 py-2 px-4 bg-primary-500 text-white rounded-md',
            'font-medium text-sm transition-colors',
            'hover:bg-primary-600 active:bg-primary-700',
            outOfStock && 'hidden'
          )}
          onClick={(e) => {
            e.stopPropagation();
            // Handle add to cart
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
