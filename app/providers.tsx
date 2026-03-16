'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type Unit = 'F' | 'C'

const UnitContext = createContext<{ unit: Unit; toggle: () => void }>({
  unit: 'F',
  toggle: () => {},
})

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [unit, setUnit] = useState<Unit>('F')

  useEffect(() => {
    const saved = localStorage.getItem('tempUnit') as Unit | null
    if (saved === 'C' || saved === 'F') setUnit(saved)
  }, [])

  const toggle = () => {
    setUnit((prev) => {
      const next = prev === 'F' ? 'C' : 'F'
      localStorage.setItem('tempUnit', next)
      return next
    })
  }

  return <UnitContext.Provider value={{ unit, toggle }}>{children}</UnitContext.Provider>
}

export function useUnit() {
  return useContext(UnitContext)
}
