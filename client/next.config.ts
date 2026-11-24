import type { NextConfig } from 'next';

const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001';

const nextConfig: NextConfig = {
  transpilePackages: ['@social/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
