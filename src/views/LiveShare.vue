<template>
  <div class="live-page">
    <div ref="mapContainer" class="live-map"></div>

    <div class="live-overlay" v-if="share">
      <div class="live-badge" :class="share.isActive ? 'badge-live' : 'badge-ended'">
        {{ share.isActive ? 'LIVE' : 'ENDED' }}
      </div>
      <div class="live-name">{{ share.displayName }}</div>
      <div class="live-stats">
        <span class="live-stat">
          <span class="live-stat-emoji">{{ sportEmoji }}</span>
          {{ share.sportType }}
        </span>
        <span class="live-stat" v-if="share.elapsedSeconds">
          <i class="bi bi-stopwatch"></i>
          {{ formatElapsed(share.elapsedSeconds) }}
        </span>
        <span class="live-stat" v-if="share.distanceMeters">
          <i class="bi bi-signpost"></i>
          {{ formatDist(share.distanceMeters) }}
        </span>
      </div>
      <div class="live-updated" v-if="lastUpdate">
        Updated {{ lastUpdate }}
      </div>
    </div>

    <div class="live-not-found" v-if="notFound">
      <i class="bi bi-geo-alt-fill" style="font-size:2rem;color:#ccc"></i>
      <p>This live share link is no longer active or does not exist.</p>
    </div>

    <div class="live-loading" v-if="loading && !share && !notFound">
      <div class="spinner-border text-dark"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import axios from 'axios'

const route = useRoute()
const token = route.params.token

const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const mapContainer = ref(null)
const share = ref(null)
const notFound = ref(false)
const loading = ref(true)
const lastUpdate = ref('')

let map = null
let marker = null
let markerEl = null
let pollInterval = null

const sportEmoji = computed(() => {
  const map = { RUN: '🏃', RIDE: '🚴', SWIM: '🏊', HIKE: '🥾', WALK: '🚶', TRIATHLON: '🏅' }
  return map[share.value?.sportType] || '🏃'
})

function formatElapsed(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

function formatDist(meters) {
  const miles = meters / 1609.34
  return miles >= 0.1 ? `${miles.toFixed(2)} mi` : `${meters} m`
}

function timeSince(isoStr) {
  if (!isoStr) return ''
  const secs = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000)
  if (secs < 10) return 'just now'
  if (secs < 60) return `${secs}s ago`
  return `${Math.floor(secs / 60)}m ago`
}

function createMarkerEl() {
  const el = document.createElement('div')
  el.className = 'live-pulse-marker'
  return el
}

async function fetchShare() {
  try {
    const { data } = await axios.get(`${API}/live-shares/${token}`)
    share.value = data
    notFound.value = false
    lastUpdate.value = timeSince(data.updatedAt)

    if (data.lat != null && data.lng != null) {
      const lngLat = [data.lng, data.lat]
      if (marker) {
        marker.setLngLat(lngLat)
      } else if (map) {
        markerEl = createMarkerEl()
        marker = new mapboxgl.Marker({ element: markerEl })
          .setLngLat(lngLat)
          .addTo(map)
        map.flyTo({ center: lngLat, zoom: 14, speed: 1.2 })
      }
    }

    if (!data.isActive && pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  } catch (e) {
    if (e.response?.status === 404) {
      notFound.value = true
      if (pollInterval) { clearInterval(pollInterval); pollInterval = null }
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (MAPBOX_TOKEN) {
    mapboxgl.accessToken = MAPBOX_TOKEN
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: 'mapbox://styles/quinn-runnit/cmml6ynyy000701suetifc5y0',
      center: [-74.006, 40.7128],
      zoom: 11,
    })
  }

  await fetchShare()
  pollInterval = setInterval(fetchShare, 5000)
  setInterval(() => {
    if (share.value?.updatedAt) lastUpdate.value = timeSince(share.value.updatedAt)
  }, 5000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
  if (map) map.remove()
})
</script>

<style scoped>
.live-page { position: fixed; inset: 0; background: #000; }
.live-map  { width: 100%; height: 100%; }

.live-overlay {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255,255,255,0.97);
  padding: 16px 24px;
  min-width: 280px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 0;
  box-shadow: none;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.15em;
  padding: 3px 10px;
  align-self: flex-start;
}
.badge-live { background: #22c55e; color: #fff; }
.badge-ended { background: #9ca3af; color: #fff; }

.live-name { font-size: 18px; font-weight: 800; color: #000; letter-spacing: -0.01em; }

.live-stats { display: flex; gap: 16px; flex-wrap: wrap; }
.live-stat { font-size: 13px; color: #444; display: flex; align-items: center; gap: 4px; }
.live-stat-emoji { font-size: 15px; }

.live-updated { font-size: 11px; color: #9ca3af; letter-spacing: 0.05em; }

.live-not-found, .live-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #fff;
  font-size: 14px;
  background: rgba(0,0,0,0.7);
}
</style>

<style>
/* global — pulsing dot marker */
.live-pulse-marker {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #000;
  border: 3px solid #fff;
  box-shadow: 0 0 0 0 rgba(0,0,0,0.4);
  animation: live-pulse 2s infinite;
  cursor: default;
}

@keyframes live-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(0,0,0,0.5); }
  70%  { box-shadow: 0 0 0 12px rgba(0,0,0,0); }
  100% { box-shadow: 0 0 0 0 rgba(0,0,0,0); }
}
</style>
