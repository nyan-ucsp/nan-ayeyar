import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api';
import { getImageUrl } from '@/utils/imageUrl';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import ProductCard from '@/components/products/ProductCard';
import Header from '@/components/layout/Header';
import { 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Product {
  id: string;
  sku?: string;
  name: string;
  name_en?: string;
  name_my?: string;
  description?: string;
  description_en?: string;
  description_my?: string;
  images?: string[];
  price: number;
  disabled: boolean;
  outOfStock: boolean;
  allowSellWithoutStock: boolean;
  metadata?: any;
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
}

interface RelatedProduct {
  id: string;
  sku?: string;
  name: string;
  name_en?: string;
  name_my?: string;
  description?: string;
  description_en?: string;
  description_my?: string;
  images?: string[];
  price: number;
  disabled: boolean;
  outOfStock: boolean;
  allowSellWithoutStock: boolean;
  metadata?: any;
  totalStock?: number;
  createdAt: string;
  updatedAt: string;
}

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { t } = useTranslation();
  const { locale } = useLanguage();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id, locale]);

  const loadProduct = async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.getProduct(id as string, locale);
      
      if (response.success && response.data) {
        setProduct(response.data);
        await loadRelatedProducts(response.data);
      } else {
        setError(t('products.productNotFound'));
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setError(t('products.productNotFound'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async (currentProduct: Product) => {
    try {
      // Get products with similar variety or category
      const variety = currentProduct.metadata?.variety;
      const response = await apiClient.getProducts({
        page: 1,
        limit: 4,
        variety: variety,
        disabled: false,
        excludeId: currentProduct.id
      });
      
      if (response.data) {
        setRelatedProducts(response.data);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      // Show success message or toast
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' MMK';
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleImageError = (imageIndex: number) => {
    setImageErrors(prev => new Set(prev).add(imageIndex));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-20 h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {error || t('products.productNotFound')}
            </h1>
            <p className="text-gray-600 mb-4">
              {t('products.productNotFoundDesc')}
            </p>
            <Button onClick={() => router.push('/products')}>
              {t('products.backToProducts')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{product.name} - Nan Ayeyar</title>
        <meta name="description" content={product.description || ''} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description || ''} />
        <meta property="og:image" content={getImageUrl(product.images?.[0])} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <button 
              onClick={() => router.push('/')}
              className="hover:text-primary-600"
            >
              {t('common.home')}
            </button>
            <span>/</span>
            <button 
              onClick={() => router.push('/products')}
              className="hover:text-primary-600"
            >
              {t('common.products')}
            </button>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-square bg-white rounded-lg overflow-hidden shadow-sm">
                {product.images && product.images.length > 0 && !imageErrors.has(selectedImageIndex) ? (
                  <Image
                    src={getImageUrl(product.images[selectedImageIndex])}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                    priority
                    onError={() => handleImageError(selectedImageIndex)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <div className="text-center">
                      <span className="text-gray-400 text-6xl block mb-2">🌾</span>
                      <p className="text-gray-500 text-sm">{t('products.imageNotAvailable')}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index
                          ? 'border-primary-500'
                          : 'border-gray-200'
                      }`}
                    >
                      {!imageErrors.has(index) ? (
                        <Image
                          src={getImageUrl(image)}
                          alt={`${product.name} ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <span className="text-gray-400 text-lg">🌾</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              {/* Product Title & SKU */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                {product.sku && (
                  <p className="text-sm text-gray-600">
                    {t('products.sku')}: {product.sku}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-primary-600">
                  {formatPrice(product.price)}
                </span>
                {product.outOfStock && (
                  <Badge variant="error" size="lg">
                    {t('products.outOfStock')}
                  </Badge>
                )}
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Metadata */}
              {product.metadata && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {t('products.specifications')}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {Object.entries(product.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-medium text-gray-900">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">
                    {t('products.quantity')}:
                  </span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= 10}
                      className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.outOfStock || isAddingToCart}
                    className="flex-1"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    {isAddingToCart ? t('products.adding') : t('products.addToCart')}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsFavorite(!isFavorite)}
                    size="lg"
                  >
                    <Heart 
                      className={`w-5 h-5 ${
                        isFavorite ? 'fill-red-500 text-red-500' : ''
                      }`} 
                    />
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    size="lg"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
                <div className="flex items-center space-x-3">
                  <Truck className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t('products.freeShipping')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('products.freeShippingDesc')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Shield className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t('products.qualityGuarantee')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('products.qualityGuaranteeDesc')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-6 h-6 text-primary-600" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {t('products.easyReturns')}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t('products.easyReturnsDesc')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('products.relatedProducts')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.id}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
