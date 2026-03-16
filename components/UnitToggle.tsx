'use client'
import { useUnit } from '@/app/providers'

export function UnitToggle() {
  const { unit, toggle } = useUnit()
  return (
    <button
      onClick={toggle}
      className="text-blue-300 hover:text-white text-xs px-3 py-1 bg-white/10 rounded-full hover:bg-white/20 transition border border-white/10"
      aria-label={`Switch to °${unit === 'F' ? 'C' : 'F'}`}
    >
      °F / °C
    </button>
  )
}
