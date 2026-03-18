import Link from 'next/link'
import { CITIES } from '@/lib/cities'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Weather Widget Embed — Free Neighborhood Weather for Your Website',
  description: 'Embed a free hyperlocal weather widget on your blog, website, or app. Shows real-time temperature and conditions for any neighborhood in our database.',
  alternates: { canonical: 'https://cityweather.app/embed' },
  openGraph: {
    title: 'Free Weather Widget | City Weather',
    description: 'Embed real-time neighborhood weather on your website for free.',
    url: 'https://cityweather.app/embed',
  },
}

export default function EmbedPage() {
  const exampleCity = CITIES[0]
  const exampleDistrict = exampleCity.districts[0]
  const exampleUrl = `https://cityweather.app/widget/${exampleCity.slug}/${exampleDistrict.slug}`
  const exampleIframe = `<iframe\n  src="${exampleUrl}"\n  width="200"\n  height="160"\n  frameborder="0"\n  style="border-radius:12px;overflow:hidden;"\n  title="${exampleDistrict.name} Weather"\n></iframe>`

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-blue-300 hover:text-white text-sm mb-8 inline-block transition">
        ← Home
      </Link>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">Free Weather Widget</h1>
        <p className="text-blue-200 text-lg">Embed hyperlocal neighborhood weather on your website</p>
      </header>

      <section className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-8">
        <h2 className="text-white font-semibold text-xl mb-4">How to Embed</h2>
        <p className="text-blue-200 text-sm mb-6">
          Copy the iframe code below and paste it anywhere on your website. Replace the city and neighborhood slugs to show weather for your location.
        </p>

        <div className="bg-black/30 rounded-xl p-4 mb-6">
          <p className="text-blue-300 text-xs mb-2 font-mono">Example — {exampleDistrict.name}, {exampleCity.name}</p>
          <pre className="text-green-300 text-xs overflow-x-auto whitespace-pre">{exampleIframe}</pre>
        </div>

        <h3 className="text-white font-medium mb-3">URL Pattern</h3>
        <div className="bg-black/30 rounded-xl p-4 mb-4">
          <code className="text-green-300 text-sm">
            https://cityweather.app/widget/[city-slug]/[neighborhood-slug]
          </code>
        </div>
        <p className="text-blue-300 text-xs">Widget updates every 10 minutes automatically. No API key required.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-white font-semibold text-xl mb-6">Available Cities &amp; Neighborhoods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CITIES.map((city) => (
            <div key={city.slug} className="bg-white/5 rounded-2xl p-5">
              <p className="text-white font-medium mb-1">{city.flag} {city.name}</p>
              <p className="text-blue-300 text-xs mb-3">slug: <code className="text-green-300">{city.slug}</code></p>
              <div className="flex flex-wrap gap-1">
                {city.districts.slice(0, 6).map((d) => (
                  <code key={d.slug} className="text-xs bg-black/20 text-blue-200 px-2 py-0.5 rounded">
                    {d.slug}
                  </code>
                ))}
                {city.districts.length > 6 && (
                  <Link href={`/${city.slug}`} className="text-xs text-blue-400 hover:text-white px-2 py-0.5">
                    +{city.districts.length - 6} more →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/5 rounded-2xl p-6 text-blue-200 text-sm leading-relaxed">
        <h2 className="text-white font-semibold mb-2">Widget Details</h2>
        <ul className="space-y-2">
          <li>• <strong className="text-white">Free</strong> — no account or API key needed</li>
          <li>• <strong className="text-white">Auto-updating</strong> — refreshes every 10 minutes</li>
          <li>• <strong className="text-white">Lightweight</strong> — minimal CSS, no JavaScript dependencies</li>
          <li>• <strong className="text-white">Responsive</strong> — works at 200×160px, scales naturally</li>
          <li>• <strong className="text-white">Data</strong> — powered by OpenWeatherMap with hyperlocal coordinates</li>
        </ul>
      </section>
    </main>
  )
}
