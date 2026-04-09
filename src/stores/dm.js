import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getHeaders = () => {
  const t = localStorage.getItem('token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

const CONV_CACHE_KEY = 'runnit_dm_conversations_cache'
const loadConvCache = () => { try { return JSON.parse(localStorage.getItem(CONV_CACHE_KEY) || '[]') } catch { return [] } }
const saveConvCache = (list) => { try { localStorage.setItem(CONV_CACHE_KEY, JSON.stringify(list)) } catch {} }

export const useDMStore = defineStore('dm', () => {
  const isOpen = ref(false)
  const view = ref('list')           // 'list' | 'thread' | 'compose'
  const conversations = ref(loadConvCache())
  const activeUserId = ref(null)
  const activeUserName = ref('')
  const messages = ref([])
  const loading = ref(false)
  const error = ref(null)
  const composeResults = ref([])
  const composeLoading = ref(false)
  const unreadCount = computed(() => conversations.value.filter(c => c.unread).length)

  const open = () => { isOpen.value = true; fetchConversations() }
  const close = () => { isOpen.value = false; view.value = 'list'; activeUserId.value = null }

  const fetchConversations = async () => {
    if (!conversations.value.length) loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/dms/conversations`, { headers: getHeaders() })
      conversations.value = data
      saveConvCache(data)
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load conversations'
      if (!conversations.value.length) conversations.value = []
    } finally {
      loading.value = false
    }
  }

  const openThread = async (userId, displayName) => {
    activeUserId.value = userId
    activeUserName.value = displayName
    view.value = 'thread'
    messages.value = []
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/dms/${userId}/messages`, { headers: getHeaders() })
      messages.value = data
      await axios.patch(`${API_URL}/dms/${userId}/read`, {}, { headers: getHeaders() })
      const c = conversations.value.find(x => x.userId === userId)
      if (c) { c.unread = false; saveConvCache(conversations.value) }
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async (text) => {
    if (!text.trim() || !activeUserId.value) return
    const { data } = await axios.post(`${API_URL}/dms/${activeUserId.value}`, { text }, { headers: getHeaders() })
    messages.value.push(data)
  }

  const backToList = () => {
    view.value = 'list'
    activeUserId.value = null
    activeUserName.value = ''
    messages.value = []
    composeResults.value = []
  }

  const openCompose = () => {
    view.value = 'compose'
    composeResults.value = []
  }

  const searchUsers = async (q) => {
    if (!q.trim()) { composeResults.value = []; return }
    composeLoading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/users/search?q=${encodeURIComponent(q)}`, { headers: getHeaders() })
      composeResults.value = data
    } catch {
      // Fall back to following list if search endpoint unavailable
      try {
        const { data } = await axios.get(`${API_URL}/follow/following`, { headers: getHeaders() })
        const lower = q.toLowerCase()
        composeResults.value = data.filter(u => (u.displayName || '').toLowerCase().includes(lower))
      } catch { composeResults.value = [] }
    } finally {
      composeLoading.value = false
    }
  }

  return {
    isOpen, view, conversations, activeUserId, activeUserName, messages, loading, error,
    composeResults, composeLoading, unreadCount,
    open, close, fetchConversations, openThread, sendMessage, backToList, openCompose, searchUsers
  }
})
