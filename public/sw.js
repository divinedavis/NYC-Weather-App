// City Weather Service Worker
// Caches weather pages for fast repeat visits and offline access

const CACHE_NAME = 'cityweather-v2'
const STATIC_ASSETS = [
  '/',
  '/weather-near-me',
  '/guides',
  '/cities',
  '/offline',
]

// Install: cache core pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Non-fatal: some assets may not be available
      })
    })
  )
  self.skipWaiting()
})

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch: stale-while-revalidate for city/district pages, network-first for live weather
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Only handle same-origin GET requests
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return

  // Skip API routes and Next.js internals
  if (url.pathname.startsWith('/_next/') ||
      url.pathname.startsWith('/api/') ||
      url.pathname.includes('opengraph-image')) {
    return
  }

  // Weather pages: stale-while-revalidate (serve cached, update in background)
  if (url.pathname.match(/^\/(nyc|london|tokyo|paris|dubai|sydney|los-angeles|chicago|miami|barcelona|rome|amsterdam|singapore|bangkok|istanbul|toronto|berlin|madrid|vienna|prague|lisbon|cairo|mumbai|seoul|hong-kong|delhi|nairobi|cape-town|manila|kuala-lumpur|bogota|athens|dublin|warsaw|copenhagen|oslo|casablanca|lima|accra|sao-paulo|istanbul|buenos-aires|lagos|jakarta|san-francisco|seattle|boston|washington-dc|houston|melbourne|taipei|osaka|vancouver|auckland|edinburgh|zurich|stockholm)(\/|$)/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cached) => {
          const fetchPromise = fetch(event.request)
            .then((response) => {
              if (response.ok) cache.put(event.request, response.clone())
              return response
            })
            .catch(() => cached || new Response('Offline', { status: 503 }))
          return cached || fetchPromise
        })
      })
    )
    return
  }

  // Static pages: cache-first
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then((response) => {
        if (response.ok) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()))
        }
        return response
      }).catch(() => {
        return caches.match('/') || new Response('Offline', { status: 503 })
      })
    })
  )
})

// Push notification handler
self.addEventListener('push', (event) => {
  let data = { title: 'City Weather Alert', body: 'New weather update for your area', icon: '/favicon.ico', url: '/' }

  if (event.data) {
    try { data = { ...data, ...event.data.json() } } catch {}
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'weather-alert',
      renotify: true,
      data: { url: data.url || '/' },
    })
  )
})

// Notification click: open the relevant city page
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})
