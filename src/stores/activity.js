// ========== activity.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  async function createActivity(data) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/activities`, data)
      activities.value.unshift(response.data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create activity'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchActivities(page = 0) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/activities?page=${page}`)
      activities.value = data.content
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch activities'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return { activities, loading, error, createActivity, fetchActivities }
})