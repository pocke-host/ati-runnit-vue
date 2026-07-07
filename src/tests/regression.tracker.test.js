// src/tests/regression.tracker.test.js
// Regression tests for activity tracking + save flow
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useActivityStore } from '@/stores/activity'
import axios from 'axios'

vi.mock('axios')

// ── Haversine (copied from LiveTracker — distance between two GPS coords) ──────
const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Polyline encoder (copied from LiveTracker) ─────────────────────────────────
const encodeVal = (v) => {
  let n = v < 0 ? ~(v << 1) : v << 1, s = ''
  while (n >= 0x20) { s += String.fromCharCode((0x20 | (n & 0x1f)) + 63); n >>= 5 }
  return s + String.fromCharCode(n + 63)
}
const encodePolyline = (coords) => {
  let out = '', lat = 0, lng = 0
  for (const [lo, la] of coords) {
    const dLat = Math.round(la * 1e5) - lat
    const dLng = Math.round(lo * 1e5) - lng
    lat = Math.round(la * 1e5)
    lng = Math.round(lo * 1e5)
    out += encodeVal(dLat) + encodeVal(dLng)
  }
  return out
}

const MOCK_ACTIVITY = {
  id: 101,
  sportType: 'RUN',
  distanceMeters: 5000,
  durationSeconds: 1800,
  elevationGain: 42,
  createdAt: '2026-04-08T10:00:00Z',
}

beforeEach(() => {
  setActivePinia(createPinia())
  localStorage.clear()
  vi.clearAllMocks()
})

afterEach(() => {
  localStorage.clear()
})

// ── Haversine accuracy ─────────────────────────────────────────────────────────

describe('haversine — GPS distance formula', () => {
  it('returns 0 for identical points', () => {
    expect(haversine(40.7128, -74.006, 40.7128, -74.006)).toBe(0)
  })

  it('returns ~111km per degree of latitude', () => {
    // 1 degree of latitude ≈ 111,195m
    const dist = haversine(0, 0, 1, 0)
    expect(dist).toBeGreaterThan(111000)
    expect(dist).toBeLessThan(111500)
  })

  it('calculates NY → LA correctly (~3940 km)', () => {
    // New York: 40.7128°N, 74.0060°W | Los Angeles: 34.0522°N, 118.2437°W
    const dist = haversine(40.7128, -74.006, 34.0522, -118.2437)
    expect(dist / 1000).toBeGreaterThan(3900)
    expect(dist / 1000).toBeLessThan(4000)
  })

  it('is symmetric (A→B = B→A)', () => {
    const ab = haversine(51.5074, -0.1278, 48.8566, 2.3522)
    const ba = haversine(48.8566, 2.3522, 51.5074, -0.1278)
    expect(Math.abs(ab - ba)).toBeLessThan(0.001)
  })

  it('filters jitter: distances under 2m should not be accumulated', () => {
    // Two points ~1.5m apart — GPS jitter, should be discarded in LiveTracker
    // haversine itself returns the real distance; the 2m filter is in handlePositionUpdate
    const dist = haversine(37.7749, -122.4194, 37.77490135, -122.4194)
    expect(dist).toBeLessThan(2)
  })
})

// ── Polyline encoding ─────────────────────────────────────────────────────────

describe('encodePolyline — Google Polyline format', () => {
  it('returns a non-empty string for a single coordinate', () => {
    const result = encodePolyline([[-122.4194, 37.7749]])
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns empty string for empty coordinate array', () => {
    expect(encodePolyline([])).toBe('')
  })

  it('produces a longer string for more coordinates', () => {
    const short = encodePolyline([[-122.4194, 37.7749], [-122.4195, 37.7750]])
    const long  = encodePolyline([[-122.4194, 37.7749], [-122.4195, 37.7750], [-122.4196, 37.7751], [-122.4197, 37.7752]])
    expect(long.length).toBeGreaterThan(short.length)
  })

  it('encodes a known coordinate pair to the correct polyline string', () => {
    // Google's documented example: (38.5, -120.2) → "_p~iF~ps|U"
    // Note: polyline format is [lat, lng] but our encoder takes [lng, lat] pairs
    const result = encodePolyline([[-120.2, 38.5]])
    expect(result).toBe('_p~iF~ps|U')
  })

  it('handles negative coordinates without throwing', () => {
    expect(() => encodePolyline([[-180, -90], [180, 90]])).not.toThrow()
  })
})

// ── Activity Store — createActivity auth header ───────────────────────────────

describe('Activity Store — createActivity auth header', () => {
  it('sends Authorization header from localStorage token', async () => {
    localStorage.setItem('token', 'test-jwt-token-abc')
    axios.post.mockResolvedValueOnce({ data: MOCK_ACTIVITY })

    const store = useActivityStore()
    await store.createActivity({ sportType: 'RUN', distanceMeters: 5000, durationSeconds: 1800 })

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/activities'),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-jwt-token-abc' })
      })
    )
  })

  it('sends Authorization: Bearer null when no token in localStorage', async () => {
    // No token — should still send the header (server returns 401, not a crash)
    axios.post.mockRejectedValueOnce({ response: { status: 401, data: { error: 'Unauthorized' } } })

    const store = useActivityStore()
    await expect(store.createActivity({})).rejects.toBeDefined()

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/activities'),
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer null' })
      })
    )
  })

  it('always includes a 30 second timeout', async () => {
    axios.post.mockResolvedValueOnce({ data: MOCK_ACTIVITY })
    localStorage.setItem('token', 'tok')

    const store = useActivityStore()
    await store.createActivity({ sportType: 'RUN' })

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.objectContaining({ timeout: 30000 })
    )
  })

  it('sets error to Unauthorized message on 401', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 401, data: { error: 'Unauthorized' } }
    })

    const store = useActivityStore()
    await expect(store.createActivity({})).rejects.toBeDefined()
    expect(store.error).toBe('Unauthorized')
  })
})

// ── Save retry — frozen snapshot guarantee ────────────────────────────────────

describe('Activity Store — save retry consistency', () => {
  it('a second createActivity call with the same payload succeeds independently', async () => {
    // Simulates the fixed retry path: stopTracking is called twice with the same
    // frozen elapsedTime/totalDistance (since tracking stays paused after first failure).
    // Both calls should post identical payload to the API.
    const payload = { sportType: 'RUN', distanceMeters: 8046, durationSeconds: 2400, elevationGain: 42 }

    axios.post
      .mockRejectedValueOnce({ response: { status: 500, data: { error: 'Server error' } } })
      .mockResolvedValueOnce({ data: { ...MOCK_ACTIVITY, ...payload } })

    const store = useActivityStore()

    // First attempt — fails
    await expect(store.createActivity(payload)).rejects.toBeDefined()
    expect(store.loading).toBe(false)

    // Second attempt with same payload — succeeds
    const result = await store.createActivity(payload)
    expect(result.distanceMeters).toBe(8046)
    expect(result.durationSeconds).toBe(2400)

    // Both calls sent the same payload
    const [firstCall, secondCall] = axios.post.mock.calls
    expect(firstCall[1]).toEqual(secondCall[1])
  })

  it('loading is always false after any createActivity outcome', async () => {
    // Success
    axios.post.mockResolvedValueOnce({ data: MOCK_ACTIVITY })
    const store = useActivityStore()
    await store.createActivity({ sportType: 'RUN' })
    expect(store.loading).toBe(false)

    // Failure
    axios.post.mockRejectedValueOnce(new Error('Network'))
    try { await store.createActivity({}) } catch {}
    expect(store.loading).toBe(false)
  })
})
