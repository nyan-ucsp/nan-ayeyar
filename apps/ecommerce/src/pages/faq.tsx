import React from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';

const FAQPage: React.FC = () => {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: t('contact.faq.q1.question'),
      answer: t('contact.faq.q1.answer'),
    },
    {
      question: t('contact.faq.q2.question'),
      answer: t('contact.faq.q2.answer'),
    },
    {
      question: t('contact.faq.q3.question'),
      answer: t('contact.faq.q3.answer'),
    },
    {
      question: t('contact.faq.q4.question'),
      answer: t('contact.faq.q4.answer'),
    },
    {
      question: t('contact.faq.q5.question'),
      answer: t('contact.faq.q5.answer'),
    },
    {
      question: t('contact.faq.q6.question'),
      answer: t('contact.faq.q6.answer'),
    },
  ];

  return (
    <>
      <Head>
        <title>{`${t('faq.title')} - ${process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}`}</title>
        <meta name="description" content={t('faq.meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('faq.hero.title')}
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                {t('faq.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {t('faq.section.title')}
              </h2>
              <p className="text-lg text-gray-600">
                {t('faq.section.subtitle')}
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => toggleItem(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </h3>
                    {openItems.includes(index) ? (
                      <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.includes(index) && (
                    <div className="px-6 pb-4">
                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <div className="mt-12 text-center">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('faq.cta.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('faq.cta.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    {t('faq.cta.contactUs')}
                  </a>
                  <a
                    href="tel:+959754056707"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    {t('faq.cta.callNow')}
                  </a>
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

export default FAQPage;
