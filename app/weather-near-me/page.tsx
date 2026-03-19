import { headers } from 'next/headers'
import Link from 'next/link'
import { CITIES } from '@/lib/cities'
import { getWeather, getForecast, windDirection, capitalize } from '@/lib/weather'
import { Temp, WindSpeed } from '@/components/Temp'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Weather Near Me — Current Local Weather Right Now',
  description: 'Find the weather near you right now. Hyperlocal current conditions, temperature, and 5-day forecast for your exact neighborhood.',
  alternates: { canonical: 'https://cityweather.app/weather-near-me' },
  openGraph: {
    title: 'Weather Near Me — Hyperlocal Current Conditions',
    description: 'Real-time weather for your exact neighborhood, detected automatically.',
    url: 'https://cityweather.app/weather-near-me',
    siteName: 'City Weather',
    type: 'website',
  },
}

async function detectLocation(ip: string) {
  const isPrivate =
    !ip ||
    ip === '::1' ||
    ip.startsWith('127.') ||
    ip.startsWith('10.') ||
    ip.startsWith('192.168.') ||
    ip.startsWith('172.')

  if (isPrivate) return null

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=lat,lon,city,status`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    const data = await res.json()
    if (data.status !== 'success') return null
    return { lat: data.lat as number, lon: data.lon as number, city: data.city as string }
  } catch {
    return null
  }
}

function nearest<T extends { lat: number; lon: number }>(items: T[], lat: number, lon: number): T {
  return items.reduce((best, item) => {
    const d = Math.pow(item.lat - lat, 2) + Math.pow(item.lon - lon, 2)
    const bd = Math.pow(best.lat - lat, 2) + Math.pow(best.lon - lon, 2)
    return d < bd ? item : best
  })
}

export default async function WeatherNearMe() {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    ''

  const location = await detectLocation(ip)

  // Fall back to NYC if location unavailable
  const city = location
    ? nearest(CITIES, location.lat, location.lon)
    : CITIES[0]

  const district = location
    ? nearest(city.districts, location.lat, location.lon)
    : city.districts[0]

  const [w, forecast] = await Promise.all([
    getWeather(district.lat, district.lon),
    getForecast(district.lat, district.lon),
  ])

  const detected = !!location
  const updated = new Date().toLocaleString('en-US', {
    timeZone: city.timezone,
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const nearby = city.districts
    .filter((d) => d.slug !== district.slug && d.group === district.group)
    .slice(0, 6)

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Weather Near Me',
    description: `Current weather near you: ${district.name}, ${city.name}, ${city.country}.`,
    url: 'https://cityweather.app/weather-near-me',
    about: {
      '@type': 'Place',
      name: `${district.name}, ${city.name}`,
      geo: { '@type': 'GeoCoordinates', latitude: district.lat, longitude: district.lon },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex gap-3 text-sm text-blue-300 mb-8">
          <Link href="/" className="hover:text-white transition">Cities</Link>
          <span>/</span>
          <Link href={`/${city.slug}`} className="hover:text-white transition">{city.flag} {city.name}</Link>
          <span>/</span>
          <span className="text-white">Near Me</span>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Weather Near Me</h1>
          {detected ? (
            <p className="text-blue-200 text-lg">
              📍 {district.name}, {city.name}
            </p>
          ) : (
            <p className="text-blue-300 text-sm">
              Location unavailable — showing {city.name} by default
            </p>
          )}
          <p className="text-blue-300 text-xs mt-1">Updated {updated}</p>
        </header>

        {!w ? (
          <div className="text-center text-blue-200 py-20">
            <p>Weather data unavailable.</p>
          </div>
        ) : (
          <>
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-center mb-6">
              <img
                src={`https://openweathermap.org/img/wn/${w.icon}@4x.png`}
                alt={w.description}
                width={100}
                height={100}
                className="mx-auto"
              />
              <p className="text-8xl font-light text-white mb-2"><Temp value={w.temp} /></p>
              <p className="text-2xl text-blue-200 capitalize mb-1">{capitalize(w.description)}</p>
              <p className="text-blue-300">
                Feels like <Temp value={w.feels_like} /> · H <Temp value={w.temp_max} /> / L <Temp value={w.temp_min} />
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Humidity</p>
                <p className="text-white text-3xl font-light">{w.humidity}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Wind</p>
                <p className="text-white text-3xl font-light"><WindSpeed mph={w.wind_speed} /></p>
                <p className="text-blue-300 text-sm">{windDirection(w.wind_deg)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Visibility</p>
                <p className="text-white text-2xl font-light">{w.visibility} mi</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Pressure</p>
                <p className="text-white text-2xl font-light">{w.pressure}</p>
                <p className="text-blue-300 text-xs">hPa</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Cloud Cover</p>
                <p className="text-white text-2xl font-light">{w.clouds}%</p>
              </div>
            </div>

            <section className="bg-white/5 rounded-2xl p-6 text-blue-200 text-sm leading-relaxed mb-6">
              <h2 className="text-white font-semibold mb-2">Current Weather Near You</h2>
              <p>
                Weather near you right now is <Temp value={w.temp} /> with {w.description} in {district.name}, {city.name}.
                The high today will reach <Temp value={w.temp_max} /> and the low will drop to <Temp value={w.temp_min} />.
                It feels like <Temp value={w.feels_like} /> outside with {w.humidity}% humidity
                and winds from the {windDirection(w.wind_deg)} at <WindSpeed mph={w.wind_speed} />.
              </p>
            </section>

            {forecast.length > 0 && (
              <section className="mb-6">
                <h2 className="text-white font-semibold mb-3">5-Day Forecast Near You</h2>
                <div className="grid grid-cols-5 gap-2">
                  {forecast.map((day) => (
                    <div key={day.date} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
                      <p className="text-blue-300 text-xs mb-2">{day.date}</p>
                      <img
                        src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                        alt={day.description}
                        width={40}
                        height={40}
                        className="mx-auto"
                      />
                      <p className="text-white text-sm font-medium"><Temp value={day.high} /></p>
                      <p className="text-blue-300 text-sm"><Temp value={day.low} /></p>
                      <p className="text-blue-200 text-xs mt-1 capitalize leading-tight">{capitalize(day.description)}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {district.description && (
              <section className="bg-white/5 rounded-2xl p-6 text-blue-200 text-sm leading-relaxed mb-6">
                <h2 className="text-white font-semibold mb-2">About Weather in {district.name}</h2>
                <p>{district.description}</p>
              </section>
            )}
          </>
        )}

        {nearby.length > 0 && (
          <nav className="mt-6">
            <p className="text-blue-300 text-sm mb-3">Nearby Neighborhoods</p>
            <div className="flex flex-wrap gap-2">
              {nearby.map((d) => (
                <Link
                  key={d.slug}
                  href={`/${city.slug}/${d.slug}`}
                  className="text-blue-200 hover:text-white text-sm px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition"
                >
                  {d.name}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <div className="mt-8 text-center">
          <Link href={`/${city.slug}`} className="text-blue-300 hover:text-white text-sm transition">
            ← All {city.name} Neighborhoods
          </Link>
        </div>

        <section className="mt-12 text-blue-200 text-xs leading-relaxed text-center max-w-lg mx-auto">
          <p>
            Weather near me is determined by your IP address and matched to the closest neighborhood
            in our database. For pinpoint accuracy, browse directly to your{' '}
            <Link href={`/${city.slug}`} className="underline hover:text-white transition">
              {city.name} neighborhood weather
            </Link>.
          </p>
        </section>
      </main>
    </>
  )
}
