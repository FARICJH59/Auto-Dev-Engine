/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    allowedDevOrigins: ['http://10.1.10.223:3000'],
  },
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    domains: ['img.clerk.com'], // Clerk profile images
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ],
}

module.exports = nextConfig
