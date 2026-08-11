// src/composables/useAppleHealth.js
// Reads workouts from iOS HealthKit and pushes them to the backend as Activity
// rows (source: APPLE_HEALTH). Safe no-op on web/Android — only activates on iOS.

import { Capacitor } from '@capacitor/core'
import { CapacitorHealthkit, SampleNames } from '@perfood/capacitor-healthkit'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const READ_PERMISSIONS = ['calories', 'distance', 'duration', 'activity']

// HealthKit's HKWorkoutActivityType can surface either as Apple's numeric
// rawValue or as a humanized string depending on plugin/OS version — matched
// defensively against both rather than trusting one exact shape.
const NUMERIC_TYPE_MAP = { 37: 'RUN', 52: 'WALK', 24: 'HIKE', 13: 'BIKE', 46: 'SWIM', 50: 'STRENGTH', 20: 'STRENGTH' }

function mapSportType(rawType) {
  if (rawType == null) return 'OTHER'
  if (NUMERIC_TYPE_MAP[rawType]) return NUMERIC_TYPE_MAP[rawType]
  const s = String(rawType).toLowerCase()
  if (s.includes('run')) return 'RUN'
  if (s.includes('walk')) return 'WALK'
  if (s.includes('hik')) return 'HIKE'
  if (s.includes('cycl') || s.includes('bik')) return 'BIKE'
  if (s.includes('swim')) return 'SWIM'
  if (s.includes('strength')) return 'STRENGTH'
  return 'OTHER'
}

function mapWorkoutSample(sample) {
  const durationSeconds = Math.round(Number(sample?.duration) || 0)
  if (!sample?.uuid || !sample?.startDate || durationSeconds <= 0) return null
  return {
    externalId: sample.uuid,
    sportType: mapSportType(sample.workoutActivityType),
    durationSeconds,
    distanceMeters: sample.totalDistance != null ? Math.round(Number(sample.totalDistance)) : null,
    calories: sample.totalEnergyBurned != null ? Math.round(Number(sample.totalEnergyBurned)) : null,
    performedAt: sample.startDate,
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function useAppleHealth() {
  const isAvailable = Capacitor.getPlatform() === 'ios'

  async function requestAuthorization() {
    await CapacitorHealthkit.requestAuthorization({ all: [], read: READ_PERMISSIONS, write: [] })
  }

  // Reads workouts from the last `sinceDays` days and returns the backend-ready sample shape.
  async function fetchWorkouts(sinceDays = 30) {
    const startDate = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000)
    const { resultData } = await CapacitorHealthkit.queryHKitSampleType({
      sampleName: SampleNames.WORKOUT_TYPE,
      startDate: startDate.toISOString(),
      endDate: new Date().toISOString(),
      limit: 0,
    })
    return (resultData || []).map(mapWorkoutSample).filter(Boolean)
  }

  async function connect() {
    await requestAuthorization()
    await fetch(`${API_URL}/integrations/apple-health/connect`, {
      method: 'POST',
      headers: getAuthHeaders(),
    })
  }

  async function sync(sinceDays = 30) {
    const samples = await fetchWorkouts(sinceDays)
    const res = await fetch(`${API_URL}/integrations/apple-health/sync`, {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ samples }),
    })
    if (!res.ok) throw new Error('Apple Health sync failed')
    return res.json()
  }

  async function getStatus() {
    const res = await fetch(`${API_URL}/integrations/apple-health/status`, {
      headers: getAuthHeaders(),
    })
    if (!res.ok) return { connected: false, lastSync: null }
    return res.json()
  }

  async function disconnect() {
    await fetch(`${API_URL}/integrations/apple-health/disconnect`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
  }

  return { isAvailable, connect, sync, getStatus, disconnect }
}
