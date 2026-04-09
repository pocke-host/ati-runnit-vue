// src/tests/regression.auth.test.js
// Regression tests for authentication flow — login, logout, persistence
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

vi.mock('axios')

const MOCK_USER = {
  id: 1,
  email: 'quinn@test.com',
  displayName: 'Quinn Test',
  role: 'athlete',
  onboardingComplete: true,
  subscriptionTier: 'free',
}

const MOCK_TOKEN = 'mock.jwt.token'

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
  delete axios.defaults.headers.common['Authorization']
})

describe('Auth Store — login', () => {
  it('stores token and user in localStorage after login', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: MOCK_TOKEN, user: MOCK_USER } })
    axios.get.mockResolvedValueOnce({ data: MOCK_USER }) // fetchCurrentUser

    const store = useAuthStore()
    await store.login('quinn@test.com', 'password123')

    expect(localStorage.getItem('token')).toBe(MOCK_TOKEN)
    expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({ id: 1, email: 'quinn@test.com' })
  })

  it('sets Authorization header after login', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: MOCK_TOKEN, user: MOCK_USER } })
    axios.get.mockResolvedValueOnce({ data: MOCK_USER })

    const store = useAuthStore()
    await store.login('quinn@test.com', 'password123')

    expect(axios.defaults.headers.common['Authorization']).toBe(`Bearer ${MOCK_TOKEN}`)
  })

  it('isAuthenticated becomes true after successful login', async () => {
    axios.post.mockResolvedValueOnce({ data: { token: MOCK_TOKEN, user: MOCK_USER } })
    axios.get.mockResolvedValueOnce({ data: MOCK_USER })

    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
    await store.login('quinn@test.com', 'password123')
    expect(store.isAuthenticated).toBe(true)
  })

  it('throws and does not set auth on login failure', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Invalid credentials' } } })

    const store = useAuthStore()
    await expect(store.login('bad@test.com', 'wrong')).rejects.toBeDefined()
    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
  })
})

describe('Auth Store — logout', () => {
  it('clears user, token and auth header on logout', async () => {
    // Seed auth state
    localStorage.setItem('token', MOCK_TOKEN)
    localStorage.setItem('user', JSON.stringify(MOCK_USER))
    axios.defaults.headers.common['Authorization'] = `Bearer ${MOCK_TOKEN}`
    axios.post.mockResolvedValueOnce({ data: {} }) // logout API call

    const store = useAuthStore()
    await store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(axios.defaults.headers.common['Authorization']).toBeUndefined()
  })
})

describe('Auth Store — session persistence', () => {
  it('restores user from localStorage on store init', () => {
    localStorage.setItem('user', JSON.stringify(MOCK_USER))

    const store = useAuthStore()
    expect(store.user).toMatchObject({ id: 1 })
    expect(store.isAuthenticated).toBe(true)
  })

  it('handles corrupted user JSON gracefully', () => {
    localStorage.setItem('user', 'NOT_VALID_JSON{{{')

    expect(() => useAuthStore()).not.toThrow()
    const store = useAuthStore()
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('Auth Store — unit system', () => {
  it('defaults to imperial', () => {
    const store = useAuthStore()
    expect(store.unitSystem).toBe('imperial')
  })

  it('persists unit system change to localStorage', () => {
    const store = useAuthStore()
    store.setUnitSystem('metric')
    expect(localStorage.getItem('unitSystem')).toBe('metric')
    expect(store.unitSystem).toBe('metric')
  })
})
