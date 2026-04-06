// src/composables/useDeepLinks.js
// Handles Universal Links and custom URL scheme (runnit://) on iOS/Android.
// Maps incoming URLs to Vue Router routes so every deep link opens the right screen.
// Safe no-op on web.

import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'
import { useRouter } from 'vue-router'

// Supported URL patterns → route
// Universal Links:  https://runnit.live/activities/123
// Custom scheme:    runnit://activities/123
const ROUTE_MAP = [
  { pattern: /\/activities\/([^/?]+)/,       route: (m) => `/activities/${m[1]}` },
  { pattern: /\/profile\/([^/?]+)/,          route: (m) => `/profile/${m[1]}` },
  { pattern: /\/plans\/([^/?]+)/,            route: (m) => `/plans/${m[1]}` },
  { pattern: /\/plans/,                      route: () => '/plans' },
  { pattern: /\/feed/,                       route: () => '/feed' },
  { pattern: /\/challenges/,                 route: () => '/challenges' },
  { pattern: /\/achievements/,               route: () => '/achievements' },
  { pattern: /\/stats/,                      route: () => '/stats' },
  { pattern: /\/clubs/,                      route: () => '/clubs' },
  { pattern: /\/dashboard/,                  route: () => '/dashboard' },
  { pattern: /\/track/,                      route: () => '/track' },
]

function urlToRoute(url) {
  try {
    // Normalise both https://runnit.live/path and runnit://path into just /path
    const parsed   = new URL(url)
    const pathname = parsed.pathname || parsed.hostname + parsed.pathname

    for (const { pattern, route } of ROUTE_MAP) {
      const match = pathname.match(pattern)
      if (match) return route(match)
    }
  } catch {
    // Malformed URL — ignore
  }
  return null
}

export function useDeepLinks() {
  const router = useRouter()

  async function init() {
    if (!Capacitor.isNativePlatform()) return

    // Handle links that launched the app from a cold start
    const launchUrl = await App.getLaunchUrl()
    if (launchUrl?.url) {
      const route = urlToRoute(launchUrl.url)
      if (route) router.push(route)
    }

    // Handle links while the app is already running (foreground / background)
    App.addListener('appUrlOpen', ({ url }) => {
      const route = urlToRoute(url)
      if (route) router.push(route)
    })
  }

  async function cleanup() {
    if (!Capacitor.isNativePlatform()) return
    await App.removeAllListeners()
  }

  return { init, cleanup }
}
