import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const BADGE_CATALOG = [
  { id: 'early_adopter', name: 'Early Adopter', description: 'Joined Runnit', icon: '⭐', tier: 'special', category: 'social' },
  { id: 'first_activity', name: 'First Step', description: 'Complete 1 activity', icon: '👟', tier: 'bronze', category: 'milestones' },
  { id: 'first_km', name: 'Moving', description: 'Log 1 km total', icon: '🏅', tier: 'bronze', category: 'milestones' },
  { id: '5k_club', name: '5K Club', description: 'Single activity ≥ 5 km', icon: '🏅', tier: 'bronze', category: 'milestones' },
  { id: '10k_club', name: '10K Club', description: 'Single activity ≥ 10 km', icon: '🏅', tier: 'silver', category: 'milestones' },
  { id: 'half_marathon', name: 'Half Marathoner', description: 'Single activity ≥ 21.1 km', icon: '🥇', tier: 'gold', category: 'milestones' },
  { id: 'marathon', name: 'Marathoner', description: 'Single activity ≥ 42.2 km', icon: '🏆', tier: 'gold', category: 'milestones' },
  { id: 'total_100km', name: 'Century Club', description: '100 km total logged', icon: '💯', tier: 'silver', category: 'milestones' },
  { id: 'total_500km', name: '500 Club', description: '500 km total logged', icon: '🚀', tier: 'gold', category: 'milestones' },
  { id: 'activities_10', name: 'Getting Serious', description: '10 activities completed', icon: '🔥', tier: 'bronze', category: 'milestones' },
  { id: 'activities_50', name: 'Committed', description: '50 activities completed', icon: '⚡', tier: 'silver', category: 'milestones' },
  { id: 'activities_100', name: 'Century Athlete', description: '100 activities completed', icon: '🏋️', tier: 'gold', category: 'milestones' },
  { id: 'streak_3', name: '3-Day Streak', description: 'Log 3 consecutive days', icon: '📆', tier: 'bronze', category: 'streaks' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Log 7 consecutive days', icon: '🗓️', tier: 'silver', category: 'streaks' },
  { id: 'streak_30', name: 'Iron Will', description: 'Log 30 consecutive days', icon: '💪', tier: 'gold', category: 'streaks' },
  { id: 'runner', name: 'Runner', description: '10 run activities', icon: '🏃', tier: 'bronze', category: 'sport' },
  { id: 'cyclist', name: 'Cyclist', description: '10 cycling activities', icon: '🚴', tier: 'bronze', category: 'sport' },
  { id: 'swimmer', name: 'Swimmer', description: '10 swim activities', icon: '🏊', tier: 'bronze', category: 'sport' },
  { id: 'triathlete', name: 'Triathlete', description: '≥1 run + ≥1 ride + ≥1 swim', icon: '🎽', tier: 'silver', category: 'sport' },
  { id: 'social_star', name: 'Social Star', description: 'Post first comment', icon: '💬', tier: 'bronze', category: 'social' },
]

// Progress info for partially-completable badges
export const BADGE_PROGRESS = {
  first_activity: { max: 1, getVal: (acts) => acts.length },
  first_km: { max: 1, getVal: (acts) => acts.reduce((s, a) => s + (a.distanceMeters || 0), 0) / 1000 },
  '5k_club': { max: 5, getVal: (acts) => Math.max(...acts.map(a => (a.distanceMeters || 0) / 1000), 0) },
  '10k_club': { max: 10, getVal: (acts) => Math.max(...acts.map(a => (a.distanceMeters || 0) / 1000), 0) },
  half_marathon: { max: 21.1, getVal: (acts) => Math.max(...acts.map(a => (a.distanceMeters || 0) / 1000), 0) },
  marathon: { max: 42.2, getVal: (acts) => Math.max(...acts.map(a => (a.distanceMeters || 0) / 1000), 0) },
  total_100km: { max: 100, getVal: (acts) => acts.reduce((s, a) => s + (a.distanceMeters || 0), 0) / 1000 },
  total_500km: { max: 500, getVal: (acts) => acts.reduce((s, a) => s + (a.distanceMeters || 0), 0) / 1000 },
  activities_10: { max: 10, getVal: (acts) => acts.length },
  activities_50: { max: 50, getVal: (acts) => acts.length },
  activities_100: { max: 100, getVal: (acts) => acts.length },
  streak_3: { max: 3, getVal: null }, // computed via streak logic
  streak_7: { max: 7, getVal: null },
  streak_30: { max: 30, getVal: null },
  runner: { max: 10, getVal: (acts) => acts.filter(a => ['RUN', 'Running'].includes(a.sportType)).length },
  cyclist: { max: 10, getVal: (acts) => acts.filter(a => ['BIKE', 'Cycling'].includes(a.sportType)).length },
  swimmer: { max: 10, getVal: (acts) => acts.filter(a => ['SWIM', 'Swimming'].includes(a.sportType)).length },
}

function computeMaxStreak(activities) {
  if (!activities.length) return 0
  const days = [...new Set(
    activities.map(a => {
      const d = new Date(a.createdAt)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    })
  )].sort((a, b) => {
    const [ay, am, ad] = a.split('-').map(Number)
    const [by, bm, bd] = b.split('-').map(Number)
    return new Date(ay, am, ad) - new Date(by, bm, bd)
  })

  let maxStreak = 1
  let currentStreak = 1

  for (let i = 1; i < days.length; i++) {
    const [py, pm, pd] = days[i - 1].split('-').map(Number)
    const [cy, cm, cd] = days[i].split('-').map(Number)
    const prev = new Date(py, pm, pd)
    const curr = new Date(cy, cm, cd)
    const diffDays = Math.round((curr - prev) / 86400000)
    if (diffDays === 1) {
      currentStreak++
      maxStreak = Math.max(maxStreak, currentStreak)
    } else {
      currentStreak = 1
    }
  }
  return maxStreak
}

export function computeEarnedBadges(activities) {
  const totalKm = activities.reduce((s, a) => s + (a.distanceMeters || 0), 0) / 1000
  const maxSingleKm = activities.length ? Math.max(...activities.map(a => (a.distanceMeters || 0) / 1000)) : 0
  const count = activities.length
  const runCount = activities.filter(a => ['RUN', 'Running'].includes(a.sportType)).length
  const bikeCount = activities.filter(a => ['BIKE', 'Cycling'].includes(a.sportType)).length
  const swimCount = activities.filter(a => ['SWIM', 'Swimming'].includes(a.sportType)).length
  const maxStreak = computeMaxStreak(activities)

  const earned = new Set()
  earned.add('early_adopter')
  if (count >= 1) earned.add('first_activity')
  if (totalKm >= 1) earned.add('first_km')
  if (maxSingleKm >= 5) earned.add('5k_club')
  if (maxSingleKm >= 10) earned.add('10k_club')
  if (maxSingleKm >= 21.1) earned.add('half_marathon')
  if (maxSingleKm >= 42.2) earned.add('marathon')
  if (totalKm >= 100) earned.add('total_100km')
  if (totalKm >= 500) earned.add('total_500km')
  if (count >= 10) earned.add('activities_10')
  if (count >= 50) earned.add('activities_50')
  if (count >= 100) earned.add('activities_100')
  if (maxStreak >= 3) earned.add('streak_3')
  if (maxStreak >= 7) earned.add('streak_7')
  if (maxStreak >= 30) earned.add('streak_30')
  if (runCount >= 10) earned.add('runner')
  if (bikeCount >= 10) earned.add('cyclist')
  if (swimCount >= 10) earned.add('swimmer')
  if (runCount >= 1 && bikeCount >= 1 && swimCount >= 1) earned.add('triathlete')
  return earned
}

export const useAchievementStore = defineStore('achievement', () => {
  const earnedBadges = ref([])   // [{ badgeId, earnedAt }]
  const loading = ref(false)
  // Keep a snapshot of activities for progress calculations
  const _activities = ref([])

  const allBadges = computed(() =>
    BADGE_CATALOG.map(b => {
      const found = earnedBadges.value.find(e => e.badgeId === b.id)
      return { ...b, earned: !!found, earnedAt: found?.earnedAt || null }
    })
  )

  const earnedCount = computed(() => earnedBadges.value.length)

  const latestEarned = computed(() =>
    allBadges.value.filter(b => b.earned).slice(0, 3)
  )

  // Return progress [current, max] for a badge given current activities
  function getBadgeProgress(badgeId) {
    const info = BADGE_PROGRESS[badgeId]
    if (!info) return null
    const acts = _activities.value
    if (info.getVal) {
      const val = Math.min(info.getVal(acts), info.max)
      return { val: parseFloat(val.toFixed(1)), max: info.max }
    }
    // Streak badges
    if (['streak_3', 'streak_7', 'streak_30'].includes(badgeId)) {
      const streak = computeMaxStreak(acts)
      return { val: Math.min(streak, info.max), max: info.max }
    }
    return null
  }

  async function fetchAchievements(activities = []) {
    _activities.value = activities
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/achievements`, { headers: getAuthHeaders() })
      earnedBadges.value = data
    } catch {
      const ids = computeEarnedBadges(activities)
      earnedBadges.value = [...ids].map(badgeId => ({ badgeId, earnedAt: null }))
    } finally {
      loading.value = false
    }
  }

  async function fetchAchievementsForUser(userId, activities = []) {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/achievements?userId=${userId}`, { headers: getAuthHeaders() })
      return data
    } catch {
      const ids = computeEarnedBadges(activities)
      return [...ids].map(badgeId => ({ badgeId, earnedAt: null }))
    } finally {
      loading.value = false
    }
  }

  function checkAchievements() {
    axios.post(`${API_URL}/achievements/check`, {}, { headers: getAuthHeaders() }).catch(() => {})
  }

  return {
    earnedBadges, loading, allBadges, earnedCount, latestEarned,
    fetchAchievements, fetchAchievementsForUser, checkAchievements, getBadgeProgress
  }
})
