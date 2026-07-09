<!-- ========== LiveTracker.vue ========== -->
<template>
  <div
    class="lt-wrap"
    :class="{
      'lt--recording': isTracking,
      'lt--paused': !isTracking && hasStarted,
      'lt--ready': !hasStarted
    }"
  >

    <!-- ── RECORDING STATUS BAR (top, cobalt) ── -->
    <div v-if="hasStarted" class="lt-status-bar" :class="{ 'lt-status-bar--paused': !isTracking }">
      <div class="lt-status-left">
        <span class="lt-rec-dot" :class="{ active: isTracking }"></span>
        <span class="lt-status-text">{{ isTracking ? 'Recording' : 'Paused' }} · {{ selectedSport }}</span>
      </div>
      <div class="lt-gps-signal">
        <span :style="{ opacity: 1 }">●</span>
        <span :style="{ opacity: 0.6 }">●</span>
        <span :style="{ opacity: 0.3 }">●</span>
      </div>
    </div>

    <!-- ── TIMER ── -->
    <div v-if="hasStarted" class="lt-timer-block" :class="{ 'lt-timer-block--dim': !isTracking }">
      <div class="lt-timer">{{ formatDurationClock(elapsedTime) }}</div>
    </div>

    <!-- ── 3-UP STATS (recording/paused) ── -->
    <div v-if="hasStarted" class="lt-stats-row">
      <div class="lt-stat">
        <div class="lt-stat-label">DIST</div>
        <div class="lt-stat-val">{{ formatDistance(totalDistance) }}</div>
      </div>
      <div class="lt-stat lt-stat--pace">
        <div class="lt-stat-label">PACE</div>
        <div class="lt-stat-val">{{ formatPace(currentPaceMinPerKm) }}</div>
      </div>
      <div class="lt-stat">
        <div class="lt-stat-label">ELEV</div>
        <div class="lt-stat-val">{{ formatElevation(elevationGain) }}</div>
      </div>
    </div>

    <!-- ── MAP ── -->
    <div class="lt-map-wrap">
      <!-- GPS locked chip shown in ready state -->
      <div v-if="!hasStarted" class="lt-gps-chip">
        <span class="lt-gps-dot"></span>GPS Locked
      </div>
      <div ref="liveMapContainer" class="live-map"></div>
      <div v-if="gpsError" class="lt-gps-error">
        <i class="bi bi-geo-alt-fill"></i>
        <p>{{ gpsError }}</p>
      </div>
    </div>

    <!-- ── BOTTOM SHEET ── -->
    <div class="lt-sheet">

      <!-- Draft recovery banner (inside sheet) -->
      <div v-if="showDraftBanner" class="lt-draft-banner">
        <span>Unfinished session from {{ draftAge }}.</span>
        <div class="lt-draft-actions">
          <button class="lt-draft-resume" type="button" @click="resumeDraft">Resume</button>
          <button class="lt-draft-discard" type="button" @click="discardDraft">Discard</button>
        </div>
      </div>

      <!-- Save error -->
      <div v-if="saveError" class="lt-save-error">{{ saveError }}</div>

      <!-- READY: sport pills + start -->
      <template v-if="!hasStarted">
        <div class="lt-sport-label">Select sport</div>
        <div class="lt-sport-scroll">
          <button
            v-for="sport in sports"
            :key="sport.value"
            :class="['lt-sport-pill', { 'lt-sport-pill--active': selectedSport === sport.value }]"
            @click="selectedSport = sport.value"
            type="button"
          >{{ sport.label }}</button>
        </div>
        <div class="lt-start-row">
          <div class="lt-side-tile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <button class="lt-start-btn" @click="startTracking" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <div class="lt-side-tile">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="22" height="22"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
          </div>
        </div>
      </template>

      <!-- RECORDING: Lap / Stop / Pause -->
      <template v-if="isTracking">
        <div class="lt-rec-controls">
          <button class="lt-ctrl-btn lt-ctrl-lap" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Lap</span>
          </button>
          <button
            class="lt-ctrl-btn lt-ctrl-stop"
            @click="showFinishConfirm = true"
            :disabled="saving"
            type="button"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm"></span>
            <svg v-else viewBox="0 0 24 24" fill="currentColor" width="26" height="26"><rect x="3" y="3" width="18" height="18"/></svg>
          </button>
          <button class="lt-ctrl-btn lt-ctrl-pause" @click="pauseTracking" type="button">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            <span>Pause</span>
          </button>
        </div>
        <!-- Share live -->
        <button v-if="!isSharing" class="lt-share-live-btn" @click="startSharing" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 6c0-1.7 3.1-3 7-3s7 1.3 7 3"/><path d="M1 6v4c0 1.7 3.1 3 7 3"/><ellipse cx="8" cy="6" rx="7" ry="3"/><path d="M22.5 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/><path d="M18 12h4.5"/><path d="M20.5 9.5l2 2.5-2 2.5"/></svg>
          Share Live
        </button>
      </template>

      <!-- PAUSED: Resume / Finish -->
      <template v-if="!isTracking && hasStarted">
        <div class="lt-pause-controls">
          <button class="lt-btn-resume" @click="resumeTracking" type="button">Resume</button>
          <button
            class="lt-btn-finish"
            @click="showFinishConfirm = true"
            :disabled="saving"
            type="button"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            {{ saving ? 'Saving…' : 'Finish' }}
          </button>
        </div>
        <button class="lt-btn-discard" @click="discardDraft" type="button">Discard Activity</button>
        <!-- Share live (paused) -->
        <button v-if="!isSharing" class="lt-share-live-btn" @click="startSharing" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M1 6c0-1.7 3.1-3 7-3s7 1.3 7 3"/><path d="M1 6v4c0 1.7 3.1 3 7 3"/><ellipse cx="8" cy="6" rx="7" ry="3"/><path d="M22.5 12.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z"/><path d="M18 12h4.5"/><path d="M20.5 9.5l2 2.5-2 2.5"/></svg>
          Share Live
        </button>
      </template>

    </div><!-- /.lt-sheet -->

    <!-- Broadcasting banner -->
    <div v-if="isSharing" class="lt-share-banner">
      <span class="lt-share-dot"></span>
      <span class="lt-share-broadcasting">BROADCASTING</span>
      <span class="lt-share-url" :title="shareUrl">{{ shareUrl.replace('https://', '').slice(0, 32) }}…</span>
      <button class="lt-share-stop" @click="stopSharing" type="button">Stop</button>
    </div>
    <div v-if="shareCopied" class="lt-share-toast">Link copied!</div>

    <!-- Post-workout Notes Overlay -->
    <div v-if="showNotesStep" class="lt-notes-overlay" :style="{ paddingBottom: keyboardOffset + 'px' }">
      <div class="lt-notes-inner">
        <div class="lt-notes-title">WORKOUT SAVED</div>
        <p class="lt-notes-sub">Add a note while it's fresh</p>
        <div class="lt-notes-input-wrap">
          <textarea
            v-model="postNotes"
            class="lt-notes-textarea"
            rows="4"
            placeholder="How did it feel? Any pain? Weather?"
            autofocus
          ></textarea>
          <button
            v-if="micSupported"
            type="button"
            :class="['lt-mic-btn', { 'lt-mic-btn--active': micListening }]"
            @click="toggleListening(t => postNotes = (postNotes ? postNotes + ' ' : '') + t)"
          >
            <i :class="micListening ? 'bi bi-stop-fill' : 'bi bi-mic-fill'"></i>
          </button>
        </div>
        <div class="lt-notes-actions">
          <button class="lt-notes-skip" type="button" @click="skipNotes">Skip</button>
          <button class="lt-notes-done" type="button" @click="finishWithNotes" :disabled="notesSubmitting">
            <span v-if="notesSubmitting" class="spinner-border spinner-border-sm me-1"></span>
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Finish Modal -->
    <ConfirmModal
      v-model="showFinishConfirm"
      title="Finish Activity?"
      body="Save this workout and end the session."
      confirm-label="Save & Finish"
      @confirm="stopTracking"
    />

    <!-- SOS Button -->
    <button v-if="isTracking" class="lt-sos-btn" @click="showSosModal = true" type="button">SOS</button>

    <!-- SOS Modal -->
    <div v-if="showSosModal" class="lt-sos-overlay">
      <div class="lt-sos-modal">
        <div class="lt-sos-title">SEND SOS ALERT</div>
        <p class="lt-sos-sub">This will sound an alert and share your location with emergency contacts.</p>
        <div v-if="sosContacts.length === 0" class="lt-sos-no-contacts">
          No emergency contacts found. Add contacts in Settings → Safety.
        </div>
        <div v-else class="lt-sos-list">
          <div v-for="c in sosContacts" :key="c.id" class="lt-sos-contact">
            <span class="lt-sos-contact-name">{{ c.name }}</span>
            <span v-if="c.email" class="lt-sos-contact-email">{{ c.email }}</span>
          </div>
        </div>
        <div class="lt-sos-actions">
          <button class="lt-sos-cancel" type="button" @click="showSosModal = false">Cancel</button>
          <button class="lt-sos-confirm" type="button" @click="sendSos">Send SOS</button>
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
/* ── WRAP ─────────────────────────────────────────────────────────── */
.lt-wrap {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #16130F;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #FBF6EC;
  position: relative;
}

/* ── STATUS BAR ─────────────────────────────────────────────────────── */
.lt-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #2A55F5;
  padding: 10px 20px;
  flex-shrink: 0;
}
.lt-status-bar--paused {
  background: #FFC53D;
}
.lt-status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.lt-rec-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: rgba(251,246,236,0.5);
  flex-shrink: 0;
}
.lt-rec-dot.active {
  background: #FBF6EC;
  animation: ltBlink 0.9s ease-in-out infinite;
}
.lt-status-bar--paused .lt-rec-dot { background: #16130F; }
.lt-status-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #FBF6EC;
}
.lt-status-bar--paused .lt-status-text { color: #16130F; }
.lt-gps-signal {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: rgba(251,246,236,0.9);
  display: flex;
  gap: 2px;
}

/* ── TIMER ──────────────────────────────────────────────────────────── */
.lt-timer-block {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 24px 12px;
  flex-shrink: 0;
}
.lt-timer-block--dim .lt-timer {
  opacity: 0.45;
}
.lt-timer {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(64px, 18vw, 96px);
  line-height: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  color: #FBF6EC;
}

/* ── 3-UP STATS ─────────────────────────────────────────────────────── */
.lt-stats-row {
  display: flex;
  border-top: 2px solid rgba(251,246,236,0.12);
  border-bottom: 2px solid rgba(251,246,236,0.12);
  flex-shrink: 0;
}
.lt-stat {
  flex: 1;
  padding: 14px 12px;
  text-align: center;
  border-right: 2px solid rgba(251,246,236,0.12);
}
.lt-stat:last-child { border-right: none; }
.lt-stat-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.5);
  margin-bottom: 4px;
}
.lt-stat-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(24px, 6vw, 32px);
  line-height: 0.9;
  font-variant-numeric: tabular-nums;
  color: #FBF6EC;
}
.lt-stat--pace .lt-stat-val {
  color: #FFC53D;
}

/* ── MAP ────────────────────────────────────────────────────────────── */
.lt-map-wrap {
  position: relative;
  flex: 1;
  min-height: 180px;
}
.live-map {
  width: 100%;
  height: 100%;
  min-height: 180px;
}

/* GPS locked chip (ready state) */
.lt-gps-chip {
  position: absolute;
  top: 14px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 2px solid #2A55F5;
  background: rgba(22,19,15,0.85);
  color: #FBF6EC;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 7px 14px;
  white-space: nowrap;
}
.lt-gps-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #2A55F5;
  flex-shrink: 0;
  animation: ltBlink 1.2s ease-in-out infinite;
}
.lt-gps-error {
  position: absolute;
  inset: 0;
  background: rgba(22,19,15,0.88);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #C0392B;
  font-size: 0.88rem;
  font-weight: 600;
  text-align: center;
  padding: 20px;
}
.lt-gps-error i { font-size: 1.8rem; }
.lt-gps-error p { margin: 0; }

/* ── BOTTOM SHEET ───────────────────────────────────────────────────── */
.lt-sheet {
  background: #FBF6EC;
  border-top: 3px solid #2A55F5;
  padding: 20px 20px 28px;
  color: #16130F;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Draft banner */
.lt-draft-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  background: #FFF3D6;
  border: 2px solid #16130F;
  padding: 10px 14px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #16130F;
}
.lt-draft-actions { display: flex; gap: 8px; }
.lt-draft-resume {
  padding: 6px 14px;
  background: #16130F;
  color: #FBF6EC;
  border: 2px solid #16130F;
  font-family: inherit;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
}
.lt-draft-discard {
  padding: 6px 14px;
  background: transparent;
  color: #5A5348;
  border: 2px solid #E7DFCE;
  font-family: inherit;
  font-size: 0.66rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
}

/* Save error */
.lt-save-error {
  background: #FEF2F2;
  border: 2px solid #C0392B;
  padding: 10px 14px;
  color: #C0392B;
  font-size: 0.82rem;
  font-weight: 600;
}

/* ── SPORT SELECTOR ─────────────────────────────────────────────────── */
.lt-sport-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5A5348;
}
.lt-sport-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-bottom: 2px;
}
.lt-sport-scroll::-webkit-scrollbar { display: none; }
.lt-sport-pill {
  flex-shrink: 0;
  padding: 9px 18px;
  border: 2px solid #16130F;
  border-radius: 999px;
  background: transparent;
  color: #16130F;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.82rem;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  min-height: 44px;
}
.lt-sport-pill:hover { background: rgba(22,19,15,0.06); }
.lt-sport-pill--active {
  background: #2A55F5;
  border-color: #2A55F5;
  color: #fff;
  box-shadow: 3px 3px 0 #16130F;
}

/* ── START ROW ──────────────────────────────────────────────────────── */
.lt-start-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.lt-side-tile {
  width: 52px;
  height: 52px;
  border: 2px solid #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5A5348;
  cursor: pointer;
}
.lt-start-btn {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  border: 3px solid #16130F;
  background: #2A55F5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 4px 4px 0 #16130F;
  transition: background 0.15s, box-shadow 0.1s;
  min-height: 72px;
}
.lt-start-btn:hover { background: #1E42D6; }
.lt-start-btn:active { box-shadow: 2px 2px 0 #16130F; transform: translate(2px, 2px); }

/* ── RECORDING CONTROLS ─────────────────────────────────────────────── */
.lt-rec-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.lt-ctrl-btn {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  border: 3px solid #16130F;
  background: #FBF6EC;
  color: #16130F;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  box-shadow: 3px 3px 0 #16130F;
  transition: opacity 0.15s;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  min-height: 60px;
}
.lt-ctrl-btn:hover { opacity: 0.85; }
.lt-ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.lt-ctrl-stop {
  width: 76px;
  height: 76px;
  background: #C0392B;
  border-color: #16130F;
  color: #fff;
  box-shadow: 4px 4px 0 #16130F;
}
.lt-ctrl-pause { background: #16130F; color: #FBF6EC; }

/* Share live */
.lt-share-live-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  border: 2px solid #16130F;
  background: transparent;
  color: #5A5348;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
  min-height: 40px;
}
.lt-share-live-btn:hover { background: rgba(22,19,15,0.06); color: #16130F; }

/* ── PAUSED CONTROLS ────────────────────────────────────────────────── */
.lt-pause-controls {
  display: flex;
  gap: 12px;
}
.lt-btn-resume {
  flex: 1;
  height: 52px;
  border-radius: 999px;
  border: 2px solid #16130F;
  background: #2A55F5;
  color: #fff;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 3px 3px 0 #16130F;
  transition: background 0.15s;
  min-height: 52px;
}
.lt-btn-resume:hover { background: #1E42D6; }
.lt-btn-finish {
  flex: 1;
  height: 52px;
  border-radius: 999px;
  border: 2px solid #16130F;
  background: #16130F;
  color: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 3px 3px 0 #5A5348;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 52px;
}
.lt-btn-finish:disabled { opacity: 0.5; cursor: not-allowed; }
.lt-btn-discard {
  background: none;
  border: none;
  color: #C0392B;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-align: center;
  padding: 4px;
}

/* ── BROADCASTING BANNER ────────────────────────────────────────────── */
.lt-share-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px 16px;
  background: #FBF6EC;
  border-top: 2px solid #2A55F5;
  font-size: 0.7rem;
  color: #16130F;
}
.lt-share-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #2A55F5;
  flex-shrink: 0;
  animation: ltBlink 1.4s infinite;
}
.lt-share-broadcasting {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #2A55F5;
}
.lt-share-url {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  color: #5A5348;
  flex: 1;
}
.lt-share-stop {
  margin-left: auto;
  background: none;
  border: none;
  color: #C0392B;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  text-decoration: underline;
}

.lt-share-toast {
  position: fixed;
  bottom: 88px;
  left: 50%;
  transform: translateX(-50%);
  background: #16130F;
  color: #FBF6EC;
  padding: 8px 20px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  z-index: 9999;
}

/* ── NOTES OVERLAY ──────────────────────────────────────────────────── */
.lt-notes-overlay {
  position: fixed;
  inset: 0;
  background: #FBF6EC;
  z-index: 100;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 56px 24px 24px;
  overflow-y: auto;
  color: #16130F;
}
.lt-notes-inner {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.lt-notes-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 2rem;
  line-height: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  color: #16130F;
}
.lt-notes-sub {
  font-size: 0.88rem;
  color: #5A5348;
  margin: 0;
}
.lt-notes-input-wrap { position: relative; }
.lt-notes-textarea {
  width: 100%;
  border: 2px solid #16130F;
  border-radius: 0;
  padding: 12px 12px 40px 12px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 110px;
  background: #fff;
  outline: none;
  color: #16130F;
}
.lt-notes-textarea:focus { border-color: #2A55F5; }
.lt-mic-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: 2px solid #16130F;
  border-radius: 999px;
  background: #16130F;
  color: #FBF6EC;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.72rem;
  transition: background 0.2s;
}
.lt-mic-btn:hover { background: #2A55F5; border-color: #2A55F5; }
.lt-mic-btn--active {
  background: #C0392B;
  border-color: #C0392B;
  animation: ltMicPulse 1s ease-in-out infinite;
}
@keyframes ltMicPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(192,57,43,0); }
}
.lt-notes-actions {
  display: flex;
  gap: 12px;
}
.lt-notes-skip {
  flex: 1;
  height: 48px;
  border: 2px solid #E7DFCE;
  background: #FBF6EC;
  color: #5A5348;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
}
.lt-notes-done {
  flex: 2;
  height: 48px;
  border: 2px solid #16130F;
  border-radius: 999px;
  background: #2A55F5;
  color: #fff;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
  box-shadow: 3px 3px 0 #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.lt-notes-done:hover { background: #1E42D6; }
.lt-notes-done:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── SOS ────────────────────────────────────────────────────────────── */
.lt-sos-btn {
  position: fixed;
  bottom: 100px;
  right: 18px;
  width: 52px;
  height: 52px;
  border: 3px solid #FBF6EC;
  border-radius: 999px;
  background: #C0392B;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 900;
  letter-spacing: 0.1em;
  cursor: pointer;
  z-index: 50;
  transition: background 0.15s;
}
.lt-sos-btn:hover { background: #a93226; }
.lt-sos-overlay {
  position: fixed;
  inset: 0;
  background: rgba(22,19,15,0.72);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.lt-sos-modal {
  background: #FBF6EC;
  width: 100%;
  max-width: 400px;
  border: 2px solid #16130F;
  box-shadow: 6px 6px 0 #16130F;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #16130F;
}
.lt-sos-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 1.4rem;
  text-transform: uppercase;
  color: #C0392B;
  letter-spacing: 0.02em;
}
.lt-sos-sub { font-size: 0.84rem; color: #5A5348; margin: 0; }
.lt-sos-no-contacts {
  font-size: 0.8rem;
  color: #5A5348;
  border: 2px solid #E7DFCE;
  padding: 12px;
  background: #fff;
}
.lt-sos-list { display: flex; flex-direction: column; gap: 6px; }
.lt-sos-contact {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 9px 12px;
  border: 2px solid #E7DFCE;
  background: #fff;
}
.lt-sos-contact-name { font-weight: 800; font-size: 0.88rem; }
.lt-sos-contact-email { font-size: 0.76rem; color: #5A5348; }
.lt-sos-actions { display: flex; gap: 10px; }
.lt-sos-cancel {
  flex: 1;
  height: 44px;
  border: 2px solid #E7DFCE;
  background: #FBF6EC;
  color: #5A5348;
  font-family: inherit;
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
}
.lt-sos-cancel:hover { border-color: #16130F; color: #16130F; }
.lt-sos-confirm {
  flex: 2;
  height: 44px;
  border: 2px solid #16130F;
  border-radius: 999px;
  background: #C0392B;
  color: #fff;
  font-family: inherit;
  font-weight: 900;
  font-size: 0.88rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  box-shadow: 3px 3px 0 #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.lt-sos-confirm:hover { background: #a93226; }

/* ── MAPBOX OVERRIDES ────────────────────────────────────────────────── */
:deep(.mapboxgl-ctrl-geolocate) { border-radius: 0 !important; }
:deep(.mapboxgl-ctrl-zoom-in),
:deep(.mapboxgl-ctrl-zoom-out),
:deep(.mapboxgl-ctrl-compass) { border-radius: 0 !important; }
:deep(.mapboxgl-ctrl-group) {
  border-radius: 0 !important;
  box-shadow: none !important;
  border: 2px solid rgba(251,246,236,0.25) !important;
}

/* ── ANIMATIONS ─────────────────────────────────────────────────────── */
@keyframes ltBlink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.25; }
}

/* ── UTILS ──────────────────────────────────────────────────────────── */
.me-2 { margin-right: 8px; }
.spinner-border {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(251,246,236,0.3);
  border-top-color: #FBF6EC;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  display: inline-block;
}
.spinner-border-sm { width: 0.85rem; height: 0.85rem; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>
