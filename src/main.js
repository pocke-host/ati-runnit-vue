import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/legacy'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import { injectSpeedInsights } from '@vercel/speed-insights'
import * as Sentry from '@sentry/vue'
import { trackEvent } from '@/composables/useAnalytics'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Global design tokens + resets (must come after Bootstrap to override)
import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

// Error tracking and performance monitoring. The DSN is publishable; secrets
// must never be placed in frontend code. Replay masks input fields by default.
Sentry.init({
  app,
  dsn: import.meta.env.VITE_SENTRY_DSN || 'https://07155da613da9de6e9d3377fbc396268@o4512142249492480.ingest.us.sentry.io/4512142258929664',
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  tracePropagationTargets: [
    'localhost',
    /^https:\/\/ati-runnit-java\.onrender\.com\/api\//,
    /\/api\//,
  ],
  replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
})

app.use(pinia)  // ← THIS MUST COME BEFORE router
app.use(router)
app.use(head)

document.addEventListener('click', (event) => {
  const target = event.target.closest?.('[data-analytics]')
  if (target?.dataset.analytics) trackEvent(target.dataset.analytics, { path: window.location.pathname })
})

// Default timeout for all requests — prevents indefinite UI freeze on slow/hung backends
axios.defaults.timeout = 10000

// Global response interceptor — 401/403 means token is rejected or forbidden.
// Sync Pinia auth store + redirect to login.
axios.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status
    if (status === 401 || status === 403) {
      const wasLoggedIn = !!localStorage.getItem('token')
      // Import lazily to avoid circular dependency — pinia is already initialized by this point
      import('@/stores/auth').then(({ useAuthStore }) => {
        try { useAuthStore().logout() } catch { /* store may not be ready on very first load */ }
      })
      if (wasLoggedIn) router.push('/signin')
    }
    return Promise.reject(err)
  }
)

injectSpeedInsights()

app.mount('#app')
