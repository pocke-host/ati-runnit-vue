// ========== auth.js ==========
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Decode JWT exp without a library — returns true if expired or unreadable
const isJWTExpired = (t) => {
  try {
    const payload = JSON.parse(atob(t.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch { return true }
}

const clearLocalAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('onboarding_complete')
  localStorage.removeItem('userRole')
  localStorage.removeItem('subscriptionTier')
  delete axios.defaults.headers.common['Authorization']
}

export const useAuthStore = defineStore('auth', () => {
  // Evict expired token before any reactive state is read
  const storedToken = localStorage.getItem('token')
  if (storedToken && isJWTExpired(storedToken)) clearLocalAuth()

  const token = ref(localStorage.getItem('token'))
  const user = ref((() => { try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { clearLocalAuth(); return null } })())
  const unitSystem = ref(localStorage.getItem('unitSystem') || 'imperial')
  const onboardingComplete = ref(localStorage.getItem('onboarding_complete') === 'true')
  const subscriptionTier = ref(localStorage.getItem('subscriptionTier') || 'free')
  const subscriptionStatus = ref(null)
  const role = ref(user.value?.role || localStorage.getItem('userRole') || 'athlete')

  const isAuthenticated = computed(() => !!token.value)

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
    setAuth(data.token, data.user)
    // Restore onboarding/role/subscription state from the server profile.
    // The login response may not include onboardingComplete, so we fetch it.
    try { await fetchCurrentUser() } catch { /* silent — setAuth data is still valid */ }
  }

  async function register(email, password, displayName, userRole = 'athlete') {
    const { data } = await axios.post(`${API_URL}/auth/register`, {
      email, password, displayName, role: userRole
    })
    setAuth(data.token, data.user)
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

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
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

  function logout() {
    token.value = null
    user.value = null
    role.value = 'athlete'
    onboardingComplete.value = false
    subscriptionTier.value = 'free'
    subscriptionStatus.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('onboarding_complete')
    localStorage.removeItem('subscriptionTier')
    localStorage.removeItem('userRole')
    delete axios.defaults.headers.common['Authorization']
  }

  // Initialize axios header on store creation
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  return {
    token, user, isAuthenticated, unitSystem, onboardingComplete,
    subscriptionTier, subscriptionStatus, role,
    login, register, fetchCurrentUser, logout, setAuth, setUnitSystem, completeOnboarding, updateAvatar
  }
})
