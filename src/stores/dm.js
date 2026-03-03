import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getHeaders = () => {
  const t = localStorage.getItem('token')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export const useDMStore = defineStore('dm', () => {
  const isOpen = ref(false)
  const view = ref('list')           // 'list' | 'thread'
  const conversations = ref([])
  const activeUserId = ref(null)
  const activeUserName = ref('')
  const messages = ref([])
  const loading = ref(false)
  const unreadCount = computed(() => conversations.value.filter(c => c.unread).length)

  const open = () => { isOpen.value = true; fetchConversations() }
  const close = () => { isOpen.value = false; view.value = 'list'; activeUserId.value = null }

  const fetchConversations = async () => {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/dms/conversations`, { headers: getHeaders() })
      conversations.value = data
    } catch {
      conversations.value = []
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
      if (c) c.unread = false
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
  }

  return {
    isOpen, view, conversations, activeUserId, activeUserName, messages, loading, unreadCount,
    open, close, fetchConversations, openThread, sendMessage, backToList
  }
})
