import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { UnitsProvider } from '@/app/providers'
import { UnitToggle } from '@/components/UnitToggle'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'City Weather | Neighborhood Weather for Top Cities Worldwide',
  description: 'Real-time hyperlocal weather for neighborhoods in New York City, London, Tokyo, Paris, Dubai, and Sydney.',
  keywords: 'city weather, neighborhood weather, nyc weather, london weather, tokyo weather, paris weather, dubai weather, sydney weather',
  openGraph: {
    title: 'City Weather — Hyperlocal Weather Worldwide',
    description: 'Real-time weather for neighborhoods in top cities around the world.',
    url: 'https://cityweather.app',
    siteName: 'City Weather',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://cityweather.app',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
        </UnitsProvider>
      </body>
    </html>
  )
}
