/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: export since we need API routes
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
