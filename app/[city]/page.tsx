import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CITIES, getCity } from '@/lib/cities'
import { getWeather, windDirection, capitalize } from '@/lib/weather'
import type { Metadata } from 'next'

export const revalidate = 600

export async function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params
  const city = getCity(slug)
  if (!city) return {}
  return {
    title: `${city.name} Weather by Neighborhood — Local Weather Today`,
    description: `Hyperlocal weather for every neighborhood in ${city.name}, ${city.country}. Current conditions, temperature right now, and 5-day forecasts updated every 10 minutes.`,
    alternates: { canonical: `https://cityweather.app/${city.slug}` },
    openGraph: {
      title: `${city.name} Neighborhood Weather Today | City Weather`,
      description: `Real-time hyperlocal weather for every neighborhood in ${city.name}. Updated every 10 minutes.`,
      url: `https://cityweather.app/${city.slug}`,
    },
  }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const city = getCity(slug)
  if (!city) notFound()

  const w = await getWeather(city.lat, city.lon)
  const updated = new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })

  // Group districts by their group label
  const groups = city.districts.reduce<Record<string, typeof city.districts>>((acc, d) => {
    const key = d.group ?? 'Neighborhoods'
    if (!acc[key]) acc[key] = []
    acc[key].push(d)
    return acc
  }, {})

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${city.name} Weather by Neighborhood`,
    description: `Current weather and forecasts for neighborhoods in ${city.name}, ${city.country}.`,
    url: `https://cityweather.app/${city.slug}`,
    about: {
      '@type': 'City',
      name: city.name,
      geo: { '@type': 'GeoCoordinates', latitude: city.lat, longitude: city.lon },
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-300 hover:text-white text-sm mb-8 inline-block transition">
          ← All Cities
        </Link>

        <header className="text-center mb-10">
          <p className="text-3xl mb-2">{city.flag}</p>
          <h1 className="text-4xl font-bold text-white mb-1">{city.name} Weather</h1>
          <p className="text-blue-300 text-sm">{city.country} · Updated {updated} ET</p>
        </header>

        {w && (
          <>
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-center mb-6">
              <img src={`https://openweathermap.org/img/wn/${w.icon}@4x.png`} alt={w.description} width={100} height={100} className="mx-auto" />
              <p className="text-8xl font-light text-white mb-2">{w.temp}°F</p>
              <p className="text-2xl text-blue-200 capitalize mb-1">{capitalize(w.description)}</p>
              <p className="text-blue-300">Feels like {w.feels_like}°F · H {w.temp_max}° / L {w.temp_min}°</p>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Humidity</p>
                <p className="text-white text-3xl font-light">{w.humidity}%</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Wind</p>
                <p className="text-white text-3xl font-light">{w.wind_speed} mph</p>
                <p className="text-blue-300 text-sm">{windDirection(w.wind_deg)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-5">
                <p className="text-blue-300 text-sm mb-1">Visibility</p>
                <p className="text-white text-3xl font-light">{w.visibility} mi</p>
              </div>
            </div>
          </>
        )}

        <section className="bg-white/5 rounded-2xl p-6 text-blue-200 text-sm leading-relaxed mb-8">
          <h2 className="text-white font-semibold mb-2">About {city.name} Weather</h2>
          <p>{city.description}</p>
        </section>

        {Object.entries(groups).map(([groupName, districts]) => (
          <section key={groupName} className="mb-8">
            <h2 className="text-white font-semibold mb-3">{groupName}</h2>
            <div className="grid grid-cols-2 gap-2">
              {districts.map((d) => (
                <Link
                  key={d.slug}
                  href={`/${city.slug}/${d.slug}`}
                  className="text-blue-200 hover:text-white text-sm px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition"
                >
                  {d.name} Weather →
                </Link>
              ))}
            </div>
          </section>
        ))}

        <nav className="mt-10 text-center">
          <p className="text-blue-300 text-sm mb-3">Other Cities</p>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.filter((c) => c.slug !== slug).map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="text-blue-200 hover:text-white text-sm px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition">
                {c.flag} {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </>
  )
}
