// ========== useUnits.js ==========
// Central unit formatting composable.
// All distance/pace/elevation displays should use this instead of local helpers.
//
// Reads unitSystem ('imperial' | 'metric') from the auth store.
// Default is 'imperial' (US).

import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const KM_TO_MI = 0.621371
const M_TO_FT = 3.28084

export function useUnits() {
  const authStore = useAuthStore()
  const isImperial = computed(() => authStore.unitSystem === 'imperial')

  // "mi" or "km"
  const distanceLabel = computed(() => isImperial.value ? 'mi' : 'km')

  // "/mi" or "/km"
  const paceLabel = computed(() => isImperial.value ? '/mi' : '/km')

  // "ft" or "m"
  const elevationLabel = computed(() => isImperial.value ? 'ft' : 'm')

  /**
   * Format meters → "1.24 mi" | "2.00 km"
   */
  function formatDistance(meters, decimals = 2) {
    if (!meters && meters !== 0) return '—'
    if (isImperial.value) {
      return `${(meters / 1000 * KM_TO_MI).toFixed(decimals)} mi`
    }
    return `${(meters / 1000).toFixed(decimals)} km`
  }

  /**
   * Format meters short (1 decimal) → "1.2 mi" | "2.0 km"
   */
  function formatDistanceShort(meters) {
    return formatDistance(meters, 1)
  }

  /**
   * Format seconds → "42 min" | "1h 12m"
   */
  function formatDuration(seconds) {
    if (!seconds && seconds !== 0) return '—'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}m`
    return `${m} min`
  }

  /**
   * Format seconds as a clock → "1:12:34" | "42:05"
   */
  function formatDurationClock(seconds) {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  /**
   * Format pace (minutes per km) → "8:51 /mi" | "5:30 /km"
   * Pass in minPerKm (as computed from distanceMeters/durationSeconds).
   */
  function formatPace(minPerKm) {
    if (!minPerKm || minPerKm === Infinity || isNaN(minPerKm)) return '--:--'
    const pace = isImperial.value ? minPerKm / KM_TO_MI : minPerKm
    const label = isImperial.value ? '/mi' : '/km'
    const mins = Math.floor(pace)
    const secs = Math.round((pace - mins) * 60)
    return `${mins}:${secs.toString().padStart(2, '0')} ${label}`
  }

  /**
   * Format meters of elevation → "450 ft" | "137 m"
   */
  function formatElevation(meters) {
    if (meters == null) return '—'
    if (isImperial.value) return `${Math.round(meters * M_TO_FT)} ft`
    return `${Math.round(meters)} m`
  }

  /**
   * Format km/h speed → "6.2 mph" | "10.0 km/h"
   */
  function formatSpeed(kmh) {
    if (!kmh && kmh !== 0) return '—'
    if (isImperial.value) return `${(kmh * KM_TO_MI).toFixed(1)} mph`
    return `${kmh.toFixed(1)} km/h`
  }

  /**
   * Raw conversion helpers (no string formatting)
   */
  function metersToDisplay(meters) {
    return isImperial.value ? meters / 1000 * KM_TO_MI : meters / 1000
  }

  return {
    isImperial,
    distanceLabel,
    paceLabel,
    elevationLabel,
    formatDistance,
    formatDistanceShort,
    formatDuration,
    formatDurationClock,
    formatPace,
    formatElevation,
    formatSpeed,
    metersToDisplay,
  }
}
