// ========== activity.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const CACHE_KEY = 'runnit_activities_cache'

// No TTL — always load from cache. Background fetch keeps it fresh.
const loadCache = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]')
    // Guard against old sessions that cached a paginated object {content:[...]} instead of a plain array
    return Array.isArray(parsed) ? parsed : (parsed.content || [])
  } catch { return [] }
}
const saveCache = (list) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(list)) } catch {}
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

  async function fetchActivities() {
    // Only show spinner on first load — if cache exists show it instantly
    if (!activities.value.length) loading.value = true
    error.value = null
    try {
      // Fetch all activities in batches so stats are accurate over full history.
      // size=200 covers most users in one request; loop handles edge cases.
      const PAGE_SIZE = 200
      const first = await axios.get(`${API_URL}/activities?page=0&size=${PAGE_SIZE}`)
      const firstData = first.data
      let all = Array.isArray(firstData) ? firstData : (firstData.content || [])
      const totalPages = firstData.totalPages ?? 1

      if (totalPages > 1) {
        const remaining = []
        for (let p = 1; p < totalPages; p++) {
          remaining.push(axios.get(`${API_URL}/activities?page=${p}&size=${PAGE_SIZE}`))
        }
        const results = await Promise.all(remaining)
        for (const res of results) {
          const batch = Array.isArray(res.data) ? res.data : (res.data.content || [])
          all = all.concat(batch)
        }
      }

      activities.value = all
      saveCache(all)
      return activities.value
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch activities'
      // Silently keep showing cached data on network failure
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
    // Patch local cache so reactions survive a refresh
    const act = activities.value.find(a => String(a.id) === String(id))
    if (act) {
      act.currentUserReaction = type
      if (!act.reactionCount) act.reactionCount = 0
      act.reactionCount++
      saveCache(activities.value)
    }
    return data
  }

  async function removeReaction(id) {
    await axios.delete(`${API_URL}/activities/${id}/reactions`)
    const act = activities.value.find(a => String(a.id) === String(id))
    if (act) {
      act.currentUserReaction = null
      if (act.reactionCount > 0) act.reactionCount--
      saveCache(activities.value)
    }
  }

  async function fetchComments(id) {
    const { data } = await axios.get(`${API_URL}/activities/${id}/comments`)
    return Array.isArray(data) ? data : []
  }

  async function addComment(id, text) {
    const { data } = await axios.post(`${API_URL}/activities/${id}/comments`, { text })
    return data
  }

  return {
    activities, loading, error,
    createActivity, fetchActivities, fetchActivity, deleteActivity,
    fetchFeed, reactToActivity, removeReaction, fetchComments, addComment,
  }
})
