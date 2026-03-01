// ========== activity.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useActivityStore = defineStore('activity', () => {
  const activities = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function createActivity(data) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/activities`, data, {
        headers: getAuthHeaders()
      })
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
      const { data } = await axios.get(`${API_URL}/activities?page=${page}`, {
        headers: getAuthHeaders()
      })
      activities.value = Array.isArray(data) ? data : (data.content || [])
      return activities.value
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch activities'
      activities.value = []
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActivity(id) {
    const { data } = await axios.get(`${API_URL}/activities/${id}`, {
      headers: getAuthHeaders()
    })
    return data
  }

  async function deleteActivity(id) {
    await axios.delete(`${API_URL}/activities/${id}`, {
      headers: getAuthHeaders()
    })
    activities.value = activities.value.filter(a => String(a.id) !== String(id))
  }

  async function fetchFeed() {
    try {
      const { data } = await axios.get(`${API_URL}/activities/feed`, {
        headers: getAuthHeaders()
      })
      return Array.isArray(data) ? data : (data.content || [])
    } catch {
      return []
    }
  }

  async function reactToActivity(id, type) {
    const { data } = await axios.post(
      `${API_URL}/activities/${id}/reactions`,
      { type },
      { headers: getAuthHeaders() }
    )
    return data
  }

  async function removeReaction(id) {
    await axios.delete(`${API_URL}/activities/${id}/reactions`, {
      headers: getAuthHeaders()
    })
  }

  async function fetchComments(id) {
    const { data } = await axios.get(`${API_URL}/activities/${id}/comments`, {
      headers: getAuthHeaders()
    })
    return Array.isArray(data) ? data : []
  }

  async function addComment(id, text) {
    const { data } = await axios.post(
      `${API_URL}/activities/${id}/comments`,
      { text },
      { headers: getAuthHeaders() }
    )
    return data
  }

  return {
    activities, loading, error,
    createActivity, fetchActivities, fetchActivity, deleteActivity,
    fetchFeed, reactToActivity, removeReaction, fetchComments, addComment
  }
})
