import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CITIES, getCity, getDistrict } from '@/lib/cities'
import { getWeather, getForecast, windDirection, capitalize } from '@/lib/weather'
import { Temp, WindSpeed } from '@/components/Temp'
import type { Metadata } from 'next'

export const revalidate = 600

export async function generateStaticParams() {
  return CITIES.flatMap((city) =>
    city.districts.map((d) => ({ city: city.slug, district: d.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; district: string }>
}): Promise<Metadata> {
  const { city: citySlug, district: districtSlug } = await params
  const city = getCity(citySlug)
  const district = getDistrict(citySlug, districtSlug)
  if (!city || !district) return {}
  return {
    title: `${district.name} Weather Today | ${city.name} Neighborhood Weather`,
    description: `${district.name} weather right now: current temperature, conditions, and 5-day forecast for ${district.name} in ${city.name}, ${city.country}. Updated every 10 minutes.`,
    alternates: { canonical: `https://cityweather.app/${city.slug}/${district.slug}` },
    openGraph: {
      title: `${district.name} Weather Today & Right Now | ${city.name}`,
      description: `Real-time hyperlocal weather for ${district.name}, ${city.name}. Current conditions updated every 10 minutes.`,
      url: `https://cityweather.app/${city.slug}/${district.slug}`,
    },
    other: {
      'geo.placename': `${district.name}, ${city.name}, ${city.country}`,
      'geo.position': `${district.lat};${district.lon}`,
      'ICBM': `${district.lat}, ${district.lon}`,
    },
  }
}

export default async function DistrictPage({
  params,
}: {
  params: Promise<{ city: string; district: string }>
}) {
  const { city: citySlug, district: districtSlug } = await params
  const city = getCity(citySlug)
  const district = getDistrict(citySlug, districtSlug)
  if (!city || !district) notFound()

  const [w, forecast] = await Promise.all([
    getWeather(district.lat, district.lon),
    getForecast(district.lat, district.lon),
  ])

  const updated = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  const nearby = city.districts
    .filter((d) => d.slug !== districtSlug && d.group === district.group)
    .slice(0, 6)

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `${district.name} Weather Today`,
    description: `Current weather and forecast for ${district.name}, ${city.name}, ${city.country}.`,
    url: `https://cityweather.app/${city.slug}/${district.slug}`,
    about: {
      '@type': 'Place',
      name: `${district.name}, ${city.name}, ${city.country}`,
      geo: { '@type': 'GeoCoordinates', latitude: district.lat, longitude: district.lon },
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'City Weather', item: 'https://cityweather.app/' },
      { '@type': 'ListItem', position: 2, name: `${city.name} Weather`, item: `https://cityweather.app/${city.slug}` },
      { '@type': 'ListItem', position: 3, name: `${district.name} Weather`, item: `https://cityweather.app/${city.slug}/${district.slug}` },
    ],
  }

  const faqSchema = w ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What is the weather in ${district.name} today?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${district.name} weather today is ${w.temp}°F (${Math.round((w.temp - 32) * 5 / 9)}°C) with ${w.description}. The high is ${w.temp_max}°F and the low is ${w.temp_min}°F. It feels like ${w.feels_like}°F outside.`,
        },
      },
      {
        '@type': 'Question',
        name: `What is the humidity in ${district.name} right now?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Humidity in ${district.name} is currently ${w.humidity}%. Wind is coming from the ${windDirection(w.wind_deg)} at ${w.wind_speed} mph. Visibility is ${w.visibility} miles.`,
        },
      },
      {
        '@type': 'Question',
        name: `Will it rain in ${district.name} today?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Current conditions in ${district.name} show ${capitalize(w.description)} with ${w.clouds}% cloud cover. Check the 5-day forecast on this page for upcoming precipitation.`,
        },
      },
      {
        '@type': 'Question',
        name: `How does the weather in ${district.name} compare to the rest of ${city.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${district.description ?? `${district.name} is one of ${city.name}'s distinct neighborhoods, each with its own microclimate influenced by local geography, proximity to water, and urban density.`}`,
        },
      },
    ],
  } : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex gap-3 text-sm text-blue-300 mb-8">
          <Link href="/" className="hover:text-white transition">Cities</Link>
          <span>/</span>
          <Link href={`/${city.slug}`} className="hover:text-white transition">{city.flag} {city.name}</Link>
          <span>/</span>
          <span className="text-white">{district.name}</span>
        </div>

        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-1">{district.name} Weather Today</h1>
          <p className="text-blue-300 text-sm">{city.name}, {city.country} · Updated {updated} ET</p>
        </header>

        {!w ? (
          <div className="text-center text-blue-200 py-20">
            <p>Weather data unavailable.</p>
          </div>
        ) : (
          <>
            <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-center mb-6">
              <img src={`https://openweathermap.org/img/wn/${w.icon}@4x.png`} alt={w.description} width={100} height={100} className="mx-auto" />
              <p className="text-8xl font-light text-white mb-2"><Temp value={w.temp} /></p>
              <p className="text-2xl text-blue-200 capitalize mb-1">{capitalize(w.description)}</p>
              <p className="text-blue-300">Feels like <Temp value={w.feels_like} /> · H <Temp value={w.temp_max} /> / L <Temp value={w.temp_min} /></p>
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
              <h2 className="text-white font-semibold mb-2">{district.name} Weather Right Now</h2>
              <p>
                {district.name} weather today is <Temp value={w.temp} /> with {w.description}. The high will reach <Temp value={w.temp_max} />
                {' '}and the low will drop to <Temp value={w.temp_min} />. It feels like <Temp value={w.feels_like} /> outside.
                Humidity is at {w.humidity}% with winds from the {windDirection(w.wind_deg)} at <WindSpeed mph={w.wind_speed} />.
                Visibility is {w.visibility} miles with {w.clouds}% cloud cover and a pressure of {w.pressure} hPa.
              </p>
            </section>

            {forecast.length > 0 && (
              <section className="mb-6">
                <h2 className="text-white font-semibold mb-3">5-Day Forecast</h2>
                <div className="grid grid-cols-5 gap-2">
                  {forecast.map((day) => (
                    <div key={day.date} className="bg-white/10 backdrop-blur rounded-2xl p-3 text-center">
                      <p className="text-blue-300 text-xs mb-2">{day.date}</p>
                      <img src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} alt={day.description} width={40} height={40} className="mx-auto" />
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
                <h2 className="text-white font-semibold mb-2">About {district.name} Weather</h2>
                <p>{district.description}</p>
              </section>
            )}
          </>
        )}

        {nearby.length > 0 && (
          <nav className="mt-10">
            <p className="text-blue-300 text-sm mb-3">More {district.group ?? city.name} Neighborhoods</p>
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

        <nav className="mt-10 text-center">
          <p className="text-blue-300 text-sm mb-3">More Cities</p>
          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.filter((c) => c.slug !== citySlug).slice(0, 8).map((c) => (
              <Link key={c.slug} href={`/${c.slug}`} className="text-blue-200 hover:text-white text-xs px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition">
                {c.flag} {c.name}
              </Link>
            ))}
          </div>
        </nav>
      </main>
    </>
  )
}
