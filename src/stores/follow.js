// ========== follow.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useFollowStore = defineStore('follow', () => {
  const followers = ref([])
  const following = ref([])
  const loading = ref(false)
  const error = ref(null)
  
  async function followUser(userId) {
    loading.value = true
    error.value = null
    try {
      await axios.post(`${API_URL}/follow/${userId}`)
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
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to unfollow user'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchFollowers(userId) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/follow/${userId}/followers`)
      followers.value = data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch followers'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function fetchFollowing(userId) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/follow/${userId}/following`)
      following.value = data
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch following'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function isFollowing(userId) {
    try {
      const { data } = await axios.get(`${API_URL}/follow/${userId}/is-following`)
      return data.isFollowing
    } catch (err) {
      return false
    }
  }
  
  return { 
    followers, following, loading, error,
    followUser, unfollowUser, fetchFollowers, fetchFollowing, isFollowing 
  }
})