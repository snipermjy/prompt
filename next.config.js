const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // 启用 React 严格模式
  reactStrictMode: true,
  // 生产环境优化
  swcMinify: true,
  // 压缩
  compress: true,
  // 性能优化
  poweredByHeader: false,
  generateEtags: true,
  // 生产环境禁用 admin 路由
  async redirects() {
    // 只在生产环境（Vercel）禁用 admin
    if (process.env.VERCEL) {
      return [
        {
          source: '/admin/:path*',
          destination: '/',
          permanent: false,
        },
      ];
    }
    return [];
  },
}

module.exports = withNextIntl(nextConfig)

