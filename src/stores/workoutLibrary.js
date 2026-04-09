// ========== workoutLibrary.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const LIB_CACHE_KEY = 'runnit_workout_library_cache'
const loadLibCache = () => { try { return JSON.parse(localStorage.getItem(LIB_CACHE_KEY) || '[]') } catch { return [] } }
const saveLibCache = (list) => { try { localStorage.setItem(LIB_CACHE_KEY, JSON.stringify(list)) } catch {} }

export const useWorkoutLibraryStore = defineStore('workoutLibrary', () => {
  const library = ref(loadLibCache())
  const loading = ref(false)

  async function fetchLibrary() {
    if (!library.value.length) loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/coach/workout-library`, { headers: getAuthHeaders() })
      library.value = Array.isArray(data) ? data : []
      saveLibCache(library.value)
    } catch {
      // Keep showing cached data on network failure
    } finally {
      loading.value = false
    }
  }

  async function saveWorkout(workout) {
    const { data } = await axios.post(`${API_URL}/coach/workout-library`, workout, { headers: getAuthHeaders() })
    library.value.unshift(data)
    saveLibCache(library.value)
    return data
  }

  async function updateWorkout(id, updates) {
    const { data } = await axios.patch(`${API_URL}/coach/workout-library/${id}`, updates, { headers: getAuthHeaders() })
    const idx = library.value.findIndex(w => w.id === id)
    if (idx !== -1) library.value[idx] = { ...library.value[idx], ...data }
    saveLibCache(library.value)
    return data
  }

  async function deleteWorkout(id) {
    await axios.delete(`${API_URL}/coach/workout-library/${id}`, { headers: getAuthHeaders() })
    library.value = library.value.filter(w => w.id !== id)
    saveLibCache(library.value)
  }

  // Assign this library workout to multiple athletes on a given date
  async function bulkAssign(workoutId, athleteIds, scheduledDate) {
    const { data } = await axios.post(
      `${API_URL}/coach/workout-library/${workoutId}/bulk-assign`,
      { athleteIds, scheduledDate },
      { headers: getAuthHeaders() }
    )
    return data
  }

  return { library, loading, fetchLibrary, saveWorkout, updateWorkout, deleteWorkout, bulkAssign }
})
