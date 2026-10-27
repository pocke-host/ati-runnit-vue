import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
})

export const useNutritionStore = defineStore('nutrition', () => {
  const entries = ref([])
  const totals = ref({ caloriesKcal: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, fiberGrams: 0 })
  const selectedDate = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref(null)

  async function fetchDay(date) {
    loading.value = true
    error.value = null
    try {
      const { data } = await axios.get(`${API_URL}/nutrition`, {
        params: { date, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' },
        headers: authHeaders(),
      })
      selectedDate.value = data.date || date
      entries.value = Array.isArray(data.entries) ? data.entries : []
      totals.value = { ...totals.value, ...(data.totals || {}) }
      return data
    } catch (err) {
      error.value = err.response?.data?.error || "Couldn't load your fuel log. Try again."
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addEntry(payload) {
    saving.value = true
    error.value = null
    try {
      const { data } = await axios.post(`${API_URL}/nutrition`, payload, { headers: authHeaders() })
      entries.value = [data, ...entries.value].sort((a, b) => String(b.loggedAt).localeCompare(String(a.loggedAt)))
      recalculateTotals()
      return data
    } catch (err) {
      error.value = err.response?.data?.error || "Couldn't save this food. Try again."
      throw err
    } finally {
      saving.value = false
    }
  }

  async function removeEntry(id) {
    await axios.delete(`${API_URL}/nutrition/${id}`, { headers: authHeaders() })
    entries.value = entries.value.filter(entry => String(entry.id) !== String(id))
    recalculateTotals()
  }

  function recalculateTotals() {
    const sum = field => entries.value.reduce((total, entry) => total + Number(entry[field] || 0), 0)
    totals.value = {
      caloriesKcal: Math.round(sum('caloriesKcal')),
      proteinGrams: sum('proteinGrams'),
      carbsGrams: sum('carbsGrams'),
      fatGrams: sum('fatGrams'),
      fiberGrams: sum('fiberGrams'),
    }
  }

  return { entries, totals, selectedDate, loading, saving, error, fetchDay, addEntry, removeEntry }
})
