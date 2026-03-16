// src/composables/useWorkoutClassifier.js
// Classifies activities into workout types based on pace, distance, and duration

const RUNNING_TYPES = ['RUN', 'Running', 'HIKE', 'Hiking', 'WALK', 'Walking']
const CYCLING_TYPES = ['BIKE', 'Cycling']
const SWIM_TYPES = ['SWIM', 'Swimming']

const RACE_DISTANCES_KM = [5, 10, 21.0975, 42.195]

export function useWorkoutClassifier() {
  /**
   * Returns { type, label, color } or null if not classifiable.
   * type: 'RACE' | 'LONG_RUN' | 'INTERVAL' | 'TEMPO' | 'RECOVERY' | 'EASY' | 'LONG_RIDE' | 'RIDE' | 'SWIM'
   */
  function classifyActivity(activity) {
    if (!activity) return null
    const { distanceMeters = 0, durationSeconds = 0, sportType = '' } = activity
    if (distanceMeters < 100 || durationSeconds < 60) return null

    const distKm = distanceMeters / 1000
    const paceSecKm = (durationSeconds / distanceMeters) * 1000 // s/km
    const durationMin = durationSeconds / 60

    if (CYCLING_TYPES.includes(sportType)) {
      if (distKm > 60) return { type: 'LONG_RIDE', label: 'Long Ride', color: '#8b5cf6' }
      if (paceSecKm < 240) return { type: 'INTERVAL', label: 'Interval', color: '#ef4444' } // > 25 km/h
      return { type: 'RIDE', label: 'Ride', color: '#3b82f6' }
    }

    if (SWIM_TYPES.includes(sportType)) {
      return { type: 'SWIM', label: 'Swim', color: '#06b6d4' }
    }

    if (!RUNNING_TYPES.includes(sportType)) {
      return { type: 'WORKOUT', label: 'Workout', color: '#767676' }
    }

    // Race detection — within 5% of standard distance and fast pace
    for (const rd of RACE_DISTANCES_KM) {
      if (Math.abs(distKm - rd) / rd < 0.05 && paceSecKm < 360) {
        return { type: 'RACE', label: 'Race', color: '#dc2626' }
      }
    }

    // Long run: > 15 km for running
    if (distKm > 15) return { type: 'LONG_RUN', label: 'Long Run', color: '#8b5cf6' }

    // Interval: very fast pace, shorter run
    if (paceSecKm < 270 && distKm < 14) return { type: 'INTERVAL', label: 'Interval', color: '#ef4444' }

    // Tempo: sustained hard effort
    if (paceSecKm < 330 && durationMin > 22 && distKm > 4) return { type: 'TEMPO', label: 'Tempo', color: '#0052FF' }

    // Recovery: very slow or very short
    if (paceSecKm > 420 || (distKm < 4 && durationMin < 25)) return { type: 'RECOVERY', label: 'Recovery', color: '#06b6d4' }

    // Default: easy run
    return { type: 'EASY', label: 'Easy', color: '#22c55e' }
  }

  return { classifyActivity }
}
