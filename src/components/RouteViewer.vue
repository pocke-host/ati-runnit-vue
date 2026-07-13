<!-- ========== RouteViewer.vue ========== -->
<template>
  <div class="route-viewer">

    <div v-if="loading" class="route-loading">
      <div class="rv-spinner"></div>
      <span class="rv-loading-text">Loading route</span>
    </div>

    <div v-else-if="error" class="route-error">
      <i class="bi bi-map"></i>
      <span>{{ error }}</span>
    </div>

    <div v-else class="route-container">
      <div ref="mapContainer" class="map-container"></div>

      <!-- Stat strip -->
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
        <template v-if="activity.elevationGain">
          <div class="rs-divider"></div>
          <div class="rs-item">
            <div class="rs-label">Elevation</div>
            <div class="rs-value">{{ activity.elevationGain }}m</div>
          </div>
        </template>
      </div>

      <!-- Controls -->
      <div class="route-controls">
        <button class="control-btn" @click="zoomIn"    title="Zoom in"><i class="bi bi-plus-lg"></i></button>
        <button class="control-btn" @click="zoomOut"   title="Zoom out"><i class="bi bi-dash-lg"></i></button>
        <button class="control-btn" @click="resetView" title="Fit route"><i class="bi bi-arrows-fullscreen"></i></button>
        <button class="control-btn style-btn" @click="toggleMapStyle" :title="nextStyleLabel">
          <i class="bi bi-layers"></i>
        </button>
      </div>

      <!-- Style badge -->
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
const startMarker  = ref(null)
const endMarker    = ref(null)

// ── Style definitions ────────────────────────────────
// terrain: true enables the 3D DEM + sky atmosphere on that style
const MAP_STYLES = {
  runnit:    { url: 'mapbox://styles/quinn-runnit/cmml6ynyy000701suetifc5y0', label: 'Runnit',    terrain: false },
  terrain:   { url: 'mapbox://styles/mapbox/outdoors-v12',                    label: 'Terrain',   terrain: true  },
  satellite: { url: 'mapbox://styles/mapbox/satellite-streets-v12',           label: 'Satellite', terrain: false },
  dark:      { url: 'mapbox://styles/mapbox/dark-v11',                        label: 'Night',     terrain: false },
}
const STYLE_ORDER = ['runnit', 'terrain', 'satellite', 'dark']

const currentStyleLabel = computed(() => MAP_STYLES[currentStyle.value].label)
const nextStyleLabel    = computed(() => {
  const next = STYLE_ORDER[(STYLE_ORDER.indexOf(currentStyle.value) + 1) % STYLE_ORDER.length]
  return `Switch to ${MAP_STYLES[next].label}`
})

// ── Polyline decoder ─────────────────────────────────
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

// ── Route draw animation (REVER-style) ───────────────
// Progressively reveals the route from start → finish over 1.4 seconds
const animateRouteDraw = (allCoords) => {
  const DURATION_MS = 1400
  const startTime   = Date.now()

  const draw = () => {
    if (!map.value?.getSource('route')) return
    const elapsed  = Date.now() - startTime
    const t        = Math.min(elapsed / DURATION_MS, 1)
    const eased    = 1 - Math.pow(1 - t, 3) // ease-out cubic
    const count    = Math.max(2, Math.round(eased * allCoords.length))

    map.value.getSource('route').setData({
      type: 'Feature', properties: {},
      geometry: { type: 'LineString', coordinates: allCoords.slice(0, count) }
    })

    if (t < 1) requestAnimationFrame(draw)
  }
  requestAnimationFrame(draw)
}

// ── Route layers ─────────────────────────────────────
const addRouteLayers = (mapInst, coordinates) => {
  // Source starts empty; animateRouteDraw fills it in
  mapInst.addSource('route', {
    type: 'geojson',
    data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
  })

  // 1. Depth shadow
  mapInst.addLayer({
    id: 'route-shadow', type: 'line', source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint:  { 'line-color': '#000000', 'line-width': 14, 'line-opacity': 0.10, 'line-blur': 5 }
  })

  // 2. White halo — pops the line off any basemap
  mapInst.addLayer({
    id: 'route-halo', type: 'line', source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint:  { 'line-color': '#FFFFFF', 'line-width': 8, 'line-opacity': 1 }
  })

  // 3. Main cobalt route line
  mapInst.addLayer({
    id: 'route-main', type: 'line', source: 'route',
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint:  { 'line-color': '#2A55F5', 'line-width': 4.5 }
  })

  animateRouteDraw(coordinates)
}

// ── Sky + fog (BMW/REVER cinematic atmosphere) ───────
const addSkyAndFog = (mapInst, isDark) => {
  if (!mapInst.getLayer('sky')) {
    mapInst.addLayer({
      id: 'sky', type: 'sky',
      paint: {
        'sky-type':                     'atmosphere',
        'sky-atmosphere-sun':           [0.0, 90.0],
        'sky-atmosphere-sun-intensity': 15,
      }
    })
  }
  mapInst.setFog({
    color:            isDark ? 'rgb(20, 18, 14)'     : 'rgb(220, 215, 200)',
    'high-color':     isDark ? 'rgb(22, 25, 50)'     : 'rgb(36, 92, 223)',
    'horizon-blend':  0.02,
    'space-color':    'rgb(11, 11, 25)',
    'star-intensity': isDark ? 0.6 : 0.0,
  })
}

// ── 3D terrain (REVER-style elevation extrusion) ─────
const addTerrain = (mapInst) => {
  if (!mapInst.getSource('mapbox-dem')) {
    mapInst.addSource('mapbox-dem', {
      type: 'raster-dem',
      url:  'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom:  14,
    })
  }
  mapInst.setTerrain({ source: 'mapbox-dem', exaggeration: 1.4 })
}

const removeTerrain = (mapInst) => {
  try { mapInst.setTerrain(null) } catch { /* already removed */ }
}

// ── Pill markers (TripAdvisor-style clear labelling) ─
const makeMarkerEl = (isStart) => {
  const el = document.createElement('div')
  el.textContent = isStart ? 'START' : 'FINISH'
  Object.assign(el.style, {
    fontFamily:    "'Spline Sans Mono', ui-monospace, monospace",
    fontSize:      '9px',
    fontWeight:    '700',
    letterSpacing: '0.14em',
    padding:       '4px 9px',
    background:    isStart ? '#2A55F5' : '#16130F',
    color:         '#ffffff',
    border:        '2px solid #16130F',
    boxShadow:     '2px 2px 0 rgba(0,0,0,0.4)',
    cursor:        'default',
    whiteSpace:    'nowrap',
    lineHeight:    '1.2',
  })
  return el
}

const placeMarkers = (mapInst, coordinates) => {
  startMarker.value?.remove()
  endMarker.value?.remove()
  startMarker.value = new mapboxgl.Marker({ element: makeMarkerEl(true),  anchor: 'bottom-left' })
    .setLngLat(coordinates[0])
    .addTo(mapInst)
  endMarker.value = new mapboxgl.Marker({ element: makeMarkerEl(false), anchor: 'bottom-left' })
    .setLngLat(coordinates[coordinates.length - 1])
    .addTo(mapInst)
}

// ── Map init ─────────────────────────────────────────
const initializeMap = () => {
  if (!props.activity.routePolyline) {
    error.value = 'No route data available'
    loading.value = false
    return
  }
  if (!MAPBOX_TOKEN) {
    error.value = 'Map unavailable'
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

    const bounds   = coordinates.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
    const styleDef = MAP_STYLES[currentStyle.value]

    map.value = new mapboxgl.Map({
      container:          mapContainer.value,
      style:              styleDef.url,
      bounds,
      fitBoundsOptions:   { padding: 64 },
      pitch:              0,
      attributionControl: false,
    })

    map.value.on('load', () => {
      const isDark = currentStyle.value === 'dark'
      addSkyAndFog(map.value, isDark)
      if (styleDef.terrain) addTerrain(map.value)
      addRouteLayers(map.value, coordinates)
      placeMarkers(map.value, coordinates)
      loading.value = false

      // BMW-style cinematic camera pitch after route reveals
      setTimeout(() => {
        map.value?.easeTo({ pitch: 28, duration: 1200 })
      }, 500)
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

// ── Controls ─────────────────────────────────────────
const zoomIn  = () => map.value?.zoomIn()
const zoomOut = () => map.value?.zoomOut()

const resetView = () => {
  if (!map.value || !props.activity.routePolyline) return
  const coordinates = decodePolyline(props.activity.routePolyline)
  const bounds = coordinates.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
  map.value.fitBounds(bounds, { padding: 64, pitch: 28, duration: 800 })
}

const toggleMapStyle = () => {
  const idx = STYLE_ORDER.indexOf(currentStyle.value)
  currentStyle.value  = STYLE_ORDER[(idx + 1) % STYLE_ORDER.length]
  if (!map.value) return

  const styleDef  = MAP_STYLES[currentStyle.value]
  const isDark    = currentStyle.value === 'dark'
  map.value.setStyle(styleDef.url)

  map.value.once('style.load', () => {
    addSkyAndFog(map.value, isDark)
    if (styleDef.terrain) addTerrain(map.value)
    else removeTerrain(map.value)

    if (props.activity.routePolyline) {
      const coordinates = decodePolyline(props.activity.routePolyline)
      addRouteLayers(map.value, coordinates)
      placeMarkers(map.value, coordinates)
    }
  })
}

// ── Formatters ────────────────────────────────────────
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
onUnmounted(() => { map.value?.remove() })
watch(() => props.activity, () => {
  map.value?.remove()
  loading.value = true
  error.value   = null
  initializeMap()
})
</script>

<style scoped>
.route-viewer {
  position: relative;
  width: 100%;
}

/* ── Loading ── */
.route-loading,
.route-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  min-height: 300px;
  background: #FBF6EC;
  border: 2px solid #16130F;
  color: #5A5348;
}

.route-loading .bi,
.route-error .bi {
  font-size: 2rem;
  color: #8A8A8A;
}

.rv-loading-text,
.route-error span {
  margin: 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8A8A8A;
}

.rv-spinner {
  width: 28px;
  height: 28px;
  border: 2px solid rgba(22, 19, 15, 0.12);
  border-top-color: #2A55F5;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Map container ── */
.route-container {
  position: relative;
  overflow: hidden;
  border: 2px solid #16130F;
  box-shadow: 4px 4px 0 #16130F;
}

.map-container {
  width: 100%;
  height: v-bind(height);
  min-height: 320px;
}

/* ── Stat strip ── */
.route-stat-strip {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  background: rgba(22, 19, 15, 0.88);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 10px 16px;
  z-index: 2;
  border-top: 1px solid rgba(255,255,255,0.08);
}

.rs-item {
  flex: 1;
  text-align: center;
}

.rs-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.40);
  margin-bottom: 3px;
}

.rs-value {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.05rem;
  font-weight: 900;
  color: #FBF6EC;
  letter-spacing: -0.01em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.rs-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.10);
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
  width: 36px;
  height: 36px;
  background: rgba(251, 246, 236, 0.95);
  border: 2px solid #16130F;
  box-shadow: 2px 2px 0 #16130F;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #16130F;
  transition: background 0.12s, box-shadow 0.12s, transform 0.12s;
}
.control-btn:hover {
  background: #ffffff;
  box-shadow: 3px 3px 0 #16130F;
  transform: translate(-1px, -1px);
}
.control-btn:active {
  box-shadow: 1px 1px 0 #16130F;
  transform: translate(1px, 1px);
}

.style-btn { margin-top: 6px; }

/* ── Style label ── */
.style-label {
  position: absolute;
  top: 12px;
  left: 12px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.75);
  background: rgba(22, 19, 15, 0.60);
  padding: 4px 9px;
  border: 1px solid rgba(255,255,255,0.10);
  z-index: 2;
  pointer-events: none;
  backdrop-filter: blur(4px);
}

/* Hide default Mapbox UI chrome */
:deep(.mapboxgl-ctrl-logo),
:deep(.mapboxgl-ctrl-attrib) { display: none !important; }

@media (max-width: 600px) {
  .rs-label  { font-size: 0.50rem; }
  .rs-value  { font-size: 0.9rem; }
  .route-controls { top: 8px; right: 8px; }
  .style-label    { top: 8px; left: 8px; }
  .control-btn { width: 32px; height: 32px; }
}
</style>
