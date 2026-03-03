// ========== auth.js ==========
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const unitSystem = ref(localStorage.getItem('unitSystem') || 'imperial')
  const onboardingComplete = ref(localStorage.getItem('onboarding_complete') === 'true')
  const subscriptionTier = ref(localStorage.getItem('subscriptionTier') || 'free')
  const subscriptionStatus = ref(null)

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
  }
  
  async function register(email, password, displayName) {
    const { data } = await axios.post(`${API_URL}/auth/register`, { 
      email, password, displayName 
    })
    setAuth(data.token, data.user)
  }
  
  async function fetchCurrentUser() {
    const { data } = await axios.get(`${API_URL}/auth/me`)
    user.value = data
    localStorage.setItem('user', JSON.stringify(data))
    if (data.subscriptionTier) {
      subscriptionTier.value = data.subscriptionTier
      localStorage.setItem('subscriptionTier', data.subscriptionTier)
    }
    if (data.subscriptionStatus) {
      subscriptionStatus.value = data.subscriptionStatus
    }
  }
  
  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }
  
  function logout() {
    token.value = null
    user.value = null
    onboardingComplete.value = false
    subscriptionTier.value = 'free'
    subscriptionStatus.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('onboarding_complete')
    localStorage.removeItem('subscriptionTier')
    delete axios.defaults.headers.common['Authorization']
  }
  
  // Initialize axios header on store creation
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }
  
  return {
    token, user, isAuthenticated, unitSystem, onboardingComplete, subscriptionTier, subscriptionStatus,
    login, register, fetchCurrentUser, logout, setAuth, setUnitSystem, completeOnboarding
  }
})