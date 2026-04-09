// ========== plan.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const CACHE_KEY = 'runnit_plans_cache'
const DETAIL_CACHE_KEY = 'runnit_plan_details_cache'

const loadCache = () => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]') } catch { return [] } }
const saveCache = (list) => { try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)) } catch {} }

// Per-plan detail cache: { [planId]: fullPlanObject }
const loadDetailCache = () => { try { return JSON.parse(localStorage.getItem(DETAIL_CACHE_KEY) || '{}') } catch { return {} } }
const saveDetailCache = (map) => { try { localStorage.setItem(DETAIL_CACHE_KEY, JSON.stringify(map)) } catch {} }

let _detailCache = loadDetailCache()

export const usePlanStore = defineStore('plan', () => {
  const plans = ref(loadCache())
  const activePlan = ref(plans.value.find(p => p.isActive) || null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchPlans() {
    if (!plans.value.length) loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/plans`, { headers: getAuthHeaders() })
      plans.value = Array.isArray(data) ? data : (data.content || [])
      activePlan.value = plans.value.find(p => p.isActive) || null
      saveCache(plans.value)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch plans'
    } finally {
      loading.value = false
    }
  }

  async function fetchPlan(id) {
    // Return cached detail instantly, background-refresh below
    const cached = _detailCache[id] || null
    loading.value = !cached
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/plans/${id}`, { headers: getAuthHeaders() })
      _detailCache[id] = data
      saveDetailCache(_detailCache)
      return data
    } catch (err) {
      if (cached) return cached  // network failure — serve stale cache
      error.value = err.response?.data?.error || 'Failed to fetch plan'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPlan(planData) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.post(`${API_URL}/plans`, planData, { headers: getAuthHeaders() })
      plans.value.unshift(data)
      if (data.isActive) activePlan.value = data
      saveCache(plans.value)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create plan'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function setActivePlan(id) {
    try {
      const { data } = await axios.patch(`${API_URL}/plans/${id}/activate`, {}, { headers: getAuthHeaders() })
      plans.value = plans.value.map(p => ({ ...p, isActive: p.id === id }))
      activePlan.value = plans.value.find(p => p.id === id) || null
      saveCache(plans.value)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to set active plan'
      throw err
    }
  }

  async function deletePlan(id) {
    try {
      await axios.delete(`${API_URL}/plans/${id}`, { headers: getAuthHeaders() })
      plans.value = plans.value.filter(p => p.id !== id)
      if (activePlan.value?.id === id) activePlan.value = null
      saveCache(plans.value)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete plan'
      throw err
    }
  }

  async function completeWorkout(planId, workoutId) {
    try {
      await axios.patch(
        `${API_URL}/plans/${planId}/workouts/${workoutId}/complete`,
        {},
        { headers: getAuthHeaders() }
      )
      _patchCachedWorkout(planId, workoutId, { completed: true, skipped: false })
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update workout'
      throw err
    }
  }

  async function uncompleteWorkout(planId, workoutId) {
    try {
      await axios.patch(
        `${API_URL}/plans/${planId}/workouts/${workoutId}/uncomplete`,
        {},
        { headers: getAuthHeaders() }
      )
      _patchCachedWorkout(planId, workoutId, { completed: false })
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update workout'
      throw err
    }
  }

  async function suggestPlan(payload) {
    // payload: { sport, goal, level, recentActivities[] }
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.post(`${API_URL}/plans/ai-suggest`, payload, { headers: getAuthHeaders() })
      return data
    } catch (err) {
      // Caller handles fallback to template
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAthletePlans(athleteId) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/plans`, { params: { athleteId }, headers: getAuthHeaders() })
      return Array.isArray(data) ? data : (data.content || [])
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch athlete plans'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPlanForAthlete(athleteId, planData) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.post(`${API_URL}/plans`, { ...planData, athleteId }, { headers: getAuthHeaders() })
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create plan'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePlan(planId, updates) {
    try {
      const { data } = await axios.patch(`${API_URL}/plans/${planId}`, updates, { headers: getAuthHeaders() })
      // Sync into plan list cache
      const idx = plans.value.findIndex(p => p.id === planId)
      if (idx !== -1) { plans.value[idx] = { ...plans.value[idx], ...data }; saveCache(plans.value) }
      // Sync into plan detail cache
      if (_detailCache[planId]) { _detailCache[planId] = { ..._detailCache[planId], ...data }; saveDetailCache(_detailCache) }
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update plan'
      throw err
    }
  }

  async function addWorkout(planId, weekNum, workout) {
    try {
      const { data } = await axios.post(
        `${API_URL}/plans/${planId}/weeks/${weekNum}/workouts`,
        workout,
        { headers: getAuthHeaders() }
      )
      // Insert new workout into cached plan detail
      if (_detailCache[planId]) {
        const plan = _detailCache[planId]
        const week = (plan.weeks || []).find(w => w.weekNumber === weekNum)
        if (week) week.workouts = [...(week.workouts || []), data]
        saveDetailCache(_detailCache)
      }
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to add workout'
      throw err
    }
  }

  async function updateWorkout(planId, workoutId, updates) {
    try {
      const { data } = await axios.patch(
        `${API_URL}/plans/${planId}/workouts/${workoutId}`,
        updates,
        { headers: getAuthHeaders() }
      )
      _patchCachedWorkout(planId, workoutId, data)
      return data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to update workout'
      throw err
    }
  }

  async function deleteWorkout(planId, workoutId) {
    try {
      await axios.delete(`${API_URL}/plans/${planId}/workouts/${workoutId}`, { headers: getAuthHeaders() })
      if (_detailCache[planId]) {
        const plan = _detailCache[planId]
        for (const week of (plan.weeks || [])) {
          week.workouts = (week.workouts || []).filter(w => w.id !== workoutId)
        }
        saveDetailCache(_detailCache)
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete workout'
      throw err
    }
  }

  // Internal helper: patch a workout in the detail cache by ID
  function _patchCachedWorkout(planId, workoutId, patch) {
    if (!_detailCache[planId]) return
    const plan = _detailCache[planId]
    for (const week of (plan.weeks || [])) {
      const wo = (week.workouts || []).find(w => w.id === workoutId)
      if (wo) { Object.assign(wo, patch); break }
    }
    saveDetailCache(_detailCache)
  }

  return {
    plans, activePlan, loading, error,
    fetchPlans, fetchPlan, createPlan, setActivePlan,
    deletePlan, completeWorkout, uncompleteWorkout, suggestPlan,
    fetchAthletePlans, createPlanForAthlete, updatePlan, addWorkout, updateWorkout, deleteWorkout
  }
})
