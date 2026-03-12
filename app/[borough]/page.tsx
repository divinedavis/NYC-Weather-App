import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BOROUGHS, getWeather, windDirection, capitalize } from '@/lib/weather'
import type { Metadata } from 'next'

export const revalidate = 600

export async function generateStaticParams() {
  return BOROUGHS.map((b) => ({ borough: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ borough: string }> }): Promise<Metadata> {
  const { borough: slug } = await params
  const b = BOROUGHS.find((b) => b.slug === slug)
  if (!b) return {}
  return {
    title: `${b.name} Weather Today | NYC Weather`,
    description: `Current weather conditions and forecast for ${b.name}, New York City. Temperature, humidity, wind speed, and more.`,
    alternates: { canonical: `https://nycweather.app/${b.slug}` },
    openGraph: {
      title: `${b.name} Weather Today`,
      description: `Real-time weather for ${b.name}, NYC`,
      url: `https://nycweather.app/${b.slug}`,
    },
  }
}

export default async function BoroughPage({ params }: { params: Promise<{ borough: string }> }) {
  const { borough: slug } = await params
  const b = BOROUGHS.find((b) => b.slug === slug)
  if (!b) notFound()

  const w = await getWeather(b.lat, b.lon)
  const updated = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${b.name} Weather Today`,
    description: `Current weather and forecast for ${b.name}, New York City.`,
    url: `https://nycweather.app/${b.slug}`,
    about: {
      '@type': 'Place',
      name: `${b.name}, New York City`,
      geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lon },
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-300 hover:text-white text-sm mb-8 inline-block transition">
          ← All NYC Boroughs
        </Link>

        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-1">{b.name} Weather</h1>
          <p className="text-blue-300 text-sm">New York City · Updated {updated} ET</p>
        </header>

        {!w ? (
          <div className="text-center text-blue-200 py-20">
            <p>Weather data unavailable — add your OpenWeatherMap API key.</p>
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
              <p className="text-8xl font-light text-white mb-2">{w.temp}°F</p>
              <p className="text-2xl text-blue-200 capitalize mb-1">{capitalize(w.description)}</p>
              <p className="text-blue-300">Feels like {w.feels_like}°F · H {w.temp_max}° / L {w.temp_min}°</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Humidity</p>
                <p className="text-white text-3xl font-light">{w.humidity}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Wind</p>
                <p className="text-white text-3xl font-light">{w.wind_speed} mph</p>
                <p className="text-blue-300 text-sm">{windDirection(w.wind_deg)}</p>
              </div>
            </div>

            <section className="mt-8 bg-white/5 rounded-2xl p-6 text-blue-200 text-sm leading-relaxed">
              <h2 className="text-white font-semibold mb-2">{b.name} Weather Summary</h2>
              <p>
                {b.name} weather today is {w.temp}°F with {w.description}. The high will reach {w.temp_max}°F
                and the low will drop to {w.temp_min}°F. It feels like {w.feels_like}°F outside.
                Humidity is at {w.humidity}% with winds from the {windDirection(w.wind_deg)} at {w.wind_speed} mph.
              </p>
            </section>
          </>
        )}

        <nav className="mt-10 text-center">
          <p className="text-blue-300 text-sm mb-3">Other NYC Boroughs</p>
          <div className="flex flex-wrap justify-center gap-3">
            {BOROUGHS.filter((borough) => borough.slug !== slug).map((borough) => (
              <Link
                key={borough.slug}
                href={`/${borough.slug}`}
                className="text-blue-200 hover:text-white text-sm px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition"
              >
                {borough.name}
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </>
  )
}
