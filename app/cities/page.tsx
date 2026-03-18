import Link from 'next/link'
import { CITIES } from '@/lib/cities'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Cities — Neighborhood Weather Worldwide | City Weather',
  description: `Browse real-time hyperlocal weather for neighborhoods in ${36} cities worldwide. Find current conditions and 5-day forecasts for every neighborhood.`,
  alternates: { canonical: 'https://cityweather.app/cities' },
  openGraph: {
    title: 'All Cities — Neighborhood Weather Worldwide',
    description: 'Browse hyperlocal neighborhood weather for 36 cities worldwide.',
    url: 'https://cityweather.app/cities',
  },
}

const directorySchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'City Weather — All Cities Directory',
  description: 'Hyperlocal neighborhood weather for top cities worldwide.',
  url: 'https://cityweather.app/cities',
  hasPart: CITIES.map((city) => ({
    '@type': 'WebPage',
    name: `${city.name} Neighborhood Weather`,
    url: `https://cityweather.app/${city.slug}`,
    about: { '@type': 'City', name: city.name, containedInPlace: { '@type': 'Country', name: city.country } },
  })),
}

export default function CitiesPage() {
  const byContinent: Record<string, typeof CITIES> = {
    'North America': [],
    'Europe': [],
    'Asia': [],
    'Middle East': [],
    'Oceania': [],
    'South America': [],
    'Africa': [],
  }

  const continentMap: Record<string, string> = {
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Spain': 'Europe',
    'Netherlands': 'Europe',
    'Italy': 'Europe',
    'Austria': 'Europe',
    'Czech Republic': 'Europe',
    'Portugal': 'Europe',
    'Greece': 'Europe',
    'Ireland': 'Europe',
    'Poland': 'Europe',
    'Denmark': 'Europe',
    'Norway': 'Europe',
    'Japan': 'Asia',
    'Singapore': 'Asia',
    'Thailand': 'Asia',
    'South Korea': 'Asia',
    'Hong Kong': 'Asia',
    'India': 'Asia',
    'Indonesia': 'Asia',
    'Philippines': 'Asia',
    'Malaysia': 'Asia',
    'United Arab Emirates': 'Middle East',
    'Turkey': 'Middle East',
    'Australia': 'Oceania',
    'Brazil': 'South America',
    'Argentina': 'South America',
    'Colombia': 'South America',
    'Peru': 'South America',
    'Egypt': 'Africa',
    'Nigeria': 'Africa',
    'Kenya': 'Africa',
    'South Africa': 'Africa',
    'Morocco': 'Africa',
    'Ghana': 'Africa',
  }

  for (const city of CITIES) {
    const continent = continentMap[city.country] ?? 'Other'
    if (!byContinent[continent]) byContinent[continent] = []
    byContinent[continent].push(city)
  }

  const totalNeighborhoods = CITIES.reduce((n, c) => n + c.districts.length, 0)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }} />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/" className="text-blue-300 hover:text-white text-sm mb-8 inline-block transition">
          ← Home
        </Link>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">All Cities</h1>
          <p className="text-blue-200 text-lg">{CITIES.length} cities · {totalNeighborhoods} neighborhoods worldwide</p>
          <p className="text-blue-300 text-sm mt-2">Real-time weather updated every 10 minutes</p>
        </header>

        {Object.entries(byContinent).map(([continent, cities]) => {
          if (!cities.length) return null
          return (
            <section key={continent} className="mb-10">
              <h2 className="text-white font-semibold text-lg mb-4 border-b border-white/10 pb-2">{continent}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/${city.slug}`}
                    className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-2xl px-4 py-3 transition group"
                  >
                    <span className="text-2xl">{city.flag}</span>
                    <div>
                      <p className="text-white font-medium group-hover:text-blue-200 transition text-sm">{city.name}</p>
                      <p className="text-blue-400 text-xs">{city.districts.length} neighborhoods</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}

        <nav className="mt-10 text-center">
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/weather-near-me" className="text-blue-300 hover:text-white transition">📍 Weather Near Me</Link>
            <Link href="/guides" className="text-blue-300 hover:text-white transition">Weather Guides</Link>
            <Link href="/embed" className="text-blue-300 hover:text-white transition">Weather Widget</Link>
          </div>
        </nav>
      </main>
    </>
  )
}
