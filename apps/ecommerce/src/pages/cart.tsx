import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const CartPage: React.FC = () => {
  const router = useRouter();
  const { items, updateQuantity, removeFromCart, clearCart } = useCart();
  const { t } = useLanguage();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price) + ' MMK';
  };

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTax = () => {
    return Math.round(calculateSubtotal() * 0.05); // 5% tax
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 300000 ? 0 : 5000; // Free shipping over 300,000 MMK, otherwise 5,000 MMK
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() + calculateShipping();
  };

  if (items.length === 0) {
    return (
      <>
        <Head>
          <title>{`${t('cart.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
          <meta name="description" content="Your shopping cart" />
        </Head>

        <div className="min-h-screen bg-gray-50">
          <Header />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {t('cart.empty')}
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                {t('cart.emptySubtitle')}
              </p>
              <Link href="/products">
                <Button size="lg">
                  {t('cart.continueShopping')}
                </Button>
              </Link>
            </div>
          </div>

          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{`${t('cart.title')} - ${process.env.NEXT_PUBLIC_APP_NAME}`}</title>
        <meta name="description" content="Your shopping cart" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {t('cart.title')}
            </h1>
            <p className="text-gray-600 mt-2">
              {items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCart}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Cart
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <span className="text-2xl">🌾</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900">
                            <Link
                              href={`/products/${item.id}`}
                              className="hover:text-primary-600"
                            >
                              {item.name}
                            </Link>
                          </h3>
                          <p className="text-lg font-semibold text-gray-900 mt-1">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Total Price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('checkout.orderSummary')}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.subtotal')}</span>
                    <span className="font-medium">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.shipping')}</span>
                    <span className="font-medium text-green-600">
                      {calculateShipping() === 0 ? 'Free' : formatPrice(calculateShipping())}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('cart.tax')}</span>
                    <span className="font-medium">{formatPrice(calculateTax())}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">
                        {t('cart.total')}
                      </span>
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(calculateTotal())}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  size="lg"
                  className="w-full mb-4"
                >
                  {t('cart.checkout')}
                </Button>

                <Link href="/products">
                  <Button variant="outline" size="lg" className="w-full">
                    {t('cart.continueShopping')}
                  </Button>
                </Link>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-500">
                    {t('cart.freeShipping')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default CartPage;
