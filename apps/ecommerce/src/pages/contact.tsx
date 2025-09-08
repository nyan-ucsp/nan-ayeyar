import React, { useState } from 'react';
import Head from 'next/head';
import { useForm } from 'react-hook-form';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  MessageSquare,
  User,
  Map
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactForm>();

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call to send contact form
      console.log('Contact form submitted:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('contact.contactInfo.phone'),
      value: '+959754056707',
      link: 'tel:+959754056707',
    },
    {
      icon: Mail,
      title: t('contact.contactInfo.email'),
      value: 'riceshopucsp@gmail.com',
      link: 'mailto:riceshopucsp@gmail.com',
    },
    {
      icon: MapPin,
      title: t('contact.contactInfo.address'),
      value: 'No.28 Bayint Naung Street, Mawlamyinegyun',
      link: 'https://maps.google.com/?q=16.3838,95.2637',
    },
    {
      icon: Clock,
      title: t('contact.contactInfo.businessHours'),
      value: t('contact.contactInfo.businessHoursValue'),
      link: null,
    },
  ];

  return (
    <>
      <Head>
        <title>{`${t('contact.title')} - ${process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}`}</title>
        <meta name="description" content={t('contact.meta.description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {t('contact.hero.title')}
              </h1>
              <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                {t('contact.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {t('contact.getInTouch.title')}
                  </h2>
                  <p className="text-lg text-gray-600 mb-8">
                    {t('contact.getInTouch.subtitle')}
                  </p>
                </div>

                {/* Contact Info Cards */}
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                          <item.icon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        {item.link ? (
                          <a
                            href={item.link}
                            className="text-gray-600 hover:text-primary-600 transition-colors whitespace-pre-line"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-gray-600 whitespace-pre-line">
                            {item.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Map Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Map className="h-5 w-5 mr-2 text-primary-600" />
                    {t('contact.location.title')}
                  </h3>
                  <div className="aspect-video rounded-lg overflow-hidden mb-4">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3819.1234567890123!2d95.2637!3d16.3838!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDIzJzAxLjYiTiA5NcKwMTUnNDkuMiJF!5e0!3m2!1sen!2smm!4v1234567890123!5m2!1sen!2smm"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Nan Ayeyar Location - No.28 Bayint Naung Street, Mawlamyinegyun"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                      {t('contact.location.coordinates')}
                    </p>
                    <a
                      href="https://maps.google.com/?q=16.3838,95.2637"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                    >
                      <Map className="h-4 w-4 mr-1" />
                      {t('contact.location.openInMaps')}
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t('contact.form.title')}
                  </h2>
                  <p className="text-gray-600">
                    {t('contact.form.subtitle')}
                  </p>
                </div>

                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t('contact.form.messageSent')}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {t('contact.form.messageSentSubtitle')}
                    </p>
                    <Button
                      onClick={() => setIsSubmitted(false)}
                      variant="outline"
                    >
                      {t('contact.form.sendAnother')}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Input
                          {...register('name', {
                            required: t('contact.validation.nameRequired'),
                            minLength: {
                              value: 2,
                              message: t('contact.validation.nameMinLength'),
                            },
                          })}
                          type="text"
                          label={t('contact.form.name')}
                          placeholder={t('contact.form.namePlaceholder')}
                          error={errors.name?.message}
                        />
                      </div>
                      <div>
                        <Input
                          {...register('email', {
                            required: t('contact.validation.emailRequired'),
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: t('contact.validation.emailInvalid'),
                            },
                          })}
                          type="email"
                          label={t('contact.form.email')}
                          placeholder={t('contact.form.emailPlaceholder')}
                          error={errors.email?.message}
                        />
                      </div>
                    </div>

                    <div>
                      <Input
                        {...register('subject', {
                          required: t('contact.validation.subjectRequired'),
                          minLength: {
                            value: 5,
                            message: t('contact.validation.subjectMinLength'),
                          },
                        })}
                        type="text"
                        label={t('contact.form.subject')}
                        placeholder={t('contact.form.subjectPlaceholder')}
                        error={errors.subject?.message}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('contact.form.message')}
                      </label>
                      <textarea
                        {...register('message', {
                          required: t('contact.validation.messageRequired'),
                          minLength: {
                            value: 10,
                            message: t('contact.validation.messageMinLength'),
                          },
                        })}
                        rows={6}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder={t('contact.form.messagePlaceholder')}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      loading={isSubmitting}
                    >
                      <Send className="h-5 w-5 mr-2" />
                      {t('contact.form.sendMessage')}
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>


        <Footer />
      </div>
    </>
  );
};

export default ContactPage;
