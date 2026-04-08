// ========== workoutLibrary.js ==========
import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const useWorkoutLibraryStore = defineStore('workoutLibrary', () => {
  const library = ref([])
  const loading = ref(false)

  async function fetchLibrary() {
    loading.value = true
    try {
      const { data } = await axios.get(`${API_URL}/coach/workout-library`, { headers: getAuthHeaders() })
      library.value = Array.isArray(data) ? data : []
    } catch {
      library.value = []
    } finally {
      loading.value = false
    }
  }

  async function saveWorkout(workout) {
    const { data } = await axios.post(`${API_URL}/coach/workout-library`, workout, { headers: getAuthHeaders() })
    library.value.unshift(data)
    return data
  }

  async function updateWorkout(id, updates) {
    const { data } = await axios.patch(`${API_URL}/coach/workout-library/${id}`, updates, { headers: getAuthHeaders() })
    const idx = library.value.findIndex(w => w.id === id)
    if (idx !== -1) library.value[idx] = { ...library.value[idx], ...data }
    return data
  }

  async function deleteWorkout(id) {
    await axios.delete(`${API_URL}/coach/workout-library/${id}`, { headers: getAuthHeaders() })
    library.value = library.value.filter(w => w.id !== id)
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
