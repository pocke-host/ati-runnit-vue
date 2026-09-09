// ========== trainingLoad.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useTrainingLoadStore = defineStore('trainingLoad', () => {
  const data = ref(null)
  const loading = ref(false)

  // { ctl, atl, tsb, acwr, riskLabel, fitnessTrend, hasEnoughData, activityCount90d, series }
  async function fetchTrainingLoad() {
    loading.value = true
    try {
      const { data: d } = await axios.get(`${API_URL}/training-load`, { headers: getAuthHeaders() })
      data.value = d
    } catch {
      data.value = null
    } finally {
      loading.value = false
    }
  }

  return { data, loading, fetchTrainingLoad }
})
