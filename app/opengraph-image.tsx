import { ImageResponse } from 'next/og'
import { CITIES } from '@/lib/cities'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const revalidate = 3600

export default function Image() {
  const topCities = CITIES.slice(0, 6)

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
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ color: '#93c5fd', fontSize: 28, fontWeight: 600 }}>City Weather</span>
        </div>

        {/* Main headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span
            style={{
              color: 'white',
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-3px',
            }}
          >
            Hyperlocal Weather
          </span>
          <span
            style={{
              color: 'white',
              fontSize: 80,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-3px',
            }}
          >
            for Every Neighborhood
          </span>
          <span style={{ color: '#93c5fd', fontSize: 32, marginTop: 8 }}>
            {CITIES.length} cities · {CITIES.reduce((n, c) => n + c.districts.length, 0)} neighborhoods worldwide
          </span>

          {/* City flags row */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {topCities.map((city) => (
              <div
                key={city.slug}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 50,
                  padding: '8px 20px',
                }}
              >
                <span style={{ fontSize: 22 }}>{city.flag}</span>
                <span style={{ color: 'white', fontSize: 20 }}>{city.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#60a5fa', fontSize: 22, fontWeight: 500 }}>cityweather.app</span>
          <span style={{ color: '#475569', fontSize: 20 }}>Updated every 10 minutes</span>
        </div>
      </div>
    ),
    { ...size }
  )
}
