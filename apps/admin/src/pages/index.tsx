import { GetServerSideProps } from 'next';
import { useTranslation } from 'react-i18next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../components/layout/AdminLayout';
import Dashboard from './dashboard';

export default function AdminHomePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while auth is being checked
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Admin Dashboard - {process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}</title>
          <meta name="description" content="Admin dashboard for Nan Ayeyar" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Admin Dashboard - {process.env.NEXT_PUBLIC_APP_NAME || 'Nan Ayeyar'}</title>
        <meta name="description" content="Admin dashboard for Nan Ayeyar" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
