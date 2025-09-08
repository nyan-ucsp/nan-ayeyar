import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Package, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail,
  Shield,
  CreditCard,
  Banknote
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const ShippingPage: React.FC = () => {
  const { t } = useTranslation();

  const deliveryAreas = [
    {
      icon: MapPin,
      title: t('shipping.areas.yangon.title'),
      description: t('shipping.areas.yangon.description'),
      timeframe: t('shipping.areas.yangon.timeframe'),
    },
    {
      icon: MapPin,
      title: t('shipping.areas.mandalay.title'),
      description: t('shipping.areas.mandalay.description'),
      timeframe: t('shipping.areas.mandalay.timeframe'),
    },
    {
      icon: MapPin,
      title: t('shipping.areas.other.title'),
      description: t('shipping.areas.other.description'),
      timeframe: t('shipping.areas.other.timeframe'),
    },
  ];

  const shippingOptions = [
    {
      icon: Truck,
      title: t('shipping.options.standard.title'),
      description: t('shipping.options.standard.description'),
      timeframe: t('shipping.options.standard.timeframe'),
      cost: t('shipping.options.standard.cost'),
    },
    {
      icon: Package,
      title: t('shipping.options.free.title'),
      description: t('shipping.options.free.description'),
      timeframe: t('shipping.options.free.timeframe'),
      cost: t('shipping.options.free.cost'),
    },
  ];

  const paymentMethods = [
    {
      icon: Banknote,
      title: t('shipping.payment.cod.title'),
      description: t('shipping.payment.cod.description'),
    },
    {
      icon: CreditCard,
      title: t('shipping.payment.online.title'),
      description: t('shipping.payment.online.description'),
    },
  ];

  const shippingTips = [
    t('shipping.tips.tip1'),
    t('shipping.tips.tip2'),
    t('shipping.tips.tip3'),
    t('shipping.tips.tip4'),
  ];

  return (
    <>
      <Head>
        <title>{`${t('shipping.title')} - ${process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}`}</title>
        <meta name="description" content={t('shipping.meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('shipping.hero.title')}
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                {t('shipping.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Shipping Options */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('shipping.options.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('shipping.options.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {shippingOptions.map((option, index) => (
                <Card key={index} className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <option.icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {option.title}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        <strong>{t('shipping.details.timeframe')}:</strong> {option.timeframe}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Package className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        <strong>{t('shipping.details.cost')}:</strong> {option.cost}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Delivery Areas */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('shipping.areas.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('shipping.areas.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {deliveryAreas.map((area, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <area.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {area.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {area.description}
                  </p>
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <span className="text-sm font-medium text-primary-600">
                      {area.timeframe}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Payment Methods */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('shipping.payment.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('shipping.payment.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paymentMethods.map((method, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <method.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {method.title}
                      </h3>
                      <p className="text-gray-600">
                        {method.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Shipping Tips */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('shipping.tips.title')}
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {t('shipping.tips.subtitle')}
                </p>

                <ul className="space-y-3">
                  {shippingTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{tip}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('shipping.contact.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('shipping.contact.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  {t('shipping.contact.contactUs')}
                </a>
                <a
                  href="tel:+959754056707"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {t('shipping.contact.callNow')}
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default ShippingPage;
