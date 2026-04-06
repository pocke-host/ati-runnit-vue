// ========== follow.js ==========
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const FOLLOWING_CACHE_KEY = 'runnit_following_cache'
const FOLLOWERS_CACHE_KEY = 'runnit_followers_cache'
const loadCache = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}
const saveCache = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)) } catch {} }

export const useFollowStore = defineStore('follow', () => {
  const followers = ref(loadCache(FOLLOWERS_CACHE_KEY))
  const following = ref(loadCache(FOLLOWING_CACHE_KEY))
  const loading = ref(false)
  const error = ref(null)

  // Set of IDs the current user follows — used for O(1) "am I following X?" checks
  const followingIds = computed(() => new Set(following.value.map(u => String(u.id))))

  async function followUser(userId) {
    loading.value = true
    error.value = null
    try {
      await axios.post(`${API_URL}/follow/${userId}`)
      // Optimistic: add a stub so followingIds updates immediately
      if (!followingIds.value.has(String(userId))) {
        following.value.push({ id: userId })
        saveCache(FOLLOWING_CACHE_KEY, following.value)
      }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to follow user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function unfollowUser(userId) {
    loading.value = true
    error.value = null
    try {
      await axios.delete(`${API_URL}/follow/${userId}`)
      // Optimistic: remove immediately
      following.value = following.value.filter(u => String(u.id) !== String(userId))
      saveCache(FOLLOWING_CACHE_KEY, following.value)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to unfollow user'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchFollowers(userId) {
    if (!followers.value.length) loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/follow/${userId}/followers`)
      followers.value = data
      saveCache(FOLLOWERS_CACHE_KEY, data)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch followers'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchFollowing(userId) {
    if (!following.value.length) loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/follow/${userId}/following`)
      following.value = data
      saveCache(FOLLOWING_CACHE_KEY, data)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch following'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function isFollowing(userId) {
    // Check cache first — avoids a network round-trip on every profile page load
    if (followingIds.value.has(String(userId))) return true
    try {
      const { data } = await axios.get(`${API_URL}/follow/${userId}/is-following`)
      return data.isFollowing
    } catch {
      return false
    }
  }

  return {
    followers, following, followingIds, loading, error,
    followUser, unfollowUser, fetchFollowers, fetchFollowing, isFollowing
  }
})