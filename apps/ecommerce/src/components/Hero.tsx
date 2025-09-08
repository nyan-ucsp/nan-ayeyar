import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="container py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('navigation.home') === 'Home' ? 'Premium Rice from Myanmar' : 'မြန်မာ့အမြင့်ဆုံးဆန်'}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            {t('navigation.home') === 'Home' 
              ? 'Discover the finest quality rice varieties, carefully selected and delivered to your doorstep.'
              : 'သင့်အိမ်အထိ ဂရုတစိုက်ရွေးချယ်ပြီး ပို့ဆောင်ပေးသော အရည်အသွေးမြင့်ဆန်များကို ရှာဖွေတွေ့ရှိပါ။'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" variant="secondary">
                {t('product.products')}
              </Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
                {t('product.categories')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
