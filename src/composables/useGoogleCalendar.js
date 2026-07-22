import { ref } from 'vue'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const BASE = `${API}/integrations/google-calendar`

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Module-level (singleton) state — shared across every call site so Calendar.vue,
// GoogleCalendarIntegration.vue, and GoogleCalendarSync.vue all see the same
// connection state instead of each tracking their own out-of-sync copy.
const connected = ref(false)
const statusChecked = ref(false)
const syncing = ref(false)
const error = ref(null)
const lastSync = ref(localStorage.getItem('gcal_last_sync') || null)
const importedEvents = ref([])
const hasLoadedEvents = ref(false)

export function useGoogleCalendar() {

  async function checkStatus() {
    try {
      const { data } = await axios.get(`${BASE}/status`, { headers: getAuthHeaders() })
      connected.value = !!data.connected
    } catch {
      connected.value = false
    } finally {
      statusChecked.value = true
    }
  }

  async function connect() {
    error.value = null
    try {
      const { data } = await axios.get(`${BASE}/connect`, { headers: getAuthHeaders() })
      window.location.href = data.url
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to connect Google Calendar'
    }
  }

  async function disconnect() {
    error.value = null
    try {
      await axios.delete(`${BASE}/disconnect`, { headers: getAuthHeaders() })
    } catch { /* best-effort */ }
    connected.value = false
    lastSync.value = null
    localStorage.removeItem('gcal_last_sync')
  }

  async function pushEvent(workout) {
    const { data } = await axios.post(`${BASE}/events`, workout, { headers: getAuthHeaders() })
    return data
  }

  async function updateEvent(googleEventId, workout) {
    const { data } = await axios.patch(`${BASE}/events/${googleEventId}`, workout, { headers: getAuthHeaders() })
    return data
  }

  async function deleteEvent(googleEventId) {
    await axios.delete(`${BASE}/events/${googleEventId}`, { headers: getAuthHeaders() })
  }

  async function syncAll(workouts) {
    syncing.value = true
    error.value = null
    const results = []
    try {
      const upcoming = workouts.filter((w) => w.date >= new Date().toISOString().slice(0, 10))
      for (const w of upcoming) {
        if (w.googleEventId) {
          await updateEvent(w.googleEventId, w)
          results.push({ id: w.id, googleEventId: w.googleEventId })
        } else {
          const created = await pushEvent(w)
          results.push({ id: w.id, googleEventId: created.id })
        }
      }
      lastSync.value = new Date().toISOString()
      localStorage.setItem('gcal_last_sync', lastSync.value)
    } catch (err) {
      error.value = err.response?.data?.error || 'Sync failed'
    } finally {
      syncing.value = false
    }
    return results
  }

  async function listEvents({ timeMin, timeMax } = {}) {
    const start = timeMin || new Date().toISOString()
    const end = timeMax || new Date(Date.now() + 30 * 86400000).toISOString()
    const { data } = await axios.get(`${BASE}/events`, {
      params: { start, end },
      headers: getAuthHeaders(),
    })
    return data.items || []
  }

  async function readAll(range) {
    syncing.value = true
    error.value = null
    try {
      importedEvents.value = await listEvents(range)
      hasLoadedEvents.value = true
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to load Google Calendar events'
    } finally {
      syncing.value = false
    }
  }

  return {
    connected, statusChecked, syncing, error, lastSync, importedEvents, hasLoadedEvents,
    checkStatus, connect, disconnect, pushEvent, updateEvent, deleteEvent, syncAll, listEvents, readAll,
  }
}
