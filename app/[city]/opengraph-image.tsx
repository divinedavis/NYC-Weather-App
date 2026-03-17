import { ImageResponse } from 'next/og'
import { getCity } from '@/lib/cities'
import { getWeather } from '@/lib/weather'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 600

function weatherEmoji(icon: string): string {
  if (icon.startsWith('01')) return '☀️'
  if (icon.startsWith('02')) return '⛅'
  if (icon.startsWith('03') || icon.startsWith('04')) return '☁️'
  if (icon.startsWith('09') || icon.startsWith('10')) return '🌧️'
  if (icon.startsWith('11')) return '⛈️'
  if (icon.startsWith('13')) return '❄️'
  if (icon.startsWith('50')) return '🌫️'
  return '🌡️'
}

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params
  const city = getCity(slug)
  if (!city) return new Response('Not found', { status: 404 })

  const w = await getWeather(city.lat, city.lon)
  const emoji = w ? weatherEmoji(w.icon) : '🌡️'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
          padding: '56px 64px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#93c5fd', fontSize: 28, fontWeight: 600, letterSpacing: '-0.5px' }}>
            City Weather
          </span>
          <span style={{ color: '#bfdbfe', fontSize: 24 }}>
            {city.districts.length} neighborhoods
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ fontSize: 64 }}>{city.flag}</span>
              <span
                style={{
                  color: 'white',
                  fontSize: 80,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-2px',
                }}
              >
                {city.name}
              </span>
            </div>
            <span style={{ color: '#93c5fd', fontSize: 34, fontWeight: 400 }}>
              {city.country}
            </span>
            <span style={{ color: '#bfdbfe', fontSize: 22, opacity: 0.85, maxWidth: 620, lineHeight: 1.4 }}>
              {city.description.length > 130
                ? city.description.slice(0, 130) + '…'
                : city.description}
            </span>
          </div>

          {w && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 24,
                padding: '28px 36px',
                minWidth: 220,
              }}
            >
              <span style={{ fontSize: 56 }}>{emoji}</span>
              <span style={{ color: 'white', fontSize: 62, fontWeight: 700, lineHeight: 1 }}>
                {w.temp}°F
              </span>
              <span style={{ color: '#bfdbfe', fontSize: 22, textTransform: 'capitalize' }}>
                {w.description}
              </span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#60a5fa', fontSize: 22, fontWeight: 500 }}>
            cityweather.app/{slug}
          </span>
          <span style={{ color: '#475569', fontSize: 20 }}>Hyperlocal neighborhood weather</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
