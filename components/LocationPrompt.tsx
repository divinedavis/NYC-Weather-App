'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type District = { name: string; slug: string; lat: number; lon: number }
type City = { name: string; slug: string; lat: number; lon: number; districts: District[] }

function nearest<T extends { lat: number; lon: number }>(items: T[], lat: number, lon: number): T {
  return items.reduce((best, item) => {
    const d = (item.lat - lat) ** 2 + (item.lon - lon) ** 2
    const bd = (best.lat - lat) ** 2 + (best.lon - lon) ** 2
    return d < bd ? item : best
  })
}

export function LocationPrompt({ cities }: { cities: City[] }) {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [denied, setDenied] = useState(false)

  useEffect(() => {
    // Don't show if already on weather-near-me or if previously dismissed
    if (typeof window === 'undefined') return
    if (window.location.pathname === '/weather-near-me') return
    if (sessionStorage.getItem('location-dismissed')) return
    if (!navigator.geolocation) return

    // Check if permission already granted — if so, redirect silently
    navigator.permissions?.query({ name: 'geolocation' }).then(perm => {
      if (perm.state === 'granted') {
        navigator.geolocation.getCurrentPosition(pos => {
          const city = nearest(cities, pos.coords.latitude, pos.coords.longitude)
          const district = nearest(city.districts, pos.coords.latitude, pos.coords.longitude)
          // Only redirect if not already on their city
          if (!window.location.pathname.startsWith(`/${city.slug}`)) {
            router.push(`/${city.slug}/${district.slug}`)
          }
        })
      } else if (perm.state === 'prompt') {
        setShow(true)
      }
    }).catch(() => {
      setShow(true)
    })
  }, [cities, router])

  const handleAllow = () => {
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const city = nearest(cities, pos.coords.latitude, pos.coords.longitude)
        const district = nearest(city.districts, pos.coords.latitude, pos.coords.longitude)
        setShow(false)
        router.push(`/${city.slug}/${district.slug}`)
      },
      () => {
        setLoading(false)
        setDenied(true)
        setTimeout(() => setShow(false), 3000)
      },
      { timeout: 10000 }
    )
  }

  const handleDismiss = () => {
    sessionStorage.setItem('location-dismissed', '1')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-[#1e3a5f] border border-blue-400/30 rounded-2xl shadow-2xl p-4 flex items-center gap-3">
        <span className="text-2xl">📍</span>
        <div className="flex-1 min-w-0">
          {denied ? (
            <p className="text-blue-200 text-sm">Location access denied — browse cities manually.</p>
          ) : (
            <>
              <p className="text-white text-sm font-medium">See your local weather?</p>
              <p className="text-blue-300 text-xs">We'll find your nearest neighborhood</p>
            </>
          )}
        </div>
        {!denied && (
          <button
            onClick={handleAllow}
            disabled={loading}
            className="shrink-0 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition"
          >
            {loading ? '...' : 'Allow'}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="shrink-0 text-blue-400 hover:text-white text-lg leading-none transition"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
