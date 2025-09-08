import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { getImageUrl } from '@/utils/imageUrl';

interface Product {
  id: string;
  name: string;
  nameMy?: string;
  description?: string;
  descriptionMy?: string;
  price: number;
  images: string[];
  slug: string;
  totalStock: number;
  category: {
    name: string;
    nameMy?: string;
  };
}

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const { t, i18n } = useTranslation();

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('product.relatedProducts')}
          </h2>
          <p className="text-lg text-gray-600">
            {i18n.language === 'my' 
              ? 'ကျွန်ုပ်တို့၏ အကောင်းဆုံးဆန်များ'
              : 'Discover our finest rice varieties'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-300">
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-lg overflow-hidden">
                <Image
                  src={getImageUrl(product.images[0]) || '/placeholder-rice.jpg'}
                  alt={i18n.language === 'my' ? product.nameMy || product.name : product.name}
                  width={300}
                  height={200}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <div className="p-4">
                <div className="mb-2">
                  <Badge variant="info" size="sm">
                    {i18n.language === 'my' ? product.category.nameMy || product.category.name : product.category.name}
                  </Badge>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {i18n.language === 'my' ? product.nameMy || product.name : product.name}
                </h3>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {i18n.language === 'my' ? product.descriptionMy || product.description : product.description}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">
                    {product.price.toLocaleString()} MMK
                  </span>
                  {product.totalStock === 0 && (
                    <Badge 
                      variant="error"
                      size="sm"
                    >
                      {t('product.outOfStock')}
                    </Badge>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/products/${product.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      {t('product.viewDetails')}
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    disabled={product.totalStock === 0}
                    className="flex-1"
                  >
                    {t('product.addToCart')}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/products">
            <Button variant="outline" size="lg">
              {i18n.language === 'my' ? 'ဆန်အားလုံးကြည့်ရန်' : 'View All Products'}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
