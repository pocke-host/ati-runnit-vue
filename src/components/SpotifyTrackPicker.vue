<template>
  <div class="spotify-picker">
    <div class="spotify-search-row">
      <input v-model="query" class="spotify-input" placeholder="Search songs, artists, albums…" @keyup.enter="search" aria-label="Search Spotify" />
      <button type="button" class="spotify-search" @click="search" :disabled="loading" aria-label="Search Spotify"><i class="bi bi-search"></i></button>
    </div>
    <div class="spotify-quick-actions">
      <button type="button" @click="useNowPlaying" :disabled="quickLoading">{{ quickLoading ? 'Checking…' : 'Use what’s playing' }}</button>
      <button type="button" @click="loadRecent" :disabled="quickLoading">Recent plays</button>
    </div>
    <button v-if="!connected" type="button" class="spotify-connect" @click="connect">Connect Spotify for automatic listening history</button>
    <div v-if="error" class="spotify-error">{{ error }}</div>
    <div v-else-if="loading" class="spotify-state">Searching…</div>
    <div v-else-if="tracks.length" class="spotify-results">
      <button v-for="track in tracks" :key="track.id + (track.playedAt || '')" type="button" class="spotify-result" @click="$emit('select', track)">
        <img v-if="track.imageUrl" :src="track.imageUrl" alt="" class="spotify-art" />
        <div class="spotify-result-name">{{ track.name }}</div>
        <div class="spotify-result-artist">{{ track.artist }}<span v-if="track.playedAt"> · {{ formatPlayedAt(track.playedAt) }}</span></div>
      </button>
    </div>
    <div v-else class="spotify-state">Search for the track you ran to.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['select'])
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const query = ref('')
const tracks = ref([])
const loading = ref(false)
const quickLoading = ref(false)
const error = ref('')
const connected = ref(false)

const authHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const connect = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/spotify/connect`, { headers: authHeaders() })
    window.location.href = data.url
  } catch (err) {
    error.value = err.response?.data?.error || 'Spotify connection is unavailable.'
  }
}

const search = async () => {
  if (!query.value.trim() || loading.value) return
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API_URL}/spotify/search`, {
      params: { q: query.value.trim() },
      headers: authHeaders()
    })
    tracks.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.error || 'Spotify search is unavailable.'
    tracks.value = []
  } finally { loading.value = false }
}

const useNowPlaying = async () => {
  quickLoading.value = true
  error.value = ''
  try {
    const { data } = await axios.get(`${API_URL}/spotify/currently-playing`, { headers: authHeaders() })
    const item = data?.item
    if (!item?.name) { error.value = 'Nothing is playing on Spotify right now.'; return }
    const artist = item.artists?.[0]?.name || ''
    emit('select', { id: item.id, name: item.name, artist, albumName: item.album?.name, imageUrl: item.album?.images?.[0]?.url, externalUrl: item.external_urls?.spotify })
  } catch (err) { error.value = err.response?.data?.error || 'Could not read what is playing.' }
  finally { quickLoading.value = false }
}

const loadRecent = async () => {
  quickLoading.value = true
  error.value = ''
  try {
    const { data } = await axios.get(`${API_URL}/spotify/recently-played`, { params: { limit: 20 }, headers: authHeaders() })
    tracks.value = Array.isArray(data) ? data : []
    if (!tracks.value.length) error.value = 'No recent Spotify plays were found.'
  } catch (err) { error.value = err.response?.data?.error || 'Could not load recent plays.' }
  finally { quickLoading.value = false }
}

const formatPlayedAt = value => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

onMounted(async () => {
  try { connected.value = (await axios.get(`${API_URL}/spotify/status`, { headers: authHeaders() })).data.connected } catch {}
})
</script>

<style scoped>
.spotify-picker { border: 1px solid #E7DFCE; padding: 10px; background: #fff; }
.spotify-search-row { display: flex; gap: 6px; }
.spotify-input { flex: 1; min-width: 0; border: 1px solid #16130F; padding: 8px; font-size: .78rem; }
.spotify-search { width: 36px; border: 1px solid #16130F; background: #2A55F5; color: #fff; }
.spotify-quick-actions { display:flex; gap:6px; margin-top:8px; flex-wrap:wrap; }
.spotify-quick-actions button { border:1px solid #E7DFCE; background:#FBF6EC; padding:6px 8px; font-size:.68rem; cursor:pointer; }
.spotify-quick-actions button:hover { border-color:#2A55F5; color:#2A55F5; }
.spotify-connect { margin-top: 8px; border: 1px solid #16130F; background: #F5D547; padding: 7px 9px; font-size: .68rem; font-weight: 800; cursor: pointer; }
.spotify-results { display: grid; gap: 4px; margin-top: 8px; max-height: 180px; overflow: auto; }
.spotify-result { display:grid; grid-template-columns:28px 1fr; column-gap:8px; text-align: left; border: 0; border-bottom: 1px solid #E7DFCE; background: transparent; padding: 7px 2px; cursor: pointer; }
.spotify-art { width:28px; height:28px; object-fit:cover; grid-row:span 2; }
.spotify-result:hover { color: #2A55F5; }
.spotify-result-name { font-weight: 800; font-size: .8rem; }
.spotify-result-artist, .spotify-state, .spotify-error { color: #5A5348; font-size: .72rem; }
.spotify-error { color: #C0392B; margin-top: 8px; }
</style>
