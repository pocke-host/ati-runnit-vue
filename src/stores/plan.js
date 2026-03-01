// ========== plan.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const usePlanStore = defineStore('plan', () => {
  const plans = ref([])
  const activePlan = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchPlans() {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/plans`, { headers: getAuthHeaders() })
      plans.value = Array.isArray(data) ? data : (data.content || [])
      activePlan.value = plans.value.find(p => p.isActive) || null
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch plans'
    } finally {
      loading.value = false
    }
  }

  async function fetchPlan(id) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/plans/${id}`, { headers: getAuthHeaders() })
      return data
    } catch (err) {
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

  return {
    plans, activePlan, loading, error,
    fetchPlans, fetchPlan, createPlan, setActivePlan,
    deletePlan, completeWorkout, uncompleteWorkout, suggestPlan
  }
})
