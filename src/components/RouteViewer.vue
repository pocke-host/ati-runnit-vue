<!-- ========== RouteViewer.vue ========== -->
<template>
  <div class="route-viewer">
    <div v-if="loading" class="route-loading">
      <div class="rv-spinner"></div>
      <p>Loading route...</p>
    </div>

    <div v-else-if="error" class="route-error">
      <i class="bi bi-map" style="font-size:2.5rem;color:#C5C5C5"></i>
      <p>{{ error }}</p>
    </div>

    <div v-else class="route-container">
      <!-- Map -->
      <div ref="mapContainer" class="map-container"></div>

      <!-- Strava-style compact stat strip at bottom -->
      <div class="route-stat-strip">
        <div class="rs-item">
          <div class="rs-label">Distance</div>
          <div class="rs-value">{{ formatDistance(activity.distanceMeters) }}</div>
        </div>
        <div class="rs-divider"></div>
        <div class="rs-item">
          <div class="rs-label">Time</div>
          <div class="rs-value">{{ formatDuration(activity.durationSeconds) }}</div>
        </div>
        <div class="rs-divider"></div>
        <div class="rs-item">
          <div class="rs-label">Avg Pace</div>
          <div class="rs-value">{{ formatPace(activity.averagePace) }}</div>
        </div>
        <div v-if="activity.elevationGain" class="rs-divider"></div>
        <div v-if="activity.elevationGain" class="rs-item">
          <div class="rs-label">Elevation</div>
          <div class="rs-value">{{ activity.elevationGain }}m</div>
        </div>
      </div>

      <!-- Controls -->
      <div class="route-controls">
        <button class="control-btn" @click="zoomIn" title="Zoom in">
          <i class="bi bi-plus-lg"></i>
        </button>
        <button class="control-btn" @click="zoomOut" title="Zoom out">
          <i class="bi bi-dash-lg"></i>
        </button>
        <button class="control-btn" @click="resetView" title="Fit route">
          <i class="bi bi-arrows-fullscreen"></i>
        </button>
        <button class="control-btn style-btn" @click="toggleMapStyle" :title="nextStyleLabel">
          <i class="bi bi-layers"></i>
        </button>
      </div>

      <!-- Style label -->
      <div class="style-label">{{ currentStyleLabel }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const props = defineProps({
  activity: { type: Object, required: true },
  height:   { type: String, default: '460px' }
})

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const mapContainer = ref(null)
const map          = ref(null)
const loading      = ref(true)
const error        = ref(null)
const currentStyle = ref('runnit')

// ── Style definitions ──────────────────────────────
const MAP_STYLES = {
  runnit:    { url: 'mapbox://styles/quinn-runnit/cmml6ynyy000701suetifc5y0', label: 'Runnit' },
  satellite: { url: 'mapbox://styles/mapbox/satellite-streets-v12',           label: 'Satellite' },
  dark:      { url: 'mapbox://styles/mapbox/dark-v11',                        label: 'Night' },
}

const STYLE_ORDER = ['runnit', 'satellite', 'dark']

const currentStyleLabel = computed(() => MAP_STYLES[currentStyle.value].label)
const nextStyleLabel    = computed(() => {
  const next = STYLE_ORDER[(STYLE_ORDER.indexOf(currentStyle.value) + 1) % STYLE_ORDER.length]
  return `Switch to ${MAP_STYLES[next].label}`
})

// ── Polyline decoder ───────────────────────────────
const decodePolyline = (encoded) => {
  const coords = []
  let idx = 0, lat = 0, lng = 0
  while (idx < encoded.length) {
    let b, shift = 0, result = 0
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += (result & 1) ? ~(result >> 1) : (result >> 1)
    shift = 0; result = 0
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += (result & 1) ? ~(result >> 1) : (result >> 1)
    coords.push([lng / 1e5, lat / 1e5])
  }
  return coords
}

// ── Route layers ───────────────────────────────────
const addRouteLayers = (mapInst, coordinates) => {
  mapInst.addSource('route', {
    type: 'geojson',
    data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates } }
  })

  // 1. Subtle shadow underneath
  mapInst.addLayer({
    id: 'route-shadow', type: 'line', source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint:  { 'line-color': '#000000', 'line-width': 10, 'line-opacity': 0.08, 'line-blur': 3 }
  })

  // 2. White halo (lifts the line off the map — Strava style)
  mapInst.addLayer({
    id: 'route-halo', type: 'line', source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint:  { 'line-color': '#FFFFFF', 'line-width': 7, 'line-opacity': 1 }
  })

  // 3. Main route line — signal lime
  mapInst.addLayer({
    id: 'route-main', type: 'line', source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint:  { 'line-color': '#0052FF', 'line-width': 4 }
  })
}

// ── Markers ────────────────────────────────────────
const makeMarkerEl = (isStart) => {
  const el = document.createElement('div')
  el.style.cssText = isStart
    ? 'width:14px;height:14px;border-radius:50%;background:#0052FF;border:3px solid #000;box-shadow:0 1px 6px rgba(0,0,0,0.30);cursor:default'
    : 'width:14px;height:14px;border-radius:50%;background:#0C0C0C;border:3px solid #FFFFFF;box-shadow:0 1px 6px rgba(0,0,0,0.40);cursor:default'
  return el
}

// ── Map init ───────────────────────────────────────
const initializeMap = () => {
  if (!props.activity.routePolyline) {
    error.value = 'No route data available'
    loading.value = false
    return
  }
  if (!MAPBOX_TOKEN) {
    error.value = 'Map unavailable — token not set'
    loading.value = false
    return
  }

  try {
    mapboxgl.accessToken = MAPBOX_TOKEN
    const coordinates = decodePolyline(props.activity.routePolyline)

    if (!coordinates.length) {
      error.value = 'Invalid route data'
      loading.value = false
      return
    }

    const bounds = coordinates.reduce(
      (b, c) => b.extend(c),
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    )

    map.value = new mapboxgl.Map({
      container:        mapContainer.value,
      style:            MAP_STYLES[currentStyle.value].url,
      bounds:           bounds,
      fitBoundsOptions: { padding: 64 },
      attributionControl: false,
    })

    map.value.on('load', () => {
      addRouteLayers(map.value, coordinates)

      // Start dot
      new mapboxgl.Marker({ element: makeMarkerEl(true) })
        .setLngLat(coordinates[0])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText('Start'))
        .addTo(map.value)

      // Finish dot
      new mapboxgl.Marker({ element: makeMarkerEl(false) })
        .setLngLat(coordinates[coordinates.length - 1])
        .setPopup(new mapboxgl.Popup({ offset: 16 }).setText('Finish'))
        .addTo(map.value)

      loading.value = false
    })

    map.value.on('error', () => {
      error.value = 'Failed to load map'
      loading.value = false
    })
  } catch {
    error.value = 'Failed to initialize map'
    loading.value = false
  }
}

// ── Controls ───────────────────────────────────────
const zoomIn  = () => map.value?.zoomIn()
const zoomOut = () => map.value?.zoomOut()

const resetView = () => {
  if (!map.value || !props.activity.routePolyline) return
  const coordinates = decodePolyline(props.activity.routePolyline)
  const bounds = coordinates.reduce(
    (b, c) => b.extend(c),
    new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
  )
  map.value.fitBounds(bounds, { padding: 64 })
}

const toggleMapStyle = () => {
  const idx  = STYLE_ORDER.indexOf(currentStyle.value)
  currentStyle.value = STYLE_ORDER[(idx + 1) % STYLE_ORDER.length]

  if (!map.value) return
  map.value.setStyle(MAP_STYLES[currentStyle.value].url)

  map.value.once('style.load', () => {
    if (!props.activity.routePolyline) return
    const coordinates = decodePolyline(props.activity.routePolyline)
    addRouteLayers(map.value, coordinates)

    new mapboxgl.Marker({ element: makeMarkerEl(true) })
      .setLngLat(coordinates[0]).addTo(map.value)
    new mapboxgl.Marker({ element: makeMarkerEl(false) })
      .setLngLat(coordinates[coordinates.length - 1]).addTo(map.value)
  })
}

// ── Formatters ─────────────────────────────────────
const formatDistance = (m) => {
  if (!m) return '—'
  return `${(m / 1000).toFixed(2)} km`
}
const formatDuration = (s) => {
  if (!s) return '—'
  const h = Math.floor(s / 3600), min = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${min}m` : `${min}m`
}
const formatPace = (p) => {
  if (!p) return '—'
  const min = Math.floor(p), sec = Math.round((p - min) * 60)
  return `${min}:${sec.toString().padStart(2, '0')} /km`
}

onMounted(initializeMap)
onUnmounted(() => map.value?.remove())
watch(() => props.activity, () => {
  map.value?.remove()
  loading.value = true
  error.value = null
  initializeMap()
})
</script>

<style scoped>
.route-viewer {
  position: relative;
  width: 100%;
}

/* ── Loading / Error ── */
.route-loading,
.route-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  background: #F8F8F6;
  border: 1px solid #E5E5E5;
  color: #888;
  gap: 12px;
}
.route-loading p,
.route-error p {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.rv-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(15,18,16,0.10);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Map container ── */
.route-container {
  position: relative;
  overflow: hidden;
  border-radius: 0;
  border: 1px solid #E5E5E5;
}

.map-container {
  width: 100%;
  height: v-bind(height);
  min-height: 320px;
}

/* ── Strava-style stat strip ── */
.route-stat-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: rgba(12,12,12,0.82);
  backdrop-filter: blur(8px);
  padding: 10px 16px;
  z-index: 2;
}

.rs-item {
  flex: 1;
  text-align: center;
}

.rs-label {
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  margin-bottom: 2px;
}

.rs-value {
  font-size: 0.95rem;
  font-weight: 900;
  color: #fff;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

.rs-divider {
  width: 1px;
  height: 28px;
  background: rgba(255,255,255,0.12);
  flex-shrink: 0;
  margin: 0 4px;
}

/* ── Controls ── */
.route-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 2;
}

.control-btn {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(0,0,0,0.12);
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s;
  font-size: 0.85rem;
  color: #0C0C0C;
}
.control-btn:hover { background: #fff; }

.style-btn { margin-top: 4px; }

/* ── Current style label ── */
.style-label {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.70);
  background: rgba(12,12,12,0.55);
  padding: 4px 8px;
  z-index: 2;
  pointer-events: none;
}

/* Hide default Mapbox controls */
:deep(.mapboxgl-ctrl-logo),
:deep(.mapboxgl-ctrl-attrib) { display: none !important; }

@media (max-width: 600px) {
  .rs-label  { font-size: 0.52rem; }
  .rs-value  { font-size: 0.82rem; }
  .route-controls { top: 8px; right: 8px; }
  .style-label { top: 8px; left: 8px; }
}
</style>
