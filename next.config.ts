import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Serve Apple Pay domain verification file at the required well-known path
  async rewrites() {
    return [
      {
        source: '/.well-known/apple-developer-merchantid-domain-association',
        destination: '/api/apple-pay/domain-association',
      },
    ];
  },

  // Faster builds — no source maps in production
  productionBrowserSourceMaps: false,

  // Strip X-Powered-By header
  poweredByHeader: false,

  // Enable gzip/brotli compression
  compress: true,

  // Aggressive image caching — 30 days TTL, serve WebP/AVIF automatically
  images: {
    minimumCacheTTL: 2592000, // 30 days
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 315],
  },

};

export default nextConfig;
