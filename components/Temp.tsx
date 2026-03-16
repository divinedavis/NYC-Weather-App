'use client'
import { useUnit } from '@/app/providers'

function toC(f: number) {
  return Math.round((f - 32) * 5 / 9)
}

export function Temp({ value }: { value: number }) {
  const { unit } = useUnit()
  const display = unit === 'C' ? toC(value) : value
  return <span suppressHydrationWarning>{display}°{unit}</span>
}

export function WindSpeed({ mph }: { mph: number }) {
  const { unit } = useUnit()
  if (unit === 'C') {
    return <span suppressHydrationWarning>{Math.round(mph * 1.609)} km/h</span>
  }
  return <span suppressHydrationWarning>{mph} mph</span>
}
