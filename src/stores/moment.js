// ========== moment.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const FEED_CACHE_KEY = 'runnit_moments_feed_cache'
const USER_CACHE_KEY = 'runnit_moments_user_cache'
const loadCache = (key) => { try { return JSON.parse(localStorage.getItem(key) || '[]') } catch { return [] } }
const saveCache = (key, data) => { try { localStorage.setItem(key, JSON.stringify(data)) } catch {} }

export const useMomentStore = defineStore('moment', () => {
  const feed = ref(loadCache(FEED_CACHE_KEY))
  const userMoments = ref(loadCache(USER_CACHE_KEY))
  const loading = ref(false)
  const error = ref(null)
  
  async function createMoment(data) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/moments`, data)
      feed.value.unshift(response.data)
      saveCache(FEED_CACHE_KEY, feed.value)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create moment'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchFeed(page = 0, size = 100) {
    if (!feed.value.length) loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/moments/feed?page=${page}&size=${size}`)
      const items = data.content || data
      // Append on paginated loads, replace on first load
      feed.value = page === 0 ? items : [...feed.value, ...items]
      saveCache(FEED_CACHE_KEY, feed.value)
      return { totalPages: data.totalPages ?? 1 }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch feed'
      return { totalPages: 1 }
    } finally {
      loading.value = false
    }
  }

  async function fetchUserMoments(userId, page = 0, size = 100) {
    if (!userMoments.value.length) loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/moments/user/${userId}?page=${page}&size=${size}`)
      const items = data.content || data
      userMoments.value = page === 0 ? items : [...userMoments.value, ...items]
      saveCache(USER_CACHE_KEY, userMoments.value)
      return { totalPages: data.totalPages ?? 1 }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch moments'
      return { totalPages: 1 }
    } finally {
      loading.value = false
    }
  }
  
  async function addReaction(momentId, type) {
    await axios.post(`${API_URL}/moments/${momentId}/reaction`, { type })
    // Update feed cache
    const feedMoment = feed.value.find(m => m.id === momentId)
    if (feedMoment) { feedMoment.currentUserReaction = type; feedMoment.reactionCount++ }
    // Update userMoments cache
    const userMoment = userMoments.value.find(m => m.id === momentId)
    if (userMoment) { userMoment.currentUserReaction = type; userMoment.reactionCount++ }
    // Persist both caches
    if (feedMoment) saveCache(FEED_CACHE_KEY, feed.value)
    if (userMoment) saveCache(USER_CACHE_KEY, userMoments.value)
  }

  async function removeReaction(momentId) {
    await axios.delete(`${API_URL}/moments/${momentId}/reaction`)
    // Update feed cache
    const feedMoment = feed.value.find(m => m.id === momentId)
    if (feedMoment) { feedMoment.currentUserReaction = null; feedMoment.reactionCount-- }
    // Update userMoments cache
    const userMoment = userMoments.value.find(m => m.id === momentId)
    if (userMoment) { userMoment.currentUserReaction = null; userMoment.reactionCount-- }
    // Persist both caches
    if (feedMoment) saveCache(FEED_CACHE_KEY, feed.value)
    if (userMoment) saveCache(USER_CACHE_KEY, userMoments.value)
  }
  
  return { 
    feed, userMoments, loading, error,
    createMoment, fetchFeed, fetchUserMoments, addReaction, removeReaction 
  }
})
