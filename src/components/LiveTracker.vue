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

    <!-- Draft Recovery Banner -->
    <div v-if="showDraftBanner" class="draft-banner">
      <div class="draft-banner-text">
        <i class="bi bi-clock-history me-2"></i>
        <span>You have an unfinished run from {{ draftAge }}. Resume it?</span>
      </div>
      <div class="draft-banner-actions">
        <button class="draft-btn-resume" type="button" @click="resumeDraft">Resume</button>
        <button class="draft-btn-discard" type="button" @click="discardDraft">Discard</button>
      </div>
    </div>

    <!-- Save error -->
    <div v-if="saveError" class="save-error">
      <i class="bi bi-exclamation-circle me-2"></i>{{ saveError }}
    </div>

    <!-- Post-workout Notes Overlay -->
    <div v-if="showNotesStep" class="notes-overlay" :style="{ paddingBottom: keyboardOffset + 'px' }">
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
        @click="showFinishConfirm = true"
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

    <ConfirmModal
      v-model="showFinishConfirm"
      title="Finish Activity?"
      body="Save this workout and end the session."
      confirm-label="Save & Finish"
      @confirm="stopTracking"
    />

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
import { useToast } from '@/composables/useToast'
import ConfirmModal from '@/components/ConfirmModal.vue'
import axios from 'axios'
import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

// Emits elapsed seconds upward so parent (Track.vue) can feed WorkoutStepGuide
const emit = defineEmits(['elapsed'])

const isNative = Capacitor.isNativePlatform()

const DRAFT_KEY   = 'runnit_tracking_draft'
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
const keyboardOffset   = ref(0)

function syncKeyboard() {
  if (window.visualViewport) {
    keyboardOffset.value = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop)
  }
}

watch(showNotesStep, (open) => {
  if (open && window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncKeyboard)
    window.visualViewport.addEventListener('scroll', syncKeyboard)
    syncKeyboard()
  } else {
    window.visualViewport?.removeEventListener('resize', syncKeyboard)
    window.visualViewport?.removeEventListener('scroll', syncKeyboard)
    keyboardOffset.value = 0
  }
})
const savedActivityId  = ref(null)
const postNotes        = ref('')
const notesSubmitting  = ref(false)

const { isListening: micListening, isSupported: micSupported, toggleListening } = useVoiceNote()
const { showToast } = useToast()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const showFinishConfirm = ref(false)

// Draft recovery state
const showDraftBanner = ref(false)
const draftAge        = ref('')

// Live sharing state
const shareToken   = ref(null)
const isSharing    = ref(false)
const shareUrl     = ref('')
const shareCopied  = ref(false)
let lastShareUpdate = 0

// SOS state
const showSosModal = ref(false)
const sosContacts  = ref([])

let watchId         = null
let timerInterval   = null
let autosaveInterval = null
let startEpoch      = null   // Date.now() at start (adjusted for pauses)
let pausedMs        = 0      // cumulative paused milliseconds

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

const handlePositionError = () => {
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
  } catch {
    // sharing failed silently — user can retry
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
  } catch {
    // SOS contacts failed, list stays empty
  }
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

// ── Draft recovery ────────────────────────────────────────────────────────────

const saveDraft = () => {
  if (!hasStarted.value || routeCoordinates.value.length === 0) return
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({
      coordinates:  routeCoordinates.value,
      elapsedTime:  elapsedTime.value,
      totalDistance: totalDistance.value,
      elevationGain: elevationGain.value,
      sport:        selectedSport.value,
      savedAt:      Date.now(),
    }))
  } catch {}
}

const clearDraft = () => {
  try { localStorage.removeItem(DRAFT_KEY) } catch {}
}

const formatDraftAge = (savedAt) => {
  const mins = Math.floor((Date.now() - savedAt) / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ${mins % 60}m ago`
}

const resumeDraft = () => {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    const draft = JSON.parse(raw)
    routeCoordinates.value = draft.coordinates  || []
    elapsedTime.value      = draft.elapsedTime  || 0
    totalDistance.value    = draft.totalDistance || 0
    elevationGain.value    = draft.elevationGain || 0
    selectedSport.value    = draft.sport        || 'RUN'
    pausedMs               = elapsedTime.value * 1000
    // Redraw saved route on map
    updateRouteOnMap()
  } catch {}
  showDraftBanner.value = false
  // User taps Start to continue
}

const discardDraft = () => {
  clearDraft()
  showDraftBanner.value = false
}

// ── Tracking controls ─────────────────────────────────────────────────────────

const startTracking = async () => {
  gpsError.value = ''
  isTracking.value = true
  hasStarted.value = true
  startEpoch = Date.now() - pausedMs

  if (isNative) {
    // Native: uses OS-level GPS — continues in background when app is minimized
    watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      (position, err) => {
        if (err) { handlePositionError(err); return }
        // Wrap in the same shape as browser GeolocationPosition
        handlePositionUpdate({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            speed: position.coords.speed,
          }
        })
      }
    )
  } else {
    watchId = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  timerInterval = setInterval(() => {
    elapsedTime.value = Math.floor((Date.now() - startEpoch) / 1000)
    // Bubble elapsed time up to Track.vue so WorkoutStepGuide can sync
    emit('elapsed', elapsedTime.value)
  }, 1000)

  // Autosave GPS draft every 30s — survives app crash or phone call
  autosaveInterval = setInterval(saveDraft, 30000)

  // Ensure GeolocateControl is tracking
  if (geolocateControl.value) geolocateControl.value.trigger()
}

const pauseTracking = () => {
  isTracking.value = false
  pausedMs = elapsedTime.value * 1000

  if (watchId !== null) {
    if (isNative) Geolocation.clearWatch({ id: watchId })
    else navigator.geolocation.clearWatch(watchId)
    watchId = null
  }
  clearInterval(timerInterval)
  timerInterval = null
  clearInterval(autosaveInterval)
  autosaveInterval = null
  saveDraft()   // persist immediately on pause
  lastPosition.value = null   // don't connect dots across a pause
}

const resumeTracking = async () => {
  try {
    await startTracking()
  } catch {
    // GPS failed to restart (native permission revoked, etc.)
    isTracking.value = false
    gpsError.value = 'GPS failed to restart. Check permissions and try again.'
    setTimeout(() => { gpsError.value = '' }, 5000)
  }
}

const stopTracking = async () => {
  showFinishConfirm.value = false
  // Fire-and-forget — don't await; waiting inflates elapsedTime by API latency
  stopSharing().catch(() => {})
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
    clearDraft()
    showNotesStep.value = true
  } catch (err) {
    const status = err?.response?.status
    saveError.value = (status === 401 || status === 403)
      ? 'Session expired — log back in and tap Finish to retry.'
      : status === 413
        ? 'Route data too large to upload. Tap Finish to retry.'
        : 'Failed to save. Tap Finish again to retry.'
    saving.value = false
    // Draft preserved in localStorage — no data loss on failure.
    // Tracking stays paused so retries use the same frozen snapshot.
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
    } catch {
      // notes patch is best-effort
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

onMounted(() => {
  initializeMap()

  // Check for crash recovery draft
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (raw) {
      const draft = JSON.parse(raw)
      // Only surface drafts that have actual GPS data and are < 24h old
      const ageMs = Date.now() - (draft.savedAt || 0)
      if (draft.coordinates?.length > 0 && ageMs < 86_400_000) {
        draftAge.value = formatDraftAge(draft.savedAt)
        showDraftBanner.value = true
      } else {
        clearDraft()
      }
    }
  } catch {
    clearDraft()
  }
})

onUnmounted(() => {
  if (watchId !== null) {
    if (isNative) Geolocation.clearWatch({ id: watchId })
    else navigator.geolocation.clearWatch(watchId)
  }
  if (timerInterval) clearInterval(timerInterval)
  if (autosaveInterval) clearInterval(autosaveInterval)
  if (map.value) map.value.remove()
})
</script>

<style scoped>
.live-tracker {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0;
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  background: #FBF6EC;
}

/* ── Header ── */
.tracker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #16130F;
  border-bottom: 2px solid #16130F;
  padding: 14px 20px;
}

.tracker-status {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5A5348;
  flex-shrink: 0;
}

.status-dot.active {
  background: #2A55F5;
  box-shadow: 0 0 0 3px rgba(42, 85, 245, 0.28);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}

.status-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(251,246,236,0.7);
}

.tracker-time {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2.4rem;
  font-weight: 900;
  color: #FBF6EC;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-left: 2px solid #16130F;
  border-right: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
}

.live-stat {
  background: #FBF6EC;
  padding: 16px;
  text-align: center;
  border-right: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
}
.live-stat:nth-child(2n) { border-right: none; }
.live-stat:nth-last-child(-n+2) { border-bottom: none; }

.stat-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #5A5348;
  margin-bottom: 6px;
}

.stat-value {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.6rem;
  font-weight: 900;
  color: #16130F;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* ── Map ── */
.live-map-container {
  position: relative;
  border-left: 2px solid #16130F;
  border-right: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
}

.live-map {
  width: 100%;
  height: 420px;
}

.gps-error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(251,246,236,0.94);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #C0392B;
  text-align: center;
  padding: 20px;
}

.gps-error-overlay i {
  font-size: 2rem;
}

/* ── Sport selector ── */
.sport-selector {
  background: #FBF6EC;
  border-left: 2px solid #16130F;
  border-right: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
  padding: 16px;
}

.sport-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #5A5348;
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
  padding: 10px 8px;
  border: 2px solid #16130F;
  background: #FBF6EC;
  cursor: pointer;
  flex: 1;
  transition: background 0.12s;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
}

.sport-btn:hover {
  background: #E7DFCE;
}

.sport-btn.active {
  background: #2A55F5;
  border-color: #16130F;
  color: #fff;
  box-shadow: 2px 2px 0 #16130F;
}

.sport-emoji { display: none; }

.sport-name {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── Controls ── */
.tracker-controls {
  display: flex;
  gap: 0;
  border-left: 2px solid #16130F;
  border-right: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
}

.control-btn {
  flex: 1;
  height: 56px;
  border: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.15s;
  border-right: 2px solid #16130F;
}
.control-btn:last-child { border-right: none; }

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn-start  {
  background: #2A55F5;
  color: #fff;
  border-radius: 0;
  flex: 2;
}
.control-btn-start:hover:not(:disabled)  { background: #1E42D6; }
.control-btn-pause  { background: #FFC53D; color: #16130F; }
.control-btn-pause:hover  { background: #f0b730; }
.control-btn-finish { background: #C0392B; color: #fff; }
.control-btn-finish:hover:not(:disabled) { background: #a93226; }

/* ── Draft recovery banner ── */
.draft-banner {
  background: #FFC53D;
  border: 2px solid #16130F;
  border-bottom: none;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.draft-banner-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #16130F;
  display: flex;
  align-items: center;
}

.draft-banner-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.draft-btn-resume {
  padding: 7px 16px;
  background: #16130F;
  color: #FBF6EC;
  border: 2px solid #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
}

.draft-btn-discard {
  padding: 7px 16px;
  background: transparent;
  color: #16130F;
  border: 2px solid #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
}

/* ── Save error ── */
.save-error {
  background: #FBF6EC;
  border: 2px solid #C0392B;
  border-bottom: none;
  padding: 12px 16px;
  color: #C0392B;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
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
  border: 2px solid #16130F !important;
}

.me-2 { margin-right: 8px; }

@media (max-width: 480px) {
  .live-map { height: 300px; }
  .tracker-time { font-size: 2rem; }
  .stat-value { font-size: 1.4rem; }
}

/* ── Post-workout Notes Overlay ── */
.notes-overlay {
  position: fixed;
  inset: 0;
  background: #FBF6EC;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 48px 24px 24px;
  overflow-y: auto;
}
.notes-overlay-inner {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.notes-overlay-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #16130F;
  line-height: 0.9;
}
.notes-overlay-sub {
  font-size: 0.9rem;
  color: #5A5348;
  margin: 0;
}
.notes-input-wrap {
  position: relative;
}
.notes-textarea {
  width: 100%;
  border: 2px solid #16130F;
  border-radius: 0;
  background: #fff;
  padding: 12px 12px 40px 12px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  outline: none;
  color: #16130F;
}
.notes-textarea:focus { border-color: #2A55F5; }
.mic-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: 2px solid #16130F;
  border-radius: 50%;
  background: #16130F;
  color: #FBF6EC;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.75rem;
  transition: background 0.15s;
}
.mic-btn:hover { background: #2A55F5; }
.mic-btn--active {
  background: #C0392B;
  border-color: #C0392B;
  animation: mic-pulse 1s ease-in-out infinite;
}
@keyframes mic-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.4); }
  50%       { box-shadow: 0 0 0 6px rgba(192, 57, 43, 0); }
}
.notes-overlay-actions {
  display: flex;
  gap: 0;
  border: 2px solid #16130F;
  margin-top: 4px;
}
.notes-btn-skip {
  flex: 1;
  padding: 14px;
  border: none;
  border-right: 2px solid #16130F;
  background: #FBF6EC;
  color: #5A5348;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background 0.12s;
}
.notes-btn-skip:hover { background: #E7DFCE; }
.notes-btn-done {
  flex: 2;
  padding: 14px;
  border: none;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background 0.15s;
}
.notes-btn-done:hover:not(:disabled) { background: #1E42D6; }
.notes-btn-done:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Live sharing ──────────────────────────────────────────── */
.control-btn-share {
  background: #FBF6EC;
  color: #16130F;
  border: 2px solid #16130F;
  font-size: 0.68rem;
  padding: 0 14px;
  flex: 1;
}
.control-btn-share:hover { background: #E7DFCE; }

.share-banner {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 16px;
  background: #16130F;
  border-top: 3px solid #2A55F5;
  font-size: 12px;
}
.share-live-dot {
  width: 8px; height: 8px; border-radius: 50%; background: #2A55F5;
  animation: live-pulse-dot 1.5s infinite;
  flex-shrink: 0;
}
@keyframes live-pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.share-broadcasting {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700; letter-spacing: 0.12em; color: #2A55F5; text-transform: uppercase;
  font-size: 0.68rem;
}
.share-url { font-size: 11px; color: rgba(251,246,236,0.6); font-family: 'Spline Sans Mono', monospace; }
.share-stop-btn {
  margin-left: auto; background: none; border: none; color: #FBF6EC;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem; font-weight: 700; cursor: pointer; padding: 0;
  text-transform: uppercase; letter-spacing: 0.10em;
  text-decoration: underline;
}

.share-copied-toast {
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%);
  background: #16130F; color: #FBF6EC; padding: 10px 22px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem; font-weight: 700; letter-spacing: 0.10em;
  text-transform: uppercase;
  border: 2px solid #16130F;
  z-index: 9999;
}

/* ── SOS ── */
.sos-btn {
  width: 100%; height: 52px;
  background: #C0392B; color: #fff;
  border: 2px solid #16130F;
  border-top: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.8rem; font-weight: 900;
  text-transform: uppercase; letter-spacing: 0.14em;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background 0.15s;
}
.sos-btn:hover { background: #a93226; }

.sos-overlay {
  position: absolute; inset: 0; background: rgba(22,19,15,0.72);
  z-index: 200; display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.sos-modal {
  background: #FBF6EC;
  border: 2px solid #16130F;
  box-shadow: 5px 5px 0 #16130F;
  width: 100%; max-width: 420px;
  padding: 24px; display: flex; flex-direction: column; gap: 14px;
}
.sos-modal-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.6rem; font-weight: 900; color: #C0392B;
  text-transform: uppercase; letter-spacing: 0.04em; line-height: 0.9;
}
.sos-modal-sub { font-size: 0.85rem; color: #5A5348; margin: 0; }
.sos-no-contacts {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem; color: #5A5348; font-weight: 600;
  background: #E7DFCE; border: 2px solid #16130F; padding: 12px;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.sos-contacts-list { display: flex; flex-direction: column; gap: 0; border: 2px solid #16130F; }
.sos-contact {
  display: flex; gap: 10px; align-items: center;
  padding: 10px 14px; border-bottom: 2px solid #16130F; background: #fff;
}
.sos-contact:last-child { border-bottom: none; }
.sos-contact-name { font-weight: 700; font-size: 0.9rem; color: #16130F; }
.sos-contact-email { font-size: 0.75rem; color: #5A5348; }
.sos-modal-actions { display: flex; gap: 0; border: 2px solid #16130F; margin-top: 4px; }
.sos-cancel-btn {
  flex: 1; height: 48px; border: none; border-right: 2px solid #16130F; background: #FBF6EC;
  color: #5A5348; font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700; font-size: 0.72rem;
  text-transform: uppercase; letter-spacing: 0.10em; cursor: pointer;
  transition: background 0.12s;
}
.sos-cancel-btn:hover { background: #E7DFCE; color: #16130F; }
.sos-confirm-btn {
  flex: 2; height: 48px; background: #C0392B; color: #fff; border: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 900; font-size: 0.78rem;
  text-transform: uppercase; letter-spacing: 0.10em; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.sos-confirm-btn:hover { background: #a93226; }
</style>
