import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { 
  RefreshCw, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  Mail,
  ArrowLeft,
  Shield,
  Truck
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const ReturnsPage: React.FC = () => {
  const { t } = useTranslation();

  const returnSteps = [
    {
      icon: Package,
      title: t('returns.steps.step1.title'),
      description: t('returns.steps.step1.description'),
    },
    {
      icon: Phone,
      title: t('returns.steps.step2.title'),
      description: t('returns.steps.step2.description'),
    },
    {
      icon: Truck,
      title: t('returns.steps.step3.title'),
      description: t('returns.steps.step3.description'),
    },
    {
      icon: CheckCircle,
      title: t('returns.steps.step4.title'),
      description: t('returns.steps.step4.description'),
    },
  ];

  const returnPolicies = [
    {
      icon: Clock,
      title: t('returns.policies.timeframe.title'),
      description: t('returns.policies.timeframe.description'),
    },
    {
      icon: Package,
      title: t('returns.policies.condition.title'),
      description: t('returns.policies.condition.description'),
    },
    {
      icon: Shield,
      title: t('returns.policies.guarantee.title'),
      description: t('returns.policies.guarantee.description'),
    },
  ];

  const nonReturnableItems = [
    t('returns.nonReturnable.item1'),
    t('returns.nonReturnable.item2'),
    t('returns.nonReturnable.item3'),
    t('returns.nonReturnable.item4'),
  ];

  return (
    <>
      <Head>
        <title>{`${t('returns.title')} - ${process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}`}</title>
        <meta name="description" content={t('returns.meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('returns.hero.title')}
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                {t('returns.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Return Process */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('returns.process.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('returns.process.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {returnSteps.map((step, index) => (
                <Card key={index} className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <step.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {step.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Return Policies */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('returns.policies.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('returns.policies.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {returnPolicies.map((policy, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <policy.icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {policy.title}
                      </h3>
                      <p className="text-gray-600">
                        {policy.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Non-Returnable Items */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <Card className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t('returns.nonReturnable.title')}
                  </h2>
                </div>
                
                <p className="text-gray-600 mb-6">
                  {t('returns.nonReturnable.subtitle')}
                </p>

                <ul className="space-y-3">
                  {nonReturnableItems.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">{item}</span>
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
                {t('returns.contact.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                {t('returns.contact.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  {t('returns.contact.contactUs')}
                </a>
                <a
                  href="tel:+959754056707"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {t('returns.contact.callNow')}
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

export default ReturnsPage;
