// src/stores/notification.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  let pollTimer = null

  const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

  async function fetchNotifications() {
    if (!localStorage.getItem('token')) return
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/notifications`, { headers: getAuthHeaders() })
      notifications.value = Array.isArray(data) ? data : (data.content || [])
    } catch (err) {
      // If endpoint is not available (403/404), stop polling — no point retrying
      if (err.response?.status === 403 || err.response?.status === 404) {
        stopPolling()
      }
      // silent — bell just shows 0
    } finally {
      loading.value = false
    }
  }

  async function markRead(id) {
    try {
      await axios.patch(`${API_URL}/notifications/${id}/read`, {}, { headers: getAuthHeaders() })
      const n = notifications.value.find(n => n.id === id)
      if (n) n.read = true
    } catch { /* silent */ }
  }

  async function markAllRead() {
    try {
      await axios.patch(`${API_URL}/notifications/read-all`, {}, { headers: getAuthHeaders() })
      notifications.value.forEach(n => { n.read = true })
    } catch { /* silent */ }
  }

  function startPolling(intervalMs = 30000) {
    stopPolling()
    fetchNotifications()
    pollTimer = setInterval(fetchNotifications, intervalMs)
  }

  function stopPolling() {
    if (pollTimer) clearInterval(pollTimer)
    pollTimer = null
  }

  return { notifications, unreadCount, loading, fetchNotifications, markRead, markAllRead, startPolling, stopPolling }
})
