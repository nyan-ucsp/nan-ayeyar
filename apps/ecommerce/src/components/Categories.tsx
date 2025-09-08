import React from 'react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Card from '@/components/ui/Card';

interface Category {
  id: string;
  name: string;
  nameMy?: string;
  description?: string;
  descriptionMy?: string;
  slug: string;
  image?: string;
  _count?: {
    products: number;
  };
}

interface CategoriesProps {
  categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
  const { t, i18n } = useTranslation();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('product.categories')}
          </h2>
          <p className="text-lg text-gray-600">
            {i18n.language === 'my' 
              ? 'ဆန်အမျိုးအစားများ'
              : 'Explore our rice categories'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/categories/${category.slug}`}>
              <Card className="group hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-t-lg overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <div className="text-6xl">🌾</div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {i18n.language === 'my' ? category.nameMy || category.name : category.name}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {i18n.language === 'my' ? category.descriptionMy || category.description : category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary-600 font-medium">
                      {category._count?.products || 0} {t('product.products')}
                    </span>
                    <span className="text-primary-600 group-hover:text-primary-700 transition-colors">
                      →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
