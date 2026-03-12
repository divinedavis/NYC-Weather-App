export const BOROUGHS = [
  { name: 'Manhattan',     slug: 'manhattan',     lat: 40.7831, lon: -73.9712 },
  { name: 'Brooklyn',      slug: 'brooklyn',      lat: 40.6782, lon: -73.9442 },
  { name: 'Queens',        slug: 'queens',        lat: 40.7282, lon: -73.7949 },
  { name: 'The Bronx',     slug: 'bronx',         lat: 40.8448, lon: -73.8648 },
  { name: 'Staten Island', slug: 'staten-island', lat: 40.5795, lon: -74.1502 },
]

export type WeatherData = {
  borough: string
  slug: string
  temp: number
  feels_like: number
  temp_min: number
  temp_max: number
  description: string
  humidity: number
  wind_speed: number
  wind_deg: number
  icon: string
}

export async function getWeather(lat: number, lon: number): Promise<WeatherData | null> {
  const apiKey = process.env.OPENWEATHER_API_KEY
  if (!apiKey || apiKey === 'your_api_key_here') return null
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
  const res = await fetch(url, { next: { revalidate: 600 } })
  if (!res.ok) return null
  const data = await res.json()
  return {
    borough: '',
    slug: '',
    temp: Math.round(data.main.temp),
    feels_like: Math.round(data.main.feels_like),
    temp_min: Math.round(data.main.temp_min),
    temp_max: Math.round(data.main.temp_max),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    wind_speed: Math.round(data.wind.speed),
    wind_deg: data.wind.deg,
    icon: data.weather[0].icon,
  }
}

export async function getAllBoroughWeather(): Promise<WeatherData[]> {
  const results = await Promise.all(
    BOROUGHS.map(async (b) => {
      const w = await getWeather(b.lat, b.lon)
      return w ? { ...w, borough: b.name, slug: b.slug } : null
    })
  )
  return results.filter(Boolean) as WeatherData[]
}

export function windDirection(deg: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
  return dirs[Math.round(deg / 45) % 8]
}

export function capitalize(str: string): string {
  return str.replace(/\b\w/g, (c: string) => c.toUpperCase())
}
