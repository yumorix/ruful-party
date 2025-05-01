import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['api.qrserver.com'],
  },
  // Expose environment variables to the Edge runtime
  env: {
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
  },
};

export default nextConfig;
