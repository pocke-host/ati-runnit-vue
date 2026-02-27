import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useTrainingStore = defineStore('training', () => {
  const plans = ref([])
  const myPlans = ref([])
  const activePlan = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchPlans = async (filters = {}) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams(filters).toString()
      const res = await axios.get(`${API_URL}/training/plans?${params}`, { headers: getAuthHeaders() })
      plans.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load training plans'
    } finally {
      loading.value = false
    }
  }

  const fetchMyPlans = async () => {
    loading.value = true
    try {
      const res = await axios.get(`${API_URL}/training/my-plans`, { headers: getAuthHeaders() })
      myPlans.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load your plans'
    } finally {
      loading.value = false
    }
  }

  const enrollPlan = async (planId) => {
    const res = await axios.post(`${API_URL}/training/plans/${planId}/enroll`, {}, { headers: getAuthHeaders() })
    activePlan.value = res.data
    return res.data
  }

  const fetchActivePlan = async () => {
    try {
      const res = await axios.get(`${API_URL}/training/active`, { headers: getAuthHeaders() })
      activePlan.value = res.data
    } catch {
      activePlan.value = null
    }
  }

  const fetchPlanById = async (id) => {
    const res = await axios.get(`${API_URL}/training/plans/${id}`, { headers: getAuthHeaders() })
    return res.data
  }

  const logWorkout = async (workoutId, data) => {
    const res = await axios.post(`${API_URL}/training/workouts/${workoutId}/log`, data, { headers: getAuthHeaders() })
    return res.data
  }

  return { plans, myPlans, activePlan, loading, error, fetchPlans, fetchMyPlans, enrollPlan, fetchActivePlan, fetchPlanById, logWorkout }
})
