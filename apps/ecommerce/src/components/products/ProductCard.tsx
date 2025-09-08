import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { getImageUrl } from '@/utils/imageUrl';

interface ProductCardProps {
  product: Product;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const { addToCart, getItemQuantity } = useCart();
  const { t } = useTranslation();
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);

  const cartQuantity = getItemQuantity(product.id);
  const isInCart = cartQuantity > 0;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      addToCart(product, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' MMK';
  };

  const getStockStatus = () => {
    if (product.outOfStock) {
      return {
        text: t('products.outOfStock'),
        className: 'text-red-600 bg-red-50',
        show: true,
      };
    }
    return {
      text: '',
      className: '',
      show: false,
    };
  };

  const stockStatus = getStockStatus();


  return (
    <Card
      className={cn(
        'group overflow-hidden transition-all duration-300 hover:shadow-lg',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 && !imageError ? (
          <Image
            src={getImageUrl(product.images[0])}
            alt={product.name}
            fill
            className={cn(
              'object-cover transition-transform duration-300 group-hover:scale-105',
              isImageLoading && 'blur-sm'
            )}
            onLoad={() => setIsImageLoading(false)}
            onError={() => {
              setImageError(true);
              setIsImageLoading(false);
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-gray-400 text-4xl">🌾</span>
          </div>
        )}

        {/* Stock Status Badge - Only show when out of stock */}
        {stockStatus.show && (
          <div className="absolute top-2 left-2">
            <span
              className={cn(
                'px-2 py-1 text-xs font-medium rounded-full',
                stockStatus.className
              )}
            >
              {stockStatus.text}
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col space-y-2">
            <Link href={`/products/${product.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                title={t('products.viewProduct')}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-sm"
              title="Add to Wishlist"
            >
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add to Cart Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={handleAddToCart}
            disabled={product.outOfStock || isAddingToCart}
            loading={isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {isInCart ? `In Cart (${cartQuantity})` : t('products.addToCart')}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* SKU */}
        {product.sku && (
          <p className="text-xs text-gray-500 mb-1">SKU: {product.sku}</p>
        )}

        {/* Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          <Link href={`/products/${product.id}`}>
            {product.name}
          </Link>
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Metadata */}
        {product.metadata && (
          <div className="mb-3">
            {product.metadata.variety && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">{t('products.variety')}:</span> {product.metadata.variety}
              </p>
            )}
            {product.metadata.weight && (
              <p className="text-xs text-gray-500">
                <span className="font-medium">{t('products.weight')}:</span> {product.metadata.weight}
              </p>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Mobile Add to Cart */}
          <div className="md:hidden">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddToCart}
              disabled={product.outOfStock || isAddingToCart}
              loading={isAddingToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
