const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    { urlPattern: /\/api\//, handler: 'NetworkFirst', options: { cacheName: 'api-cache' } },
    { urlPattern: /\.(png|jpg|jpeg|svg|gif)/, handler: 'CacheFirst', options: { cacheName: 'image-cache' } },
    { urlPattern: /\.(js|css)/, handler: 'StaleWhileRevalidate', options: { cacheName: 'static-resources' } },
    { urlPattern: /\/_next\/static\//, handler: 'CacheFirst', options: { cacheName: 'next-static' } },
  ],
});

const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  swcMinify: true,
  images: {
    domains: ['localhost', 'api.crm-supermercado.com'],
  },
};

module.exports = withNextIntl(withPWA(nextConfig));
