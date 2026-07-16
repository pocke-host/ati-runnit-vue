import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/legacy'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Global design tokens + resets (must come after Bootstrap to override)
import '@/assets/main.css'

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

app.use(pinia)  // ← THIS MUST COME BEFORE router
app.use(router)
app.use(head)

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
      if (wasLoggedIn) router.push('/join-us')
    }
    return Promise.reject(err)
  }
)

app.mount('#app')