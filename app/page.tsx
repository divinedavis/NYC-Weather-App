import Link from 'next/link'
import { headers } from 'next/headers'
import { CITIES } from '@/lib/cities'
import { getWeather, capitalize } from '@/lib/weather'
import { Temp } from '@/components/Temp'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'City Weather — Neighborhood Weather for Top Cities Worldwide',
  description: 'Real-time hyperlocal weather for neighborhoods in New York City, London, Tokyo, Paris, Dubai, and Sydney.',
  openGraph: {
    title: 'City Weather — Hyperlocal Weather Worldwide',
    description: 'Real-time weather for neighborhoods in top cities around the world.',
    url: 'https://cityweather.app',
    siteName: 'City Weather',
    locale: 'en_US',
    type: 'website',
  },
  alternates: { canonical: 'https://cityweather.app' },
}

async function getNearestCitySlug(ip: string): Promise<string> {
  const isPrivateIp =
    !ip ||
    ip === '::1' ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.')

  if (isPrivateIp) return CITIES[0].slug

  try {
    const res = await fetch(`https://ip-api.com/json/${ip}?fields=lat,lon,status`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return CITIES[0].slug
    const data = await res.json()
    if (data.status !== 'success') return CITIES[0].slug

    let nearestSlug = CITIES[0].slug
    let minDist = Infinity
    for (const city of CITIES) {
      const dist = Math.sqrt(
        Math.pow(city.lat - data.lat, 2) + Math.pow(city.lon - data.lon, 2)
      )
      if (dist < minDist) {
        minDist = dist
        nearestSlug = city.slug
      }
    }
    return nearestSlug
  } catch {
    return CITIES[0].slug
  }
}

export default async function Home() {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    ''

  const nearestCitySlug = await getNearestCitySlug(ip)

  const orderedCities = [
    ...CITIES.filter((c) => c.slug === nearestCitySlug),
    ...CITIES.filter((c) => c.slug !== nearestCitySlug),
  ]

  const cityWeather = await Promise.all(
    orderedCities.map(async (city) => {
      const w = await getWeather(city.lat, city.lon)
      return { city, w }
    })
  )

  const updated = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">City Weather</h1>
        <p className="text-blue-200 text-lg">Hyperlocal weather for neighborhoods worldwide</p>
        <p className="text-blue-300 text-sm mt-2">Updated: {updated} ET</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cityWeather.map(({ city, w }, index) => {
          const isNearest = city.slug === nearestCitySlug
          return (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className={`backdrop-blur rounded-3xl p-6 hover:bg-white/15 transition group relative ${
                isNearest ? 'bg-white/15 ring-1 ring-blue-400/40' : 'bg-white/10'
              }`}
            >
              {isNearest && (
                <span className="absolute top-4 right-4 text-xs text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full">
                  📍 Near you
                </span>
              )}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-2xl mb-1">{city.flag}</p>
                  <h2 className="text-xl font-bold text-white group-hover:text-blue-200 transition">
                    {city.name}
                  </h2>
                  <p className="text-blue-300 text-sm">{city.country}</p>
                </div>
                {w && (
                  <img
                    src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`}
                    alt={w.description}
                    width={50}
                    height={50}
                  />
                )}
              </div>
              {w ? (
                <>
                  <p className="text-5xl font-light text-white mb-1"><Temp value={w.temp} /></p>
                  <p className="text-blue-200 capitalize text-sm">{capitalize(w.description)}</p>
                  <p className="text-blue-300 text-xs mt-1">
                    Feels like <Temp value={w.feels_like} /> · H <Temp value={w.temp_max} /> / L <Temp value={w.temp_min} />
                  </p>
                </>
              ) : (
                <p className="text-blue-300 text-sm">Weather unavailable</p>
              )}
              <p className="text-blue-400 text-xs mt-4 group-hover:text-blue-200 transition">
                {city.districts.length} neighborhoods →
              </p>
            </Link>
          )
        })}
      </div>

      <section className="mt-16 text-blue-200 text-sm leading-relaxed max-w-2xl mx-auto text-center">
        <h2 className="text-white text-lg font-semibold mb-3">Hyperlocal Weather for Every Neighborhood</h2>
        <p>
          City Weather delivers real-time conditions and 5-day forecasts for specific neighborhoods —
          not just city-wide averages. Whether you&apos;re planning a walk in Shoreditch, checking the surf
          forecast in Bondi Beach, or dressing for a Tokyo summer, find the weather for exactly where
          you&apos;re going.
        </p>
      </section>

      <footer className="mt-12 text-center text-blue-300 text-xs">
        <p>Weather data provided by OpenWeatherMap · Updated every 10 minutes</p>
        <nav className="mt-3 flex flex-wrap justify-center gap-4">
          {CITIES.map((city) => (
            <Link key={city.slug} href={`/${city.slug}`} className="hover:text-white transition">
              {city.flag} {city.name}
            </Link>
          ))}
        </nav>
      </footer>
    </main>
  )
}
