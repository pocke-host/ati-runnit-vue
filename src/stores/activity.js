// ========== activity.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const CACHE_KEY = 'runnit_activities_cache'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

const loadCache = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
    if (raw.fetchedAt && Date.now() - raw.fetchedAt < CACHE_TTL_MS) {
      return raw.data || []
    }
    return []
  } catch { return [] }
}

const saveCache = (list) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: list, fetchedAt: Date.now() }))
  } catch {}
}

const clearCache = () => {
  try { localStorage.removeItem(CACHE_KEY) } catch {}
}

export const useActivityStore = defineStore('activity', () => {
  const activities = ref(loadCache())
  const loading = ref(false)
  const error = ref(null)

  async function createActivity(data) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/activities`, data, { timeout: 30000 })
      activities.value.unshift(response.data)
      saveCache(activities.value)
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
      const result = Array.isArray(data) ? data : (data.content || [])
      if (result.length > 0) {
        activities.value = result
        saveCache(result)
      } else if (activities.value.length === 0) {
        activities.value = result
      }
      return activities.value
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch activities'
      // Keep cached data visible on network failure
    } finally {
      loading.value = false
    }
    return activities.value
  }

  async function fetchActivity(id) {
    const { data } = await axios.get(`${API_URL}/activities/${id}`)
    return data
  }

  async function deleteActivity(id) {
    await axios.delete(`${API_URL}/activities/${id}`)
    activities.value = activities.value.filter(a => String(a.id) !== String(id))
    saveCache(activities.value)
  }

  async function fetchFeed(page = 0) {
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/activities/feed?page=${page}`)
      return Array.isArray(data) ? data : (data.content || [])
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load feed'
      return []
    }
  }

  async function reactToActivity(id, type) {
    const { data } = await axios.post(`${API_URL}/activities/${id}/reactions`, { type })
    return data
  }

  async function removeReaction(id) {
    await axios.delete(`${API_URL}/activities/${id}/reactions`)
  }

  async function fetchComments(id) {
    const { data } = await axios.get(`${API_URL}/activities/${id}/comments`)
    return Array.isArray(data) ? data : []
  }

  async function addComment(id, text) {
    const { data } = await axios.post(`${API_URL}/activities/${id}/comments`, { text })
    return data
  }

  function invalidateCache() {
    clearCache()
    activities.value = []
  }

  return {
    activities, loading, error,
    createActivity, fetchActivities, fetchActivity, deleteActivity,
    fetchFeed, reactToActivity, removeReaction, fetchComments, addComment,
    invalidateCache
  }
})
