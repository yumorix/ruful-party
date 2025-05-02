import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: ['api.qrserver.com'],
  },
  // Expose environment variables to the Edge runtime
  env: {
    // Add any environment variables needed for the matching app
  },
};

export default nextConfig;
