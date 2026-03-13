import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NYC Weather | New York City Weather by Borough',
  description: 'Real-time weather for all 5 NYC boroughs — Manhattan, Brooklyn, Queens, The Bronx, and Staten Island. Hourly and 10-day forecasts.',
  keywords: 'nyc weather, new york city weather, brooklyn weather, manhattan weather, queens weather, bronx weather, staten island weather',
  openGraph: {
    title: 'NYC Weather — All 5 Boroughs',
    description: 'Real-time weather for Manhattan, Brooklyn, Queens, The Bronx, and Staten Island.',
    url: 'https://nycweather.app',
    siteName: 'NYC Weather',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://nycweather.app',
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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
