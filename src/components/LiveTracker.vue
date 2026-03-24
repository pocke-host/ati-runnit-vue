<!-- ========== LiveTracker.vue ========== -->
<template>
  <div class="live-tracker">

    <!-- Header -->
    <div class="tracker-header">
      <div class="tracker-status">
        <div :class="['status-dot', { active: isTracking }]"></div>
        <span class="status-label">{{ isTracking ? 'Tracking' : hasStarted ? 'Paused' : 'Ready' }}</span>
      </div>
      <div class="tracker-time">{{ formatDurationClock(elapsedTime) }}</div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="live-stat">
        <div class="stat-label">Distance</div>
        <div class="stat-value">{{ formatDistance(totalDistance) }}</div>
      </div>
      <div class="live-stat">
        <div class="stat-label">Pace</div>
        <div class="stat-value">{{ formatPace(currentPaceMinPerKm) }}</div>
      </div>
      <div class="live-stat">
        <div class="stat-label">Avg Pace</div>
        <div class="stat-value">{{ formatPace(avgPaceMinPerKm) }}</div>
      </div>
      <div class="live-stat">
        <div class="stat-label">Elevation</div>
        <div class="stat-value">{{ formatElevation(elevationGain) }}</div>
      </div>
    </div>

    <!-- Map -->
    <div class="live-map-container">
      <div ref="liveMapContainer" class="live-map"></div>
      <div v-if="gpsError" class="gps-error-overlay">
        <i class="bi bi-geo-alt-fill"></i>
        <p>{{ gpsError }}</p>
      </div>
    </div>

    <!-- Sport Selector (shown before first start) -->
    <div v-if="!hasStarted" class="sport-selector">
      <div class="sport-label">Select sport</div>
      <div class="sport-options">
        <button
          v-for="sport in sports"
          :key="sport.value"
          :class="['sport-btn', { active: selectedSport === sport.value }]"
          @click="selectedSport = sport.value"
          type="button"
        >
          <span class="sport-emoji">{{ sport.emoji }}</span>
          <span class="sport-name">{{ sport.label }}</span>
        </button>
      </div>
    </div>

    <!-- Save error -->
    <div v-if="saveError" class="save-error">
      <i class="bi bi-exclamation-circle me-2"></i>{{ saveError }}
    </div>

    <!-- Post-workout Notes Overlay -->
    <div v-if="showNotesStep" class="notes-overlay">
      <div class="notes-overlay-inner">
        <div class="notes-overlay-title">WORKOUT SAVED</div>
        <p class="notes-overlay-sub">Add a note while it's fresh</p>
        <div class="notes-input-wrap">
          <textarea
            v-model="postNotes"
            class="notes-textarea"
            rows="4"
            placeholder="How did it feel? Any pain? Weather?"
            autofocus
          ></textarea>
          <button
            v-if="micSupported"
            type="button"
            :class="['mic-btn', { 'mic-btn--active': micListening }]"
            @click="toggleListening(t => postNotes = (postNotes ? postNotes + ' ' : '') + t)"
            :title="micListening ? 'Stop recording' : 'Dictate note'"
          >
            <i :class="micListening ? 'bi bi-stop-fill' : 'bi bi-mic-fill'"></i>
          </button>
        </div>
        <div class="notes-overlay-actions">
          <button class="notes-btn-skip" type="button" @click="skipNotes">Skip</button>
          <button class="notes-btn-done" type="button" @click="finishWithNotes" :disabled="notesSubmitting">
            <span v-if="notesSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="tracker-controls">
      <button
        v-if="!isTracking && !hasStarted"
        class="control-btn control-btn-start"
        @click="startTracking"
      >
        <i class="bi bi-play-fill"></i> Start
      </button>

      <button
        v-if="isTracking"
        class="control-btn control-btn-pause"
        @click="pauseTracking"
      >
        <i class="bi bi-pause-fill"></i> Pause
      </button>

      <button
        v-if="!isTracking && hasStarted"
        class="control-btn control-btn-start"
        @click="resumeTracking"
      >
        <i class="bi bi-play-fill"></i> Resume
      </button>

      <button
        v-if="hasStarted"
        class="control-btn control-btn-finish"
        @click="stopTracking"
        :disabled="saving"
      >
        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="bi bi-stop-fill"></i>
        {{ saving ? 'Saving…' : 'Finish' }}
      </button>

      <!-- Share Live button -->
      <button
        v-if="hasStarted && !isSharing"
        class="control-btn control-btn-share"
        @click="startSharing"
      >
        <i class="bi bi-broadcast"></i> Share Live
      </button>
    </div>

    <!-- Broadcasting banner -->
    <div v-if="isSharing" class="share-banner">
      <span class="share-live-dot"></span>
      <span class="share-broadcasting">BROADCASTING</span>
      <span class="share-url" :title="shareUrl">{{ shareUrl.replace('https://', '').slice(0, 32) }}…</span>
      <button class="share-stop-btn" @click="stopSharing">Stop Sharing</button>
    </div>
    <div v-if="shareCopied" class="share-copied-toast">Link copied to clipboard!</div>

    <!-- SOS Button -->
    <button v-if="isTracking" class="sos-btn" @click="showSosModal = true">
      <i class="bi bi-exclamation-triangle-fill me-2"></i>SOS
    </button>

    <!-- SOS Modal -->
    <div v-if="showSosModal" class="sos-overlay">
      <div class="sos-modal">
        <div class="sos-modal-title"><i class="bi bi-exclamation-triangle-fill me-2"></i>SEND SOS ALERT</div>
        <p class="sos-modal-sub">
          This will sound an alert and send an email to your emergency contacts with your current location.
        </p>
        <div v-if="sosContacts.length === 0" class="sos-no-contacts">
          No emergency contacts found. Add contacts in Settings → Safety.
        </div>
        <div v-else class="sos-contacts-list">
          <div v-for="c in sosContacts" :key="c.id" class="sos-contact">
            <span class="sos-contact-name">{{ c.name }}</span>
            <span v-if="c.email" class="sos-contact-email">{{ c.email }}</span>
          </div>
        </div>
        <div class="sos-modal-actions">
          <button class="sos-cancel-btn" @click="showSosModal = false">Cancel</button>
          <button class="sos-confirm-btn" @click="sendSos">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Send SOS
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useUnits } from '@/composables/useUnits'
import { useActivityStore } from '@/stores/activity'
import { useVoiceNote } from '@/composables/useVoiceNote'
import axios from 'axios'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const router = useRouter()
const activityStore = useActivityStore()
const { formatDistance, formatPace, formatElevation, formatDurationClock } = useUnits()

const sports = [
  { value: 'RUN',  emoji: '🏃', label: 'Run'  },
  { value: 'BIKE', emoji: '🚴', label: 'Bike' },
  { value: 'SWIM', emoji: '🏊', label: 'Swim' },
  { value: 'HIKE', emoji: '🥾', label: 'Hike' },
  { value: 'WALK', emoji: '🚶', label: 'Walk' },
]

// State
const selectedSport    = ref('RUN')
const liveMapContainer = ref(null)
const map              = ref(null)
const geolocateControl = ref(null)
const isTracking       = ref(false)
const hasStarted       = ref(false)
const elapsedTime      = ref(0)
const totalDistance    = ref(0)        // metres
const elevationGain    = ref(0)        // metres
const routeCoordinates = ref([])
const lastPosition     = ref(null)     // [lng, lat, timestamp_ms, alt]
const lastPaceUpdate   = ref(null)     // for smoothed current pace
const currentPaceMinPerKm = ref(0)
const saving           = ref(false)
const saveError        = ref('')
const gpsError         = ref('')
const showNotesStep    = ref(false)
const savedActivityId  = ref(null)
const postNotes        = ref('')
const notesSubmitting  = ref(false)

const { isListening: micListening, isSupported: micSupported, toggleListening } = useVoiceNote()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// Live sharing state
const shareToken   = ref(null)
const isSharing    = ref(false)
const shareUrl     = ref('')
const shareCopied  = ref(false)
let lastShareUpdate = 0

// SOS state
const showSosModal = ref(false)
const sosContacts  = ref([])

let watchId       = null
let timerInterval = null
let startEpoch    = null   // Date.now() at start (adjusted for pauses)
let pausedMs      = 0      // cumulative paused milliseconds

// ── Computed ────────────────────────────────────────────────────────────────

const avgPaceMinPerKm = computed(() => {
  if (totalDistance.value < 10 || elapsedTime.value === 0) return 0
  return (elapsedTime.value / 60) / (totalDistance.value / 1000)
})

// ── Map ─────────────────────────────────────────────────────────────────────

const initializeMap = () => {
  if (!MAPBOX_TOKEN) {
    gpsError.value = 'Mapbox token missing'
    return
  }

  mapboxgl.accessToken = MAPBOX_TOKEN

  // Use last known position from localStorage, fall back to continental US center
  const savedLng = parseFloat(localStorage.getItem('lastLng') || '-98.5')
  const savedLat = parseFloat(localStorage.getItem('lastLat') || '39.5')

  map.value = new mapboxgl.Map({
    container: liveMapContainer.value,
    style: 'mapbox://styles/quinn-runnit/cmml6ynyy000701suetifc5y0',
    zoom: savedLng === -98.5 ? 3.5 : 13,
    center: [savedLng, savedLat],
    attributionControl: false,
  })

  // Native GPS control — shows pulsing blue dot + heading cone + follows user
  const geo = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: true,
    showUserHeading: true,
    showAccuracyCircle: true,
  })
  geolocateControl.value = geo
  map.value.addControl(geo, 'top-right')
  map.value.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')

  geo.on('error', () => {
    gpsError.value = 'Location access denied. Enable GPS and reload.'
  })

  map.value.on('load', () => {
    // Route source
    map.value.addSource('route', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } },
    })

    // White halo — lifts the route off the map (Strava style)
    map.value.addLayer({
      id: 'route-halo',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#FFFFFF', 'line-width': 7, 'line-opacity': 1 },
    })

    // Signal lime route line
    map.value.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#0052FF', 'line-width': 4 },
    })

    // Start marker circle
    map.value.addSource('start-point', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })
    map.value.addLayer({
      id: 'start-point',
      type: 'circle',
      source: 'start-point',
      paint: {
        'circle-radius': 7,
        'circle-color': '#0052FF',
        'circle-stroke-width': 2.5,
        'circle-stroke-color': '#000',
      },
    })

    // Don't auto-trigger GPS — user must click Start to enable tracking
  })
}

const updateRouteOnMap = () => {
  if (!map.value || !map.value.getSource('route')) return
  map.value.getSource('route').setData({
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: routeCoordinates.value },
  })
}

// ── GPS position handler ─────────────────────────────────────────────────────

const handlePositionUpdate = (position) => {
  if (!isTracking.value) return

  const { latitude, longitude, altitude, speed } = position.coords
  const now = Date.now()
  const newCoord = [longitude, latitude]

  if (lastPosition.value) {
    const [prevLng, prevLat, prevTime, prevAlt] = lastPosition.value
    const dist = haversine(prevLat, prevLng, latitude, longitude)

    // Only accept realistic movement (filter GPS jitter < 2 m)
    if (dist > 2) {
      totalDistance.value += dist

      // Elevation gain
      if (prevAlt != null && altitude != null && altitude > prevAlt) {
        elevationGain.value += altitude - prevAlt
      }

      // Current pace — use device speed if available, else derive from segment
      if (speed != null && speed > 0) {
        // speed is m/s → convert to min/km
        currentPaceMinPerKm.value = 1000 / speed / 60
      } else {
        const segTimeMins = (now - prevTime) / 60000
        const segDistKm   = dist / 1000
        currentPaceMinPerKm.value = segDistKm > 0 ? segTimeMins / segDistKm : currentPaceMinPerKm.value
      }

      routeCoordinates.value.push(newCoord)
      updateRouteOnMap()
    }
  } else {
    // First point — persist location for next session map center
    localStorage.setItem('lastLng', longitude)
    localStorage.setItem('lastLat', latitude)
    // Drop the start marker
    routeCoordinates.value.push(newCoord)
    if (map.value && map.value.getSource('start-point')) {
      map.value.getSource('start-point').setData({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: newCoord } }],
      })
    }
  }

  lastPosition.value = [longitude, latitude, now, altitude]
  pushShareUpdate(latitude, longitude)
}

const handlePositionError = (err) => {
  console.warn('GPS error', err)
  gpsError.value = 'GPS signal lost — move to an open area.'
  setTimeout(() => { gpsError.value = '' }, 4000)
}

// ── Live sharing ──────────────────────────────────────────────────────────────

const startSharing = async () => {
  try {
    const { data } = await axios.post(`${API_URL}/live-shares`, { sportType: selectedSport.value })
    shareToken.value = data.token
    shareUrl.value   = data.shareUrl
    isSharing.value  = true
    lastShareUpdate  = 0
    try { await navigator.clipboard.writeText(data.shareUrl) } catch {}
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 3000)
  } catch (e) {
    console.error('startSharing error', e)
  }
}

const stopSharing = async () => {
  if (!shareToken.value) return
  try { await axios.delete(`${API_URL}/live-shares/${shareToken.value}`) } catch {}
  isSharing.value = false
  shareToken.value = null
  shareUrl.value   = ''
}

const pushShareUpdate = (lat, lng) => {
  if (!isSharing.value || !shareToken.value) return
  const now = Date.now()
  if (now - lastShareUpdate < 5000) return
  lastShareUpdate = now
  axios.patch(`${API_URL}/live-shares/${shareToken.value}`, {
    lat,
    lng,
    elapsedSeconds: elapsedTime.value,
    distanceMeters: Math.round(totalDistance.value),
  }).catch(() => {})
}

// ── SOS ───────────────────────────────────────────────────────────────────────

const fetchContacts = async () => {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get(`${API_URL}/emergency-contacts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    sosContacts.value = data
  } catch {}
}

watch(isTracking, (val) => {
  if (val && sosContacts.value.length === 0) fetchContacts()
})

const sendSos = async () => {
  showSosModal.value = false

  // 1. Beep
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 1)
  } catch {}

  // 2. Build mailto
  const pos = lastPosition.value
  const locationText = pos
    ? `My current location: https://maps.google.com/?q=${pos[1]},${pos[0]}`
    : 'Location unavailable'
  const shareText = isSharing.value && shareUrl.value
    ? `\nLive tracking: ${shareUrl.value}`
    : ''
  const body = `EMERGENCY ALERT from Runnit\n\nI need help!\n\n${locationText}${shareText}\n\nSent via Runnit SOS`
  const subject = 'EMERGENCY: SOS Alert from Runnit'

  const emailAddresses = sosContacts.value.filter(c => c.email).map(c => c.email)
  if (emailAddresses.length > 0) {
    const mailto = `mailto:${emailAddresses.join(',')}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailto)
  }

  // 3. Log SOS event (fire-and-forget)
  const token = localStorage.getItem('token')
  axios.post(`${API_URL}/sos-events`, {
    lat: pos?.[1] ?? null,
    lng: pos?.[0] ?? null,
    shareUrl: isSharing.value ? shareUrl.value : null,
  }, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
}

// ── Tracking controls ─────────────────────────────────────────────────────────

const startTracking = () => {
  gpsError.value = ''
  isTracking.value = true
  hasStarted.value = true
  startEpoch = Date.now() - pausedMs

  watchId = navigator.geolocation.watchPosition(
    handlePositionUpdate,
    handlePositionError,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )

  timerInterval = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startEpoch) / 1000)
  }, 1000)

  // Ensure GeolocateControl is tracking
  if (geolocateControl.value) geolocateControl.value.trigger()
}

const pauseTracking = () => {
  isTracking.value = false
  pausedMs = elapsedTime.value * 1000

  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  clearInterval(timerInterval)
  timerInterval = null
  lastPosition.value = null   // don't connect dots across a pause
}

const resumeTracking = () => {
  startTracking()
}

const stopTracking = async () => {
  if (!confirm('Finish this activity?')) return
  await stopSharing()
  pauseTracking()
  saving.value = true
  saveError.value = ''

  try {
    const activity = await activityStore.createActivity({
      sportType: selectedSport.value,
      durationSeconds: elapsedTime.value,
      distanceMeters: Math.round(totalDistance.value),
      elevationGain: Math.round(elevationGain.value),
      routePolyline: routeCoordinates.value.length ? encodePolyline(routeCoordinates.value) : null,
    })
    savedActivityId.value = activity?.id ?? null
    saving.value = false
    showNotesStep.value = true
  } catch (err) {
    console.error('Save failed:', err)
    saveError.value = 'Failed to save. Tap Finish again to retry.'
    saving.value = false
    startTracking()
  }
}

async function finishWithNotes() {
  if (notesSubmitting.value) return
  if (postNotes.value.trim() && savedActivityId.value) {
    notesSubmitting.value = true
    try {
      const token = localStorage.getItem('token')
      await axios.patch(
        `${API_URL}/activities/${savedActivityId.value}`,
        { notes: postNotes.value.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (e) {
      console.warn('[LiveTracker] notes patch failed:', e)
    } finally {
      notesSubmitting.value = false
    }
  }
  router.push('/dashboard')
}

function skipNotes() {
  router.push('/dashboard')
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const encodePolyline = (coords) => {
  let out = '', lat = 0, lng = 0
  for (const [lo, la] of coords) {
    const dLat = Math.round(la * 1e5) - lat
    const dLng = Math.round(lo * 1e5) - lng
    lat = Math.round(la * 1e5)
    lng = Math.round(lo * 1e5)
    out += encodeVal(dLat) + encodeVal(dLng)
  }
  return out
}
const encodeVal = (v) => {
  let n = v < 0 ? ~(v << 1) : v << 1, s = ''
  while (n >= 0x20) { s += String.fromCharCode((0x20 | (n & 0x1f)) + 63); n >>= 5 }
  return s + String.fromCharCode(n + 63)
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(initializeMap)

onUnmounted(() => {
  if (watchId !== null) navigator.geolocation.clearWatch(watchId)
  if (timerInterval) clearInterval(timerInterval)
  if (map.value) map.value.remove()
})
</script>

<style scoped>
.live-tracker {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;
  font-family: "Futura PT", "Futura", "Century Gothic", sans-serif;
}

/* ── Header ── */
.tracker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border: 1px solid #E5E5E5;
  padding: 14px 20px;
}

.tracker-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #CCCCCC;
  flex-shrink: 0;
}

.status-dot.active {
  background: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

.status-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: #767676;
}

.tracker-time {
  font-size: 2rem;
  font-weight: 900;
  color: #000;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}

.live-stat {
  background: #fff;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: #767676;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 900;
  color: #000;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
}

/* ── Map ── */
.live-map-container {
  position: relative;
  border: 1px solid #E5E5E5;
}

.live-map {
  width: 100%;
  height: 420px;
}

.gps-error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #dc2626;
  text-align: center;
  padding: 20px;
}

.gps-error-overlay i {
  font-size: 2rem;
}

/* ── Sport selector ── */
.sport-selector {
  background: #fff;
  border: 1px solid #E5E5E5;
  padding: 16px;
}

.sport-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: #767676;
  margin-bottom: 12px;
}

.sport-options {
  display: flex;
  gap: 8px;
}

.sport-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #E5E5E5;
  background: #fff;
  cursor: pointer;
  flex: 1;
  transition: border-color 0.15s, background 0.15s;
}

.sport-btn:hover {
  border-color: #000;
}

.sport-btn.active {
  background: #000;
  border-color: #000;
  color: #fff;
}

.sport-emoji { font-size: 1.4rem; line-height: 1; }

.sport-name {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ── Controls ── */
.tracker-controls {
  display: flex;
  gap: 8px;
}

.control-btn {
  flex: 1;
  height: 52px;
  border: none;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn-start  { background: #0052FF; color: #fff; }
.control-btn-start:hover:not(:disabled)  { background: #003ECC; }
.control-btn-pause  { background: #555; color: #fff; }
.control-btn-pause:hover  { background: #333; }
.control-btn-finish { background: #dc2626; color: #fff; }
.control-btn-finish:hover:not(:disabled) { background: #b91c1c; }

/* ── Save error ── */
.save-error {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  padding: 12px 16px;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
}

/* ── Mapbox control overrides ── */
:deep(.mapboxgl-ctrl-geolocate) {
  border-radius: 0 !important;
}
:deep(.mapboxgl-ctrl-zoom-in),
:deep(.mapboxgl-ctrl-zoom-out),
:deep(.mapboxgl-ctrl-compass) {
  border-radius: 0 !important;
}
:deep(.mapboxgl-ctrl-group) {
  border-radius: 0 !important;
  box-shadow: none !important;
  border: 1px solid #E5E5E5 !important;
}

.me-2 { margin-right: 8px; }

@media (max-width: 480px) {
  .live-map { height: 320px; }
  .tracker-time { font-size: 1.6rem; }
  .stat-value { font-size: 1.1rem; }
}

/* ── Post-workout Notes Overlay ── */
.notes-overlay {
  position: absolute;
  inset: 0;
  background: #fff;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.notes-overlay-inner {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.notes-overlay-title {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: 0.10em;
  color: #000;
}
.notes-overlay-sub {
  font-size: 0.85rem;
  color: #767676;
  margin: 0;
}
.notes-input-wrap {
  position: relative;
}
.notes-textarea {
  width: 100%;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 10px 12px 36px 12px;
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  outline: none;
}
.notes-textarea:focus { border-color: #000; }
.mic-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #000;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.2s;
}
.mic-btn:hover { background: #333; }
.mic-btn--active {
  background: #ef4444;
  animation: mic-pulse 1s ease-in-out infinite;
}
@keyframes mic-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}
.notes-overlay-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.notes-btn-skip {
  flex: 1;
  padding: 12px;
  border: 1px solid #E5E5E5;
  background: #fff;
  color: #767676;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
}
.notes-btn-done {
  flex: 2;
  padding: 12px;
  border: none;
  background: #000;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
}
.notes-btn-done:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Live sharing ──────────────────────────────────────────── */
.control-btn-share {
  background: #4f46e5; color: #fff; font-size: 0.8rem; padding: 10px 14px;
}
.control-btn-share:hover { background: #4338ca; }

.share-banner {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 8px 16px; background: #ecfdf5; border-top: 2px solid #22c55e;
  font-size: 12px;
}
.share-live-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
  animation: live-pulse-dot 1.5s infinite;
  flex-shrink: 0;
}
@keyframes live-pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.share-broadcasting { font-weight: 800; letter-spacing: 0.10em; color: #166534; text-transform: uppercase; }
.share-url { font-size: 11px; color: #555; font-family: monospace; }
.share-stop-btn {
  margin-left: auto; background: none; border: none; color: #dc2626;
  font-size: 12px; font-weight: 700; cursor: pointer; padding: 0; font-family: inherit;
  text-decoration: underline;
}

.share-copied-toast {
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
  background: #000; color: #fff; padding: 8px 20px;
  font-size: 13px; font-weight: 700; letter-spacing: 0.08em;
  z-index: 9999;
}

/* ── SOS ── */
.sos-btn {
  width: 100%; height: 52px;
  background: #dc2626; color: #fff; border: none;
  font-family: inherit; font-size: 0.9rem; font-weight: 900;
  text-transform: uppercase; letter-spacing: 0.14em;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.sos-btn:hover { background: #b91c1c; }

.sos-overlay {
  position: absolute; inset: 0; background: rgba(0,0,0,0.65);
  z-index: 200; display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.sos-modal {
  background: #fff; width: 100%; max-width: 420px;
  padding: 24px; display: flex; flex-direction: column; gap: 14px;
}
.sos-modal-title {
  font-size: 1rem; font-weight: 900; color: #dc2626;
  text-transform: uppercase; letter-spacing: 0.10em;
}
.sos-modal-sub { font-size: 0.85rem; color: #767676; margin: 0; }
.sos-no-contacts {
  font-size: 0.82rem; color: #767676;
  background: #fafafa; border: 1px solid #E5E5E5; padding: 12px;
}
.sos-contacts-list { display: flex; flex-direction: column; gap: 6px; }
.sos-contact {
  display: flex; gap: 10px; align-items: center;
  padding: 8px 12px; border: 1px solid #E5E5E5; background: #fafafa;
}
.sos-contact-name { font-weight: 700; font-size: 0.88rem; color: #000; }
.sos-contact-email { font-size: 0.78rem; color: #767676; }
.sos-modal-actions { display: flex; gap: 10px; margin-top: 4px; }
.sos-cancel-btn {
  flex: 1; height: 44px; border: 1px solid #E5E5E5; background: #fff;
  color: #767676; font-family: inherit; font-weight: 700; font-size: 0.82rem;
  text-transform: uppercase; letter-spacing: 0.10em; cursor: pointer;
}
.sos-cancel-btn:hover { background: #f5f5f5; color: #000; }
.sos-confirm-btn {
  flex: 2; height: 44px; background: #dc2626; color: #fff; border: none;
  font-family: inherit; font-weight: 900; font-size: 0.88rem;
  text-transform: uppercase; letter-spacing: 0.10em; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.sos-confirm-btn:hover { background: #b91c1c; }
</style>
