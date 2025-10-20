/** @type {import('next').NextConfig} */

// --- Dynamic Routing Configuration ---
// Read the ORG_SLUG passed via Docker build argument (ARG/ENV).
const ORG_SLUG = process.env.ORG_SLUG;
// Set the base path to /acme, /zenith, etc. This is CRITICAL for Traefik path routing.
const basePath = ORG_SLUG ? `/${ORG_SLUG}` : undefined;
// -------------------------------------

const nextConfig = {
  // 1. DYNAMIC CONFIG
  basePath: basePath,
  
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
    ignoreDuringBuilds: true, // Preserves your ESLint ignore setting
  },
  images: { unoptimized: true }, // Preserves your image setting
};

module.exports = nextConfig;
