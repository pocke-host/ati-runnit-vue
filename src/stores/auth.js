// ========== auth.js ==========
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token'))
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  
  const isAuthenticated = computed(() => !!token.value)
  
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
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }
  
  // Initialize axios header on store creation
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }
  
  return { 
    token, user, isAuthenticated, 
    login, register, fetchCurrentUser, logout, setAuth 
  }
})