// ========== auth.js ==========
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Send cookies with every cross-origin request
axios.defaults.withCredentials = true

// Restore Bearer header on page refresh if token exists in localStorage
const _storedToken = localStorage.getItem('token')
if (_storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${_storedToken}`
}

// Global 401 interceptor — stale/invalid token means the user needs to re-login.
// Without this, every API call silently fails and the app shows all zeros while
// appearing "logged in" (user object still in localStorage from a previous session).
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('runnit_activities_cache')
      delete axios.defaults.headers.common['Authorization']
      // Hard redirect to login — simple and reliable across all pages
      if (!window.location.pathname.startsWith('/join-us') && !window.location.pathname.startsWith('/signup')) {
        window.location.href = '/join-us'
      }
    }
    return Promise.reject(err)
  }
)

const clearLocalState = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('token')
  localStorage.removeItem('onboarding_complete')
  localStorage.removeItem('userRole')
  localStorage.removeItem('subscriptionTier')
  // unitSystem intentionally preserved — it's a preference, not session data
  delete axios.defaults.headers.common['Authorization']
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref((() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null') } catch {
      clearLocalState()
      sessionStorage.setItem('session_corrupted', 'true')
      return null
    }
  })())
  const unitSystem = ref(localStorage.getItem('unitSystem') || 'imperial')
  const onboardingComplete = ref(localStorage.getItem('onboarding_complete') === 'true')
  const subscriptionTier = ref(localStorage.getItem('subscriptionTier') || 'free')
  const subscriptionStatus = ref(null)
  const role = ref(user.value?.role || localStorage.getItem('userRole') || 'athlete')

  // Auth is determined by user object presence — httpOnly cookie handles the actual session
  const isAuthenticated = computed(() => !!user.value)

  function setUnitSystem(system) {
    unitSystem.value = system
    localStorage.setItem('unitSystem', system)
  }

  function completeOnboarding() {
    localStorage.setItem('onboarding_complete', 'true')
    onboardingComplete.value = true
  }

  async function login(email, password) {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password })
    if (data.token) {
      localStorage.setItem('token', data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    }
    setAuth(data.user)
    try { await fetchCurrentUser() } catch { /* silent */ }
  }

  async function register(email, password, displayName, userRole = 'athlete') {
    const { data } = await axios.post(`${API_URL}/auth/register`, {
      email, password, displayName, role: userRole
    })
    if (data.token) {
      localStorage.setItem('token', data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    }
    setAuth(data.user)
  }

  async function fetchCurrentUser() {
    const { data } = await axios.get(`${API_URL}/auth/me`)
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
    if (data.role) {
      role.value = data.role
      localStorage.setItem('userRole', data.role)
    }
    if (data.subscriptionTier) {
      subscriptionTier.value = data.subscriptionTier
      localStorage.setItem('subscriptionTier', data.subscriptionTier)
    }
    if (data.subscriptionStatus) {
      subscriptionStatus.value = data.subscriptionStatus
    }
    if (data.onboardingComplete === true) {
      completeOnboarding()
    }
  }

  function setAuth(newUser) {
    user.value = newUser
    localStorage.setItem('user', JSON.stringify(newUser))
    if (newUser?.role) {
      role.value = newUser.role
      localStorage.setItem('userRole', newUser.role)
    }
    if (newUser?.onboardingComplete === true) {
      completeOnboarding()
    }
  }

  function updateAvatar(url) {
    if (!user.value) return
    user.value = { ...user.value, avatarUrl: url }
    localStorage.setItem('user', JSON.stringify(user.value))
  }

  async function loginWithGoogle(idToken) {
    const { data } = await axios.post(`${API_URL}/auth/google`, { idToken })
    if (data.token) {
      localStorage.setItem('token', data.token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    }
    setAuth(data.user)
    try { await fetchCurrentUser() } catch { /* silent */ }
  }

  async function logout() {
    try { await axios.post(`${API_URL}/auth/logout`) } catch { /* cookie cleared best-effort */ }
    user.value = null
    role.value = 'athlete'
    onboardingComplete.value = false
    subscriptionTier.value = 'free'
    subscriptionStatus.value = null
    clearLocalState()
  }

  return {
    user, isAuthenticated, unitSystem, onboardingComplete,
    subscriptionTier, subscriptionStatus, role,
    login, register, loginWithGoogle, fetchCurrentUser, logout, setAuth, setUnitSystem, completeOnboarding, updateAvatar
  }
})
