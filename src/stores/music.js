import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const useMusicStore = defineStore('music', () => {
  const spotifyConnected = ref(false)
  const appleMusicConnected = ref(false)
  const currentTrack = ref(null)
  const isPlaying = ref(false)
  const playlists = ref([])
  const activePlaylist = ref(null)
  const volume = ref(80)

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const provider = computed(() => {
    if (spotifyConnected.value) return 'spotify'
    if (appleMusicConnected.value) return 'apple'
    return null
  })

  const connectSpotify = async () => {
    const res = await axios.get(`${API_URL}/music/spotify/auth-url`, { headers: getAuthHeaders() })
    window.location.href = res.data.url
  }

  const connectAppleMusic = async () => {
    const res = await axios.get(`${API_URL}/music/apple/auth-url`, { headers: getAuthHeaders() })
    window.location.href = res.data.url
  }

  const fetchPlaylists = async () => {
    const res = await axios.get(`${API_URL}/music/playlists`, { headers: getAuthHeaders() })
    playlists.value = res.data
    return res.data
  }

  const checkConnection = async () => {
    try {
      const res = await axios.get(`${API_URL}/music/status`, { headers: getAuthHeaders() })
      spotifyConnected.value = res.data.spotify
      appleMusicConnected.value = res.data.apple
      currentTrack.value = res.data.currentTrack || null
      isPlaying.value = res.data.isPlaying || false
    } catch {
      spotifyConnected.value = false
      appleMusicConnected.value = false
    }
  }

  const play = async () => {
    await axios.post(`${API_URL}/music/play`, {}, { headers: getAuthHeaders() })
    isPlaying.value = true
  }

  const pause = async () => {
    await axios.post(`${API_URL}/music/pause`, {}, { headers: getAuthHeaders() })
    isPlaying.value = false
  }

  const next = async () => {
    const res = await axios.post(`${API_URL}/music/next`, {}, { headers: getAuthHeaders() })
    currentTrack.value = res.data
  }

  const previous = async () => {
    const res = await axios.post(`${API_URL}/music/previous`, {}, { headers: getAuthHeaders() })
    currentTrack.value = res.data
  }

  const syncToPace = async (paceMinKm) => {
    const res = await axios.post(`${API_URL}/music/sync-pace`, { paceMinKm }, { headers: getAuthHeaders() })
    if (res.data.playlist) activePlaylist.value = res.data.playlist
  }

  return {
    spotifyConnected, appleMusicConnected, currentTrack, isPlaying, playlists, activePlaylist, volume, provider,
    connectSpotify, connectAppleMusic, fetchPlaylists, checkConnection, play, pause, next, previous, syncToPace
  }
})
