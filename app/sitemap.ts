import { MetadataRoute } from 'next'
import { BOROUGHS } from '@/lib/weather'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://nycweather.app'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'hourly', priority: 1 },
    ...BOROUGHS.map((b) => ({
      url: `${base}/${b.slug}`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    })),
  ]
}
