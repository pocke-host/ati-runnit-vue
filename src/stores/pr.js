import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const PR_CATALOG = [
  { id: 'best_5k',        label: 'Best 5K',           icon: 'bi-stopwatch',        sport: 'run'  },
  { id: 'best_10k',       label: 'Best 10K',           icon: 'bi-stopwatch',        sport: 'run'  },
  { id: 'best_half',      label: 'Best Half Marathon', icon: 'bi-trophy',           sport: 'run'  },
  { id: 'best_marathon',  label: 'Best Marathon',      icon: 'bi-trophy-fill',      sport: 'run'  },
  { id: 'longest_run',    label: 'Longest Run',        icon: 'bi-arrows-expand',    sport: 'run'  },
  { id: 'longest_ride',   label: 'Longest Ride',       icon: 'bi-bicycle',          sport: 'ride' },
  { id: 'most_elevation', label: 'Most Elevation',     icon: 'bi-bar-chart-line',   sport: 'any'  },
  { id: 'fastest_pace',   label: 'Fastest Pace',       icon: 'bi-lightning-charge', sport: 'run'  },
]

const RUN_TYPES  = ['RUN', 'Running']
const RIDE_TYPES = ['BIKE', 'Cycling']

export function computePRs(activities) {
  const runs  = activities.filter(a => RUN_TYPES.includes(a.sportType))
  const rides = activities.filter(a => RIDE_TYPES.includes(a.sportType))

  // Helper: pace in sec/km
  const pace = (a) => a.durationSeconds && a.distanceMeters
    ? a.durationSeconds / (a.distanceMeters / 1000)
    : Infinity

  // best_5k – fastest pace among runs >= 5000m
  const runs5k = runs.filter(a => (a.distanceMeters || 0) >= 5000)
  let best_5k = null
  if (runs5k.length) {
    const best = runs5k.reduce((b, a) => pace(a) < pace(b) ? a : b)
    best_5k = { id: best.id, pace: pace(best), estTime: Math.round(pace(best) * 5) }
  }

  // best_10k – runs >= 10000m
  const runs10k = runs.filter(a => (a.distanceMeters || 0) >= 10000)
  let best_10k = null
  if (runs10k.length) {
    const best = runs10k.reduce((b, a) => pace(a) < pace(b) ? a : b)
    best_10k = { id: best.id, pace: pace(best), estTime: Math.round(pace(best) * 10) }
  }

  // best_half – runs >= 21100m
  const runsHalf = runs.filter(a => (a.distanceMeters || 0) >= 21100)
  let best_half = null
  if (runsHalf.length) {
    const best = runsHalf.reduce((b, a) => pace(a) < pace(b) ? a : b)
    best_half = { id: best.id, pace: pace(best), estTime: Math.round(pace(best) * 21.1) }
  }

  // best_marathon – runs >= 42200m
  const runsMarathon = runs.filter(a => (a.distanceMeters || 0) >= 42200)
  let best_marathon = null
  if (runsMarathon.length) {
    const best = runsMarathon.reduce((b, a) => pace(a) < pace(b) ? a : b)
    best_marathon = { id: best.id, pace: pace(best), estTime: Math.round(pace(best) * 42.2) }
  }

  // longest_run – max distanceMeters among runs
  let longest_run = null
  if (runs.length) {
    const best = runs.reduce((b, a) => (a.distanceMeters || 0) > (b.distanceMeters || 0) ? a : b)
    if (best.distanceMeters) longest_run = { id: best.id, distanceMeters: best.distanceMeters }
  }

  // longest_ride – max distanceMeters among rides
  let longest_ride = null
  if (rides.length) {
    const best = rides.reduce((b, a) => (a.distanceMeters || 0) > (b.distanceMeters || 0) ? a : b)
    if (best.distanceMeters) longest_ride = { id: best.id, distanceMeters: best.distanceMeters }
  }

  // most_elevation – max elevation across all activities
  const getElev = (a) => a.elevationMeters ?? a.elevationGain ?? 0
  let most_elevation = null
  if (activities.length) {
    const best = activities.reduce((b, a) => getElev(a) > getElev(b) ? a : b)
    if (getElev(best) > 0) most_elevation = { id: best.id, elevationMeters: getElev(best) }
  }

  // fastest_pace – fastest pace among runs >= 1000m
  const runsMin1k = runs.filter(a => (a.distanceMeters || 0) >= 1000)
  let fastest_pace = null
  if (runsMin1k.length) {
    const best = runsMin1k.reduce((b, a) => pace(a) < pace(b) ? a : b)
    fastest_pace = { id: best.id, pace: pace(best) }
  }

  return { best_5k, best_10k, best_half, best_marathon, longest_run, longest_ride, most_elevation, fastest_pace }
}

export function hasPRs(activityId, prs) {
  return Object.values(prs).some(pr => pr && String(pr.id) === String(activityId))
}

export function getActivityPRs(activityId, prs) {
  return Object.entries(prs)
    .filter(([, pr]) => pr && String(pr.id) === String(activityId))
    .map(([key]) => key)
}

export const usePRStore = defineStore('pr', () => {
  const prs = ref({})
  const loading = ref(false)

  const allPRs = computed(() =>
    PR_CATALOG.map(cat => ({ ...cat, data: prs.value[cat.id] || null }))
  )

  const topPRs = computed(() =>
    allPRs.value.filter(p => p.data).slice(0, 3)
  )

  async function fetchPRs(activities = []) {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/personal-records`, { headers: getAuthHeaders() })
      prs.value = data
    } catch {
      prs.value = computePRs(activities)
    } finally {
      loading.value = false
    }
  }

  function checkPRs() {
    axios.post(`${API_URL}/personal-records/check`, {}, { headers: getAuthHeaders() }).catch(() => {})
  }

  return { prs, loading, allPRs, topPRs, fetchPRs, checkPRs }
})
