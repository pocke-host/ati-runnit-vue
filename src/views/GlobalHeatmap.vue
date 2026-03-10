<template>
  <main class="heatmap-page">
    <div ref="mapContainer" class="map"></div>

    <!-- Controls overlay -->
    <div class="heatmap-controls">
      <div class="heatmap-title">Activity Heatmap</div>
      <div class="heatmap-count" v-if="pointCount > 0">{{ pointCount }} activities plotted</div>
      <div class="heatmap-empty" v-else-if="!loading">No activity data yet</div>
      <div class="heatmap-loading" v-if="loading">
        <span class="spin"></span> Loading…
      </div>
    </div>
  </main>
</template>

<script setup>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, onBeforeUnmount, ref } from 'vue'
import axios from 'axios'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const mapContainer = ref(null)
const loading = ref(true)
const pointCount = ref(0)

let map
const SOURCE_ID = 'runnit-activities'

onMounted(async () => {
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/quinn-runnit/cmml6ynyy000701suetifc5y0',
    center: [-98.5795, 39.8283],
    zoom: 4,
    attributionControl: false,
  })

  map.addControl(new mapboxgl.NavigationControl(), 'top-right')
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

  map.on('load', async () => {
    map.addSource(SOURCE_ID, { type: 'geojson', data: emptyFC() })

    // Heatmap layer (visible at lower zooms)
    map.addLayer({
      id: 'runnit-heat',
      type: 'heatmap',
      source: SOURCE_ID,
      maxzoom: 14,
      paint: {
        'heatmap-radius':    ['interpolate', ['linear'], ['zoom'], 0, 3, 9, 20, 13, 35],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 13, 2],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0,   'rgba(0,0,0,0)',
          0.2, '#a8edbc',
          0.4, '#56c596',
          0.6, '#f0c040',
          0.8, '#f07030',
          1,   '#e02020'
        ],
        'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 10, 0.9, 14, 0.3],
      }
    })

    // Point layer (visible when zoomed in close)
    map.addLayer({
      id: 'runnit-points',
      type: 'circle',
      source: SOURCE_ID,
      minzoom: 13,
      paint: {
        'circle-radius':       4,
        'circle-color':        '#56c596',
        'circle-stroke-color': '#fff',
        'circle-stroke-width': 1,
        'circle-opacity':      0.85,
      }
    })

    await loadActivities()
  })
})

onBeforeUnmount(() => { if (map) map.remove() })

function emptyFC() { return { type: 'FeatureCollection', features: [] } }

async function loadActivities() {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API_URL}/activities?page=0&size=500`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })

    const activities = Array.isArray(data) ? data : (data.content ?? data.activities ?? [])
    const features = []

    for (const act of activities) {
      // Use start coordinates if available
      if (act.startLat && act.startLng) {
        features.push({
          type: 'Feature',
          properties: { sport: act.sport || act.activityType || 'running' },
          geometry: { type: 'Point', coordinates: [act.startLng, act.startLat] }
        })
      }
    }

    pointCount.value = features.length
    if (map.getSource(SOURCE_ID)) {
      map.getSource(SOURCE_ID).setData({ type: 'FeatureCollection', features })
    }

    // Fly to user's activity cluster if we have points
    if (features.length > 0) {
      const lngs = features.map(f => f.geometry.coordinates[0])
      const lats = features.map(f => f.geometry.coordinates[1])
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 80, maxZoom: 12, duration: 1200 }
      )
    }
  } catch (e) {
    console.error('Heatmap load failed:', e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.heatmap-page {
  position: relative;
  height: 100vh;
}
.map {
  position: absolute;
  top: var(--nav-h, 64px);
  left: 0;
  right: 0;
  bottom: 0;
}

.heatmap-controls {
  position: absolute;
  top: calc(var(--nav-h, 64px) + 16px);
  left: 16px;
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 180px;
  backdrop-filter: blur(8px);
}

.heatmap-title {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #fff;
}

.heatmap-count {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.65);
}

.heatmap-empty {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.45);
}

.heatmap-loading {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.65);
  display: flex;
  align-items: center;
  gap: 8px;
}

.spin {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
  flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
