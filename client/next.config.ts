import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@social/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5001/api/:path*',
      },
    ];
  },
};

export default nextConfig;
