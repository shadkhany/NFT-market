/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
      },
    ],
    // Disable image optimization for placeholder images to avoid DNS issues
    unoptimized: false,
    dangerouslyAllowSVG: true,
  },
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Output standalone for better deployment
  output: 'standalone',
}

module.exports = nextConfig
