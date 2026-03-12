import { getAllBoroughWeather, BOROUGHS } from '@/lib/weather'
import WeatherCard from '@/components/WeatherCard'

export const revalidate = 600

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'NYC Weather — All 5 Boroughs',
  description: 'Real-time weather forecasts for all five New York City boroughs.',
  url: 'https://nycweather.app',
  about: BOROUGHS.map((b) => ({
    '@type': 'Place',
    name: `${b.name}, New York City`,
    geo: { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lon },
  })),
}

export default async function Home() {
  const forecasts = await getAllBoroughWeather()
  const updated = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
      />
      <main className="max-w-5xl mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">NYC Weather</h1>
          <p className="text-blue-200 text-lg">Real-time weather across all 5 New York City boroughs</p>
          <p className="text-blue-300 text-sm mt-2">Updated: {updated} ET</p>
        </header>

        {forecasts.length === 0 ? (
          <div className="text-center text-blue-200 py-20">
            <p className="text-xl mb-2">Weather data unavailable</p>
            <p className="text-sm opacity-70">Add your OpenWeatherMap API key to <code>.env.local</code></p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forecasts.map((w) => (
              <WeatherCard key={w.slug} w={w} />
            ))}
          </div>
        )}

        <section className="mt-16 text-blue-200 text-sm leading-relaxed max-w-2xl mx-auto">
          <h2 className="text-white text-lg font-semibold mb-3">About NYC Borough Weather</h2>
          <p>
            New York City’s five boroughs — Manhattan, Brooklyn, Queens, The Bronx, and Staten Island —
            each experience distinct microclimates. Coastal areas like Coney Island and Rockaway Beach tend to
            be windier and cooler in summer, while Upper Manhattan experiences the urban heat island effect.
            This page shows real-time conditions for each borough updated every 10 minutes.
          </p>
        </section>

        <footer className="mt-12 text-center text-blue-300 text-xs">
          <p>Weather data provided by OpenWeatherMap · Updated every 10 minutes</p>
          <nav className="mt-3 flex flex-wrap justify-center gap-4">
            {BOROUGHS.map((b) => (
              <a key={b.slug} href={`/${b.slug}`} className="hover:text-white transition">
                {b.name}
              </a>
            ))}
          </nav>
        </footer>
      </main>
    </>
  )
}
