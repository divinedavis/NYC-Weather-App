import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        source: '/widget/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
          { key: 'Content-Security-Policy', value: "frame-ancestors *" },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.ico',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      // Old nycweather.app borough pages
      {
        source: '/:borough(manhattan|brooklyn|queens|bronx|staten-island)',
        destination: '/nyc',
        permanent: true,
      },
      {
        source: '/:borough(manhattan|brooklyn|queens|bronx|staten-island)/:neighborhood',
        destination: '/nyc/:neighborhood',
        permanent: true,
      },
      // Airport weather alias redirects — catch high-volume search queries
      { source: '/jfk-weather', destination: '/nyc/jfk-airport', permanent: true },
      { source: '/jfk', destination: '/nyc/jfk-airport', permanent: true },
      { source: '/lax-weather', destination: '/los-angeles/lax', permanent: true },
      { source: '/heathrow-weather', destination: '/london/heathrow', permanent: true },
      { source: '/heathrow', destination: '/london/heathrow', permanent: true },
      // Common city name aliases
      { source: '/new-york', destination: '/nyc', permanent: true },
      { source: '/new-york-city', destination: '/nyc', permanent: true },
      { source: '/nyc-weather', destination: '/nyc', permanent: true },
      { source: '/london-weather', destination: '/london', permanent: true },
      { source: '/tokyo-weather', destination: '/tokyo', permanent: true },
      { source: '/paris-weather', destination: '/paris', permanent: true },
      { source: '/dubai-weather', destination: '/dubai', permanent: true },
      { source: '/sydney-weather', destination: '/sydney', permanent: true },
      { source: '/chicago-weather', destination: '/chicago', permanent: true },
      { source: '/miami-weather', destination: '/miami', permanent: true },
      { source: '/singapore-weather', destination: '/singapore', permanent: true },
      { source: '/barcelona-weather', destination: '/barcelona', permanent: true },
      { source: '/toronto-weather', destination: '/toronto', permanent: true },
      { source: '/amsterdam-weather', destination: '/amsterdam', permanent: true },
      { source: '/cairo-weather', destination: '/cairo', permanent: true },
      { source: '/delhi-weather', destination: '/delhi', permanent: true },
      { source: '/mumbai-weather', destination: '/mumbai', permanent: true },
      { source: '/seoul-weather', destination: '/seoul', permanent: true },
      { source: '/rome-weather', destination: '/rome', permanent: true },
      { source: '/berlin-weather', destination: '/berlin', permanent: true },
    ]
  },
}

export default nextConfig;
