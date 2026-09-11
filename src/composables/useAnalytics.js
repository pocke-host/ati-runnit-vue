import { track } from '@vercel/analytics'

// One small event boundary keeps product analytics consistent and vendor-specific
// details out of views. Vercel Analytics is cookieless by default.
export function trackEvent(name, properties = {}) {
  try { track(name, properties) } catch { /* analytics must never interrupt a user action */ }
}
