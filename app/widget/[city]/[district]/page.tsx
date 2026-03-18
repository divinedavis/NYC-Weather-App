import { CITIES, getCity, getDistrict } from '@/lib/cities'
import { getWeather, windDirection, capitalize } from '@/lib/weather'
import { notFound } from 'next/navigation'
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
    title: `${district.name} Weather Widget`,
    robots: { index: false },
  }
}

export default async function WidgetPage({
  params,
}: {
  params: Promise<{ city: string; district: string }>
}) {
  const { city: citySlug, district: districtSlug } = await params
  const city = getCity(citySlug)
  const district = getDistrict(citySlug, districtSlug)
  if (!city || !district) notFound()

  const w = await getWeather(district.lat, district.lon)

  function toC(f: number) {
    return Math.round((f - 32) * 5 / 9)
  }

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #1e3a5f 0%, #0f2340 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .widget {
            padding: 16px 20px;
            text-align: center;
            width: 200px;
          }
          .location { font-size: 13px; color: #93c5fd; margin-bottom: 4px; }
          .temp { font-size: 48px; font-weight: 300; line-height: 1; }
          .desc { font-size: 12px; color: #bfdbfe; text-transform: capitalize; margin-top: 4px; }
          .meta { font-size: 11px; color: #7dd3fc; margin-top: 6px; }
          .powered { font-size: 10px; color: #60a5fa; margin-top: 10px; opacity: 0.7; }
          .powered a { color: inherit; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="widget">
          {w ? (
            <>
              <p className="location">{district.name}, {city.name}</p>
              <img
                src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`}
                alt={w.description}
                width={50}
                height={50}
                style={{ margin: '0 auto' }}
              />
              <p className="temp">{w.temp}°F</p>
              <p className="desc">{capitalize(w.description)}</p>
              <p className="meta">H {w.temp_max}° / L {w.temp_min}° · {w.humidity}% humidity</p>
              <p className="powered">
                <a href={`https://cityweather.app/${citySlug}/${districtSlug}`} target="_blank" rel="noopener">
                  cityweather.app
                </a>
              </p>
            </>
          ) : (
            <p className="desc">Weather unavailable</p>
          )}
        </div>
      </body>
    </html>
  )
}
