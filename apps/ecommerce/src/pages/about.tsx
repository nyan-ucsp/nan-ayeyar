import { NextPage } from 'next';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  Heart, 
  Award, 
  Users, 
  Leaf, 
  Truck, 
  Shield,
  Star,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';

const AboutPage: NextPage = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: <Heart className="h-8 w-8 text-primary-600" />,
      title: t('about.values.quality.title'),
      description: t('about.values.quality.description')
    },
    {
      icon: <Users className="h-8 w-8 text-primary-600" />,
      title: t('about.values.community.title'),
      description: t('about.values.community.description')
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary-600" />,
      title: t('about.values.sustainability.title'),
      description: t('about.values.sustainability.description')
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.description')
    }
  ];

  const features = [
    {
      icon: <Truck className="h-6 w-6 text-primary-600" />,
      title: t('about.features.delivery.title'),
      description: t('about.features.delivery.description')
    },
    {
      icon: <Shield className="h-6 w-6 text-primary-600" />,
      title: t('about.features.quality.title'),
      description: t('about.features.quality.description')
    },
    {
      icon: <Star className="h-6 w-6 text-primary-600" />,
      title: t('about.features.service.title'),
      description: t('about.features.service.description')
    }
  ];

  const stats = [
    { number: '2,500+', label: t('about.stats.customers') },
    { number: '75+', label: t('about.stats.products') },
    { number: '8+', label: t('about.stats.years') },
    { number: '98%', label: t('about.stats.satisfaction') }
  ];

  return (
    <>
      <Head>
        <title>{`${t('about.title')} - ${process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}`}</title>
        <meta name="description" content={t('about.meta.description')} />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {t('about.hero.title')}
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 max-w-3xl mx-auto">
                {t('about.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {t('about.story.title')}
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p>{t('about.story.paragraph1')}</p>
                  <p>{t('about.story.paragraph2')}</p>
                  <p>{t('about.story.paragraph3')}</p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-primary-100 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-4xl">🌾</span>
                    </div>
                    <p className="text-primary-700 font-semibold text-lg">
                      {t('about.story.imageCaption')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('about.values.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('about.values.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-primary-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">
                {t('about.stats.title')}
              </h2>
              <p className="text-xl text-primary-100">
                {t('about.stats.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.number}
                  </div>
                  <div className="text-primary-100 text-lg">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('about.features.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('about.features.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="p-6">
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="text-xl font-semibold text-gray-900 ml-3">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('about.mission.title')}
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                {t('about.mission.description')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/products" passHref>
                  <Button size="lg" className="px-8">
                    {t('about.mission.cta.shop')}
                  </Button>
                </Link>
                <Link href="/contact" passHref>
                  <Button variant="outline" size="lg" className="px-8">
                    {t('about.mission.cta.contact')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Quality Promise Section */}
        <section className="py-16 bg-primary-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('about.quality.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('about.quality.subtitle')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                {[
                  t('about.quality.promise1'),
                  t('about.quality.promise2'),
                  t('about.quality.promise3'),
                  t('about.quality.promise4')
                ].map((promise, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary-600 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-gray-700">{promise}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-center">
                  <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('about.quality.guarantee.title')}
                  </h3>
                  <p className="text-gray-600">
                    {t('about.quality.guarantee.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
