import { createApp } from 'vue'
import { createPinia } from 'pinia'
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

app.use(pinia)  // ← THIS MUST COME BEFORE router
app.use(router)

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