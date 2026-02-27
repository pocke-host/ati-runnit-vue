import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useCommunityStore = defineStore('community', () => {
  const rooms = ref([])
  const activeRoom = ref(null)
  const messages = ref([])
  const mentors = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchRooms = async () => {
    loading.value = true
    try {
      const res = await axios.get(`${API_URL}/community/rooms`, { headers: getAuthHeaders() })
      rooms.value = res.data
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load communities'
    } finally {
      loading.value = false
    }
  }

  const fetchMessages = async (roomId, page = 1) => {
    const res = await axios.get(`${API_URL}/community/rooms/${roomId}/messages?page=${page}`, { headers: getAuthHeaders() })
    messages.value = res.data
    return res.data
  }

  const sendMessage = async (roomId, content) => {
    const res = await axios.post(`${API_URL}/community/rooms/${roomId}/messages`, { content }, { headers: getAuthHeaders() })
    messages.value.push(res.data)
    return res.data
  }

  const joinRoom = async (roomId) => {
    await axios.post(`${API_URL}/community/rooms/${roomId}/join`, {}, { headers: getAuthHeaders() })
    const room = rooms.value.find(r => r.id === roomId)
    if (room) room.isMember = true
  }

  const leaveRoom = async (roomId) => {
    await axios.post(`${API_URL}/community/rooms/${roomId}/leave`, {}, { headers: getAuthHeaders() })
    const room = rooms.value.find(r => r.id === roomId)
    if (room) room.isMember = false
  }

  const fetchMentors = async (filters = {}) => {
    const params = new URLSearchParams(filters).toString()
    const res = await axios.get(`${API_URL}/community/mentors?${params}`, { headers: getAuthHeaders() })
    mentors.value = res.data
    return res.data
  }

  const requestMentor = async (mentorId, message) => {
    const res = await axios.post(`${API_URL}/community/mentors/${mentorId}/request`, { message }, { headers: getAuthHeaders() })
    return res.data
  }

  return { rooms, activeRoom, messages, mentors, loading, error, fetchRooms, fetchMessages, sendMessage, joinRoom, leaveRoom, fetchMentors, requestMentor }
})
