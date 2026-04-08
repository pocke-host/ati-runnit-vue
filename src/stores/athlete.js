// ========== athlete.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useAthleteStore = defineStore('athlete', () => {
  const coaches = ref([])
  const myCoach = ref(null)
  const requestSentToId = ref(null)
  const loading = ref(false)

  async function fetchCoaches() {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/coaches`, { headers: getAuthHeaders() })
      coaches.value = Array.isArray(data) ? data : []
    } catch {
      coaches.value = []
    } finally {
      loading.value = false
    }
  }

  async function sendRequest(coachId) {
    await axios.post(`${API_URL}/coaches/${coachId}/requests`, {}, { headers: getAuthHeaders() })
    requestSentToId.value = coachId
  }

  async function cancelRequest(coachId) {
    await axios.delete(`${API_URL}/coaches/${coachId}/requests`, { headers: getAuthHeaders() })
    if (requestSentToId.value === coachId) requestSentToId.value = null
  }

  async function fetchMyCoach() {
    try {
      const { data } = await axios.get(`${API_URL}/athlete/coach`, { headers: getAuthHeaders() })
      myCoach.value = data || null
    } catch {
      myCoach.value = null
    }
  }

  // Fetch workouts pushed to athlete's calendar by their coach
  async function fetchCoachCalendar(start, end) {
    try {
      const { data } = await axios.get(`${API_URL}/athlete/coach/calendar`, {
        params: { start, end },
        headers: getAuthHeaders()
      })
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }

  return {
    coaches, myCoach, requestSentToId, loading,
    fetchCoaches, sendRequest, cancelRequest, fetchMyCoach,
    fetchCoachCalendar,
  }
})
