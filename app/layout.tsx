import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { UnitsProvider } from '@/app/providers'
import { UnitToggle } from '@/components/UnitToggle'
import { PWAInstall } from '@/components/PWAInstall'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://cityweather.app'),
  title: 'City Weather | Neighborhood Weather for Top Cities Worldwide',
  description: 'Real-time hyperlocal weather for neighborhoods in New York City, London, Tokyo, Paris, Dubai, Sydney, and 57+ more cities worldwide. Updated every 10 minutes.',
  keywords: 'city weather, neighborhood weather, nyc weather, london weather, tokyo weather, paris weather, dubai weather, sydney weather, san francisco weather, seattle weather, boston weather, hyperlocal weather, weather near me, weather by neighborhood',
  manifest: '/manifest.json',
  openGraph: {
    title: 'City Weather — Hyperlocal Weather Worldwide',
    description: 'Real-time weather for neighborhoods in top cities around the world. Updated every 10 minutes.',
    url: 'https://cityweather.app',
    siteName: 'City Weather',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'City Weather — Hyperlocal Weather Worldwide',
    description: 'Real-time weather for neighborhoods in top cities around the world.',
  },
  alternates: {
    canonical: 'https://cityweather.app',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'City Weather',
    'theme-color': '#1e3a5f',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#1e3a5f" />
        <link rel="preconnect" href="https://openweathermap.org" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://ip-api.com" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Y24MB6W7Q8"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Y24MB6W7Q8');
          `}
        </Script>
      </head>
      <body className={inter.className}>
        <UnitsProvider>
          <div className="fixed top-3 right-4 z-50">
            <UnitToggle />
          </div>
          {children}
          <PWAInstall />
        </UnitsProvider>
      </body>
    </html>
  )
}
