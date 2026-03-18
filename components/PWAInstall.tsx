'use client'

import { useEffect, useState } from 'react'

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void } | null>(null)
  const [notifState, setNotifState] = useState<'default' | 'granted' | 'denied' | 'unsupported'>('default')
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
    }

    // Push notification state
    if ('Notification' in window) {
      setNotifState(Notification.permission as 'default' | 'granted' | 'denied')
    } else {
      setNotifState('unsupported')
    }

    // Install prompt (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as Event & { prompt: () => void })
      setShowBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Show notification banner after 30s if not yet granted
    const timer = setTimeout(() => {
      if (Notification.permission === 'default') setShowBanner(true)
    }, 30000)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      clearTimeout(timer)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      setDeferredPrompt(null)
      setShowBanner(false)
    }
  }

  const handleEnableNotifs = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotifState(permission as 'granted' | 'denied' | 'default')
    setShowBanner(false)
  }

  const dismiss = () => setShowBanner(false)

  if (!showBanner || notifState === 'granted' || notifState === 'denied') return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 bg-blue-900/95 backdrop-blur border border-blue-700/50 rounded-2xl p-4 shadow-xl">
      <button onClick={dismiss} className="absolute top-3 right-3 text-blue-400 hover:text-white text-lg leading-none">×</button>
      {deferredPrompt ? (
        <>
          <p className="text-white font-semibold text-sm mb-1">Add to Home Screen</p>
          <p className="text-blue-300 text-xs mb-3">Get instant weather for your city — no app store needed.</p>
          <div className="flex gap-2">
            <button onClick={handleInstall} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 text-xs font-medium transition">
              Install
            </button>
            <button onClick={dismiss} className="px-3 bg-white/10 hover:bg-white/20 text-blue-300 rounded-xl text-xs transition">
              Not now
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-white font-semibold text-sm mb-1">🌦 Weather Alerts</p>
          <p className="text-blue-300 text-xs mb-3">Get notified about severe weather in your city.</p>
          <div className="flex gap-2">
            <button onClick={handleEnableNotifs} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2 text-xs font-medium transition">
              Turn on alerts
            </button>
            <button onClick={dismiss} className="px-3 bg-white/10 hover:bg-white/20 text-blue-300 rounded-xl text-xs transition">
              No thanks
            </button>
          </div>
        </>
      )}
    </div>
  )
}
