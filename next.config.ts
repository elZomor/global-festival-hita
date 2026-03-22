import type { NextConfig } from 'next'

const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8005'
const apiHostname = (() => {
  try { return new URL(apiUrl).hostname }
  catch { return 'localhost' }
})()

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: apiHostname },
      { protocol: 'https', hostname: 'media.play-cast.com' },
      { protocol: 'http',  hostname: 'localhost' },
    ],
  },
  transpilePackages: ['camelcase-keys', 'snakecase-keys'],
}

export default nextConfig
