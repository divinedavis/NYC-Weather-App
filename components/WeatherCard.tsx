import Link from 'next/link'
import { WeatherData, windDirection, capitalize } from '@/lib/weather'

export default function WeatherCard({ w }: { w: WeatherData }) {
  return (
    <Link href={`/${w.slug}`} className="block bg-white/10 backdrop-blur rounded-2xl p-6 hover:bg-white/20 transition">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-white">{w.borough}</h2>
        <img
          src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`}
          alt={w.description}
          width={50}
          height={50}
        />
      </div>
      <p className="text-5xl font-light text-white mb-1">{w.temp}°F</p>
      <p className="text-blue-200 capitalize mb-4">{capitalize(w.description)}</p>
      <div className="grid grid-cols-3 gap-2 text-sm text-blue-100">
        <div>
          <p className="opacity-60">Feels like</p>
          <p className="font-medium">{w.feels_like}°F</p>
        </div>
        <div>
          <p className="opacity-60">Humidity</p>
          <p className="font-medium">{w.humidity}%</p>
        </div>
        <div>
          <p className="opacity-60">Wind</p>
          <p className="font-medium">{w.wind_speed} mph {windDirection(w.wind_deg)}</p>
        </div>
      </div>
      <div className="flex justify-between mt-3 text-xs text-blue-200">
        <span>H: {w.temp_max}°F</span>
        <span>L: {w.temp_min}°F</span>
      </div>
    </Link>
  )
}
