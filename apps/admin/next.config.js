/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost:3001', 'images.unsplash.com', '127.0.0.1', 'nanayeyarapi.nxera.top'],
    unoptimized: true, // For local development
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'nanayeyarapi.nxera.top',
        port: '80',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'nanayeyarapi.nxera.top',
        port: '443',
        pathname: '/uploads/**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://nanayeyarapi.nxera.top',
    NEXT_PUBLIC_ADMIN_APP_NAME: process.env.NEXT_PUBLIC_ADMIN_APP_NAME || 'Nan Ayeyar Admin',
  },
  async rewrites() {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://nanayeyarapi.nxera.top';
    return [
      {
        source: '/api/:path*',
        destination: `${base.replace(/\/$/, '')}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;