/** @type {import('next').NextConfig} */

const nextConfig = {


// --- Dynamic Routing Configuration ---
// Read the ORG_SLUG passed via Docker build argument (ARG/ENV).
const ORG_SLUG = process.env.ORG_SLUG;
// -------------------------------------

const nextConfig = {
  
  // Expose all environment variables required by the frontend application.
  // These are passed via 'args' in the docker-compose file.
  env: {
    ORG_SLUG: ORG_SLUG,
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_API_PREFIX: process.env.NEXT_PUBLIC_API_PREFIX,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY: process.env.NEXT_PUBLIC_ORGANIZATION_PUBLIC_KEY,
    NEXT_PUBLIC_PAYHERE_MERCHANT_ID: process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID,
  },

  // 2. EXISTING CONFIGURATION (Preserved)
  output: 'standalone', // Keeps your optimized Docker output

  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;