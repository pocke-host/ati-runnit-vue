// src/stores/notification.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  let pollTimer = null

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  async function fetchNotifications() {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/notifications`)
      notifications.value = Array.isArray(data) ? data : (data.content || [])
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        stopPolling()
      }
    } finally {
      loading.value = false
    }
  }

  // Only fetch count — much cheaper than loading all notifications
  async function fetchUnreadCount() {
    try {
      const { data } = await axios.get(`${API_URL}/notifications/count`)
      // If count differs from local state, do a full fetch to sync
      if (data.unreadCount !== unreadCount.value) {
        await fetchNotifications()
      }
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 404) {
        stopPolling()
      }
    }
  }

  async function markRead(id) {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {})
      const n = notifications.value.find(n => n.id === id)
      if (n) n.read = true
    } catch { /* silent */ }
  }

  async function markAllRead() {
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, {})
      notifications.value.forEach(n => { n.read = true })
    } catch { /* silent */ }
  }

  async function createNotification(payload) {
    try {
      await axios.post(`${API_URL}/notifications`, payload)
    } catch { /* silent */ }
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      fetchUnreadCount()
    }
  }

  function startPolling(intervalMs = 30000) {
    stopPolling()
    fetchNotifications()
    // Only poll when tab is visible
    pollTimer = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchUnreadCount()
      }
    }, intervalMs)
    // Immediately sync when user returns to the tab
    document.addEventListener('visibilitychange', onVisibilityChange)
  }

  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  return { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markRead, markAllRead, createNotification, startPolling, stopPolling }
})
