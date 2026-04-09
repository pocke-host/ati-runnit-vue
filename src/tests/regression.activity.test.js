// src/tests/regression.activity.test.js
// Regression tests for activity logging flow
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActivityStore } from '@/stores/activity'
import axios from 'axios'

vi.mock('axios')

const MOCK_ACTIVITY = {
  id: 101,
  sportType: 'Running',
  distanceMeters: 8046,
  durationSeconds: 2400,
  avgHeartRate: 155,
  elevationGain: 42,
  createdAt: '2026-04-08T10:00:00Z',
  user: { id: 1, displayName: 'Quinn Test' },
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

describe('Activity Store — createActivity', () => {
  it('prepends new activity to list and saves to cache', async () => {
    axios.post.mockResolvedValueOnce({ data: MOCK_ACTIVITY })

    const store = useActivityStore()
    const result = await store.createActivity({
      sportType: 'Running',
      distanceMeters: 8046,
      durationSeconds: 2400,
    })

    expect(result.id).toBe(101)
    expect(store.activities[0].id).toBe(101)

    // Verify cache was written
    const cached = JSON.parse(localStorage.getItem('runnit_activities_cache'))
    expect(Array.isArray(cached)).toBe(true)
    expect(cached[0].id).toBe(101)
  })

  it('sets error state and rethrows on API failure', async () => {
    axios.post.mockRejectedValueOnce({ response: { data: { error: 'Server error' } } })

    const store = useActivityStore()
    await expect(store.createActivity({})).rejects.toBeDefined()
    expect(store.error).toBe('Server error')
    expect(store.activities).toHaveLength(0)
  })

  it('clears loading state after createActivity (success)', async () => {
    axios.post.mockResolvedValueOnce({ data: MOCK_ACTIVITY })

    const store = useActivityStore()
    await store.createActivity({ sportType: 'Running', distanceMeters: 5000, durationSeconds: 1800 })
    expect(store.loading).toBe(false)
  })

  it('clears loading state after createActivity (failure)', async () => {
    axios.post.mockRejectedValueOnce(new Error('Network'))

    const store = useActivityStore()
    try { await store.createActivity({}) } catch { /* expected */ }
    expect(store.loading).toBe(false)
  })
})

describe('Activity Store — fetchActivities', () => {
  it('loads activities from API and caches them', async () => {
    axios.get.mockResolvedValueOnce({ data: [MOCK_ACTIVITY] })

    const store = useActivityStore()
    await store.fetchActivities()

    expect(store.activities).toHaveLength(1)
    expect(store.activities[0].id).toBe(101)

    const cached = JSON.parse(localStorage.getItem('runnit_activities_cache'))
    expect(cached[0].id).toBe(101)
  })

  it('serves stale cache on network failure', async () => {
    // Seed cache
    localStorage.setItem('runnit_activities_cache', JSON.stringify([MOCK_ACTIVITY]))

    axios.get.mockRejectedValueOnce(new Error('Network error'))

    const store = useActivityStore()
    const result = await store.fetchActivities()

    // Should keep the cached activity
    expect(result[0].id).toBe(101)
  })

  it('does not show loading spinner when cache exists', async () => {
    localStorage.setItem('runnit_activities_cache', JSON.stringify([MOCK_ACTIVITY]))
    axios.get.mockResolvedValueOnce({ data: [MOCK_ACTIVITY] })

    const store = useActivityStore()
    // loading should NOT be set to true when cache is present
    const fetchPromise = store.fetchActivities()
    expect(store.loading).toBe(false) // cache path
    await fetchPromise
  })
})

describe('Activity Store — cache initialization', () => {
  it('initializes from localStorage cache on store creation', () => {
    localStorage.setItem('runnit_activities_cache', JSON.stringify([MOCK_ACTIVITY]))

    const store = useActivityStore()
    expect(store.activities).toHaveLength(1)
    expect(store.activities[0].id).toBe(101)
  })

  it('handles corrupted cache gracefully', () => {
    localStorage.setItem('runnit_activities_cache', 'CORRUPTED_JSON{{{')

    expect(() => useActivityStore()).not.toThrow()
    const store = useActivityStore()
    expect(store.activities).toEqual([])
  })

  it('handles old paginated cache format {content:[]} gracefully', () => {
    // Old bug: cache stored {content: [...], totalPages: 1} object instead of array
    localStorage.setItem('runnit_activities_cache', JSON.stringify({ content: [MOCK_ACTIVITY], totalPages: 1 }))

    const store = useActivityStore()
    expect(Array.isArray(store.activities)).toBe(true)
    expect(store.activities[0].id).toBe(101)
  })
})
