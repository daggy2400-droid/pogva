/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker/Render deployment
  output: 'standalone',

  images: {
    remotePatterns: [
      // Local dev
      { protocol: 'http', hostname: 'localhost', port: '8080', pathname: '/**' },
      // Production backend (set NEXT_PUBLIC_API_URL to your Render backend URL)
      ...(process.env.NEXT_PUBLIC_API_HOST
        ? [{ protocol: 'https', hostname: process.env.NEXT_PUBLIC_API_HOST, pathname: '/**' }]
        : []),
      // Unsplash CDN
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
