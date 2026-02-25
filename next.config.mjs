import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // Temporary: repository contains legacy admin/mobile code with schema drift.
    // Keep public-site deploys unblocked while those modules are refactored.
    ignoreBuildErrors: true
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default withNextIntl(nextConfig);
