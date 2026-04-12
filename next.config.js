/** @type {import('next').NextConfig} */

const ORG_SLUG = process.env.ORG_SLUG;

const nextConfig = {
  env: {
    ORG_SLUG: ORG_SLUG,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY: process.env.NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY,
    NEXT_PUBLIC_PAYHERE_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
  },

  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: { unoptimized: true },
};

module.exports = nextConfig;