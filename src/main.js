import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createUnhead } from '@unhead/vue'
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
const head = createUnhead()

app.use(pinia)  // ← THIS MUST COME BEFORE router
app.use(router)
app.use(head)

// Default timeout for all requests — prevents indefinite UI freeze on slow/hung backends
axios.defaults.timeout = 10000

// Global response interceptor — 401 means token is definitively rejected by the server.
// Clear auth state and send the user to login so they can get a fresh token.
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      const wasLoggedIn = !!localStorage.getItem('token')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('onboarding_complete')
      localStorage.removeItem('userRole')
      localStorage.removeItem('subscriptionTier')
      delete axios.defaults.headers.common['Authorization']
      if (wasLoggedIn) router.push('/join-us')
    }
    return Promise.reject(err)
  }
)

app.mount('#app')