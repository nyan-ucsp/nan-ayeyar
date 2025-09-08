import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronRight, Star, Truck, Shield, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { apiClient } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const HomePage: React.FC = () => {
  const { t, locale } = useLanguage();
  const { items } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await apiClient.getProducts({
          limit: 8,
          locale,
        });
        setFeaturedProducts(response.data);
      } catch (error) {
        console.error('Failed to fetch featured products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [locale]);

  const features = [
    {
      icon: Truck,
      title: 'Free Delivery',
      description: 'Free delivery on orders over 300,000 MMK',
    },
    {
      icon: Shield,
      title: 'Quality Guarantee',
      description: '100% authentic premium rice',
    },
    {
      icon: Award,
      title: 'Best Prices',
      description: 'Competitive prices for quality rice',
    },
    {
      icon: Star,
      title: 'Customer Support',
      description: '24/7 customer support',
    },
  ];

  return (
    <>
      <Head>
        <title>{`${process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'} - Premium Rice Collection`}</title>
        <meta name="description" content="Discover our finest selection of premium rice varieties from local farmers." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                    {t('products.title')}
                  </h1>
                  <p className="text-xl md:text-2xl text-primary-100 mt-4">
                    {t('products.subtitle')}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/products">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
                      Shop Now
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-primary-600">
                      Learn More
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8 pt-8">
                  <div>
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-primary-200">Happy Customers</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">50+</div>
                    <div className="text-primary-200">Rice Varieties</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">100%</div>
                    <div className="text-primary-200">Quality Guarantee</div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-white/10 rounded-2xl p-8 backdrop-blur-sm">
                  <div className="w-full h-full bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="text-8xl">🌾</span>
                  </div>
                </div>
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20 animate-bounce-gentle"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full opacity-20 animate-bounce-gentle" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                    <feature.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our most popular rice varieties, carefully selected for their exceptional quality and taste.
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, index) => (
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
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/products">
                <Button size="lg" variant="outline">
                  View All Products
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Experience Premium Rice?
            </h2>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust us for their rice needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Start Shopping
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default HomePage;