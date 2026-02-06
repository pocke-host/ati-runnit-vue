// ========== moment.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useMomentStore = defineStore('moment', () => {
  const feed = ref([])
  const userMoments = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  async function createMoment(data) {
    loading.value = true
    error.value = null
    try {
      const response = await axios.post(`${API_URL}/moments`, data)
      return response.data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to create moment'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchFeed(page = 0) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/moments/feed?page=${page}`)
      feed.value = data.content
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch feed'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchUserMoments(userId, page = 0) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/moments/user/${userId}?page=${page}`)
      userMoments.value = data.content
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch moments'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function addReaction(momentId, type) {
    await axios.post(`${API_URL}/moments/${momentId}/reaction`, { type })
    // Update local state
    const moment = feed.value.find(m => m.id === momentId)
    if (moment) {
      moment.currentUserReaction = type
      moment.reactionCount++
    }
  }
  
  async function removeReaction(momentId) {
    await axios.delete(`${API_URL}/moments/${momentId}/reaction`)
    // Update local state
    const moment = feed.value.find(m => m.id === momentId)
    if (moment) {
      moment.currentUserReaction = null
      moment.reactionCount--
    }
  }
  
  return { 
    feed, userMoments, loading, error,
    createMoment, fetchFeed, fetchUserMoments, addReaction, removeReaction 
  }
})
