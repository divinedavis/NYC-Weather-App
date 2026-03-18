import Link from 'next/link'
import { CITIES } from '@/lib/cities'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'City Weather Guides — Best Neighborhoods & Local Weather Tips',
  description: 'Weather guides for top cities worldwide. Learn about microclimates, the best neighborhoods by season, and hyperlocal weather patterns in NYC, London, Tokyo, and more.',
  alternates: { canonical: 'https://cityweather.app/guides' },
  openGraph: {
    title: 'City Weather Guides | Hyperlocal Weather Tips',
    description: 'Neighborhood weather guides for top cities worldwide.',
    url: 'https://cityweather.app/guides',
  },
}

const guides = [
  {
    city: 'nyc',
    title: "New York City Weather Guide",
    intro: "NYC's five boroughs each experience distinct microclimates. Coastal areas near the Atlantic stay 5–10°F cooler in summer, while Midtown's skyscraper canyons create intense wind tunnels. In winter, nor'easters hit the outer boroughs hardest. The best season to visit is September–October when temperatures are mild and humidity drops.",
    tips: [
      "Brooklyn's Coney Island is 5–10°F cooler than Midtown on summer afternoons",
      "Manhattan's Financial District has some of the city's strongest wind gusts due to harbor exposure",
      "Washington Heights runs cooler than the rest of Manhattan thanks to its elevation",
      "Queens' Rockaway Beach is NYC's most Atlantic-exposed neighborhood",
    ],
  },
  {
    city: 'london',
    title: "London Weather Guide",
    intro: "London's famously changeable weather is shaped by the Thames River valley and its maritime position on the edge of the Atlantic. West London neighborhoods tend to be milder and wetter; East London is slightly drier and colder. The city rarely sees extremes — summers average 73°F and winters average 45°F. June–August offers the most reliable sunshine.",
    tips: [
      "Richmond and Kew benefit from the Thames flood plain — slightly warmer and more sheltered",
      "East London (Hackney, Stratford) is often 1–2°F colder than West London in winter",
      "Greenwich on the Thames has more open sky exposure and can be windier than central districts",
      "Hampstead Heath sits at London's highest point and is consistently cooler and windier",
    ],
  },
  {
    city: 'tokyo',
    title: "Tokyo Weather Guide",
    intro: "Tokyo's climate varies dramatically by elevation and proximity to Tokyo Bay. The Kanto plain is exposed to Pacific typhoons from August through October. Shibuya and Shinjuku run hotter in summer due to dense concrete and glass, while neighborhoods near Shinjuku Gyoen and Ueno Park stay cooler. Cherry blossom season (late March–early April) is peak tourist season.",
    tips: [
      "Shibuya and Shinjuku can be 3–4°C hotter than outer wards in summer due to urban heat islands",
      "Harajuku near Yoyogi Park benefits from significant park cooling in summer",
      "Asakusa's lower elevation keeps it slightly warmer in winter than hilltop Ueno",
      "Odaiba is fully exposed to Tokyo Bay winds — excellent breeze in summer, harsh in winter",
    ],
  },
  {
    city: 'paris',
    title: "Paris Weather Guide",
    intro: "Paris sits in the Seine basin with hills (Montmartre, Belleville) rising 100m above the valley floor. This creates measurable temperature gradients — hilltop neighborhoods are cooler and breezier while valley districts trap heat and humidity. Summers are warm (average 77°F) with occasional heat waves; winters mild but rainy. May and September are ideal visiting months.",
    tips: [
      "Montmartre's hilltop position makes it Paris's breeziest and often coolest neighborhood",
      "Marais retains heat well into the night due to dense medieval street patterns",
      "Boulogne-Billancourt on the Seine benefits from river cooling in summer",
      "La Défense's glass towers create extreme wind acceleration between skyscrapers",
    ],
  },
  {
    city: 'sydney',
    title: "Sydney Weather Guide",
    intro: "Sydney's weather is shaped by the Tasman Sea to the east and the Blue Mountains to the west. Eastern suburbs like Bondi and Coogee are cooled by consistent sea breezes; Western suburbs like Parramatta can be 10°F hotter on summer afternoons. The city has a temperate climate (average summer 79°F, winter 60°F) with year-round sunshine. October–April is beach season.",
    tips: [
      "Bondi Beach's coastal position keeps it 5–10°F cooler than inland western suburbs in summer",
      "Parramatta can hit 104°F during westerly 'Westerlies' hot wind events that don't reach the coast",
      "Manly's North Head creates a natural wind break that shelters the harbor side from ocean swells",
      "The CBD's glass towers create strong funnel winds along George and Pitt Streets",
    ],
  },
]

export default function GuidesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-blue-300 hover:text-white text-sm mb-8 inline-block transition">
        ← Home
      </Link>

      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-3">City Weather Guides</h1>
        <p className="text-blue-200 text-lg">Microclimates, neighborhood tips, and seasonal patterns</p>
      </header>

      <div className="space-y-10">
        {guides.map((guide) => {
          const city = CITIES.find((c) => c.slug === guide.city)
          return (
            <article key={guide.city} className="bg-white/10 backdrop-blur rounded-3xl p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{city?.flag}</span>
                <h2 className="text-2xl font-bold text-white">{guide.title}</h2>
              </div>
              <p className="text-blue-200 text-sm leading-relaxed mb-5">{guide.intro}</p>
              <ul className="space-y-2 mb-6">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="text-blue-300 text-sm flex gap-2">
                    <span className="text-blue-400 mt-0.5">→</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/${guide.city}`}
                className="inline-block text-sm text-blue-200 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition"
              >
                See {city?.name} neighborhood weather →
              </Link>
            </article>
          )
        })}
      </div>

      <section className="mt-12 text-center">
        <p className="text-blue-300 text-sm mb-4">More Cities</p>
        <div className="flex flex-wrap justify-center gap-3">
          {CITIES.filter((c) => !guides.find((g) => g.city === c.slug)).map((city) => (
            <Link
              key={city.slug}
              href={`/${city.slug}`}
              className="text-blue-200 hover:text-white text-sm px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition"
            >
              {city.flag} {city.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
