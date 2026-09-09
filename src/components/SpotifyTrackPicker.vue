<template>
  <div class="spotify-picker">
    <div class="spotify-search-row">
      <input v-model="query" class="spotify-input" placeholder="Search Spotify…" @keyup.enter="search" />
      <button type="button" class="spotify-search" @click="search" :disabled="loading"><i class="bi bi-search"></i></button>
    </div>
    <div v-if="error" class="spotify-error">{{ error }}</div>
    <div v-else-if="loading" class="spotify-state">Searching…</div>
    <div v-else-if="tracks.length" class="spotify-results">
      <button v-for="track in tracks" :key="track.id" type="button" class="spotify-result" @click="$emit('select', track)">
        <div class="spotify-result-name">{{ track.name }}</div>
        <div class="spotify-result-artist">{{ track.artist }}</div>
      </button>
    </div>
    <div v-else class="spotify-state">Search for the track you ran to.</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

defineEmits(['select'])
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const query = ref('')
const tracks = ref([])
const loading = ref(false)
const error = ref('')

const search = async () => {
  if (!query.value.trim() || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API_URL}/spotify/search`, {
      params: { q: query.value.trim() },
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
    tracks.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.error || 'Spotify search is unavailable.'
    tracks.value = []
  } finally { loading.value = false }
}
</script>

<style scoped>
.spotify-picker { border: 1px solid #E7DFCE; padding: 10px; background: #fff; }
.spotify-search-row { display: flex; gap: 6px; }
.spotify-input { flex: 1; min-width: 0; border: 1px solid #16130F; padding: 8px; font-size: .78rem; }
.spotify-search { width: 36px; border: 1px solid #16130F; background: #2A55F5; color: #fff; }
.spotify-results { display: grid; gap: 4px; margin-top: 8px; max-height: 180px; overflow: auto; }
.spotify-result { text-align: left; border: 0; border-bottom: 1px solid #E7DFCE; background: transparent; padding: 7px 2px; cursor: pointer; }
.spotify-result:hover { color: #2A55F5; }
.spotify-result-name { font-weight: 800; font-size: .8rem; }
.spotify-result-artist, .spotify-state, .spotify-error { color: #5A5348; font-size: .72rem; }
.spotify-error { color: #C0392B; margin-top: 8px; }
</style>
