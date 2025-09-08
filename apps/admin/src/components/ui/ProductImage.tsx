import React, { useState, useEffect } from 'react';
import { Package } from 'lucide-react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  showLoadingSpinner?: boolean;
}

const ProductImage: React.FC<ProductImageProps> = ({ 
  src, 
  alt, 
  className = '', 
  showLoadingSpinner = true 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
  }, [src]);

  if (!src || imageError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 ${className}`}>
        <Package className="h-12 w-12 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && showLoadingSpinner && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

export default ProductImage;
