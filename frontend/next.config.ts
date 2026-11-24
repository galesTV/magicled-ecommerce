import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  distDir: '.next-v3',
  devIndicators: false,
  agentRules: false,
  images: { qualities: [75, 85] },
};

export default nextConfig;
