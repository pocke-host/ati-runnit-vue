// ========== coach.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useCoachStore = defineStore('coach', () => {
  const athletes = ref([])
  const pendingRequests = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAthletes() {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/coach/athletes`, { headers: getAuthHeaders() })
      athletes.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load athletes'
      athletes.value = []
    } finally {
      loading.value = false
    }
  }

  async function fetchRequests() {
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/coach/athletes/requests`, { headers: getAuthHeaders() })
      pendingRequests.value = Array.isArray(data) ? data : []
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load requests'
      pendingRequests.value = []
    }
  }

  async function approveRequest(reqId) {
    await axios.patch(`${API_URL}/coach/athletes/requests/${reqId}/approve`, {}, { headers: getAuthHeaders() })
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== reqId)
    await fetchAthletes()
  }

  async function rejectRequest(reqId) {
    await axios.patch(`${API_URL}/coach/athletes/requests/${reqId}/reject`, {}, { headers: getAuthHeaders() })
    pendingRequests.value = pendingRequests.value.filter(r => r.id !== reqId)
  }

  async function removeAthlete(athleteId) {
    await axios.delete(`${API_URL}/coach/athletes/${athleteId}`, { headers: getAuthHeaders() })
    athletes.value = athletes.value.filter(a => a.id !== athleteId)
  }

  async function fetchAthleteCalendar(athleteId, weeks = 4) {
    try {
      const { data } = await axios.get(`${API_URL}/coach/athletes/${athleteId}/calendar`, {
        params: { weeks },
        headers: getAuthHeaders()
      })
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }

  async function addWorkoutToAthleteCalendar(athleteId, workout) {
    const { data } = await axios.post(
      `${API_URL}/coach/athletes/${athleteId}/calendar`,
      workout,
      { headers: getAuthHeaders() }
    )
    return data
  }

  async function fetchAthleteCompliance(athleteId, weeks = 4) {
    try {
      const { data } = await axios.get(`${API_URL}/coach/athletes/${athleteId}/compliance`, {
        params: { weeks },
        headers: getAuthHeaders()
      })
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }

  async function moveCalendarEvent(athleteId, eventId, newDate) {
    const { data } = await axios.patch(
      `${API_URL}/coach/athletes/${athleteId}/calendar/${eventId}`,
      { scheduledDate: newDate },
      { headers: getAuthHeaders() }
    )
    return data
  }

  async function deleteCalendarEvent(athleteId, eventId) {
    await axios.delete(
      `${API_URL}/coach/athletes/${athleteId}/calendar/${eventId}`,
      { headers: getAuthHeaders() }
    )
  }

  async function fetchAthleteZones(athleteId) {
    try {
      const { data } = await axios.get(`${API_URL}/coach/athletes/${athleteId}/zones`, { headers: getAuthHeaders() })
      return data
    } catch {
      return null
    }
  }

  async function saveAthleteZones(athleteId, zones) {
    const { data } = await axios.put(
      `${API_URL}/coach/athletes/${athleteId}/zones`,
      zones,
      { headers: getAuthHeaders() }
    )
    return data
  }

  async function fetchAthleteRaces(athleteId) {
    try {
      const { data } = await axios.get(`${API_URL}/coach/athletes/${athleteId}/races`, { headers: getAuthHeaders() })
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  }

  async function addAthleteRace(athleteId, race) {
    const { data } = await axios.post(
      `${API_URL}/coach/athletes/${athleteId}/races`,
      race,
      { headers: getAuthHeaders() }
    )
    return data
  }

  async function deleteAthleteRace(athleteId, raceId) {
    await axios.delete(`${API_URL}/coach/athletes/${athleteId}/races/${raceId}`, { headers: getAuthHeaders() })
  }

  async function addActivityAnnotation(activityId, note) {
    const { data } = await axios.post(
      `${API_URL}/coach/activities/${activityId}/annotation`,
      { note },
      { headers: getAuthHeaders() }
    )
    return data
  }

  return {
    athletes, pendingRequests, loading, error,
    fetchAthletes, fetchRequests, approveRequest, rejectRequest, removeAthlete,
    fetchAthleteCalendar, addWorkoutToAthleteCalendar, fetchAthleteCompliance,
    moveCalendarEvent, deleteCalendarEvent,
    fetchAthleteZones, saveAthleteZones,
    fetchAthleteRaces, addAthleteRace, deleteAthleteRace,
    addActivityAnnotation,
  }
})
