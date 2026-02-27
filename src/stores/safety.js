import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { Geolocation } from '@capacitor/geolocation'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useSafetyStore = defineStore('safety', () => {
  const liveShareActive = ref(false)
  const liveShareToken = ref(null)
  const emergencyContacts = ref([])
  const sosTriggered = ref(false)
  const loading = ref(false)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchEmergencyContacts = async () => {
    const res = await axios.get(`${API_URL}/safety/contacts`, { headers: getAuthHeaders() })
    emergencyContacts.value = res.data
  }

  const addEmergencyContact = async (contact) => {
    const res = await axios.post(`${API_URL}/safety/contacts`, contact, { headers: getAuthHeaders() })
    emergencyContacts.value.push(res.data)
    return res.data
  }

  const removeEmergencyContact = async (id) => {
    await axios.delete(`${API_URL}/safety/contacts/${id}`, { headers: getAuthHeaders() })
    emergencyContacts.value = emergencyContacts.value.filter(c => c.id !== id)
  }

  const startLiveShare = async () => {
    const res = await axios.post(`${API_URL}/safety/live-share/start`, {}, { headers: getAuthHeaders() })
    liveShareActive.value = true
    liveShareToken.value = res.data.token
    return res.data
  }

  const stopLiveShare = async () => {
    await axios.post(`${API_URL}/safety/live-share/stop`, {}, { headers: getAuthHeaders() })
    liveShareActive.value = false
    liveShareToken.value = null
  }

  const broadcastLocation = async (coords) => {
    if (!liveShareActive.value) return
    await axios.post(`${API_URL}/safety/live-share/location`, {
      latitude: coords.latitude,
      longitude: coords.longitude,
      token: liveShareToken.value
    }, { headers: getAuthHeaders() })
  }

  const triggerSOS = async () => {
    loading.value = true
    sosTriggered.value = true
    try {
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
      await axios.post(`${API_URL}/safety/sos`, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      }, { headers: getAuthHeaders() })
    } catch (err) {
      // Still mark SOS as triggered even if location fails
      await axios.post(`${API_URL}/safety/sos`, { timestamp: new Date().toISOString() }, { headers: getAuthHeaders() })
    } finally {
      loading.value = false
    }
  }

  const cancelSOS = async () => {
    await axios.post(`${API_URL}/safety/sos/cancel`, {}, { headers: getAuthHeaders() })
    sosTriggered.value = false
  }

  return {
    liveShareActive, liveShareToken, emergencyContacts, sosTriggered, loading,
    fetchEmergencyContacts, addEmergencyContact, removeEmergencyContact,
    startLiveShare, stopLiveShare, broadcastLocation, triggerSOS, cancelSOS
  }
})
