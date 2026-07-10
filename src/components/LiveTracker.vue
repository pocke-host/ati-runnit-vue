<!-- ========== LiveTracker.vue ========== -->
<template>
  <div
    class="lt"
    :class="{
      'lt--recording': isTracking,
      'lt--paused': !isTracking && hasStarted,
      'lt--ready': !hasStarted
    }"
  >

    <!-- Status bar — cobalt when recording, yellow-tinted when paused -->
    <div v-if="hasStarted" class="lt-status-bar" :class="{ 'lt-status-bar--paused': !isTracking }">
      <div class="lt-status-left">
        <span class="lt-rec-dot" :class="{ 'lt-rec-dot--active': isTracking }"></span>
        <span class="lt-status-text">{{ isTracking ? 'Recording' : 'Paused' }} · {{ selectedSport.charAt(0) + selectedSport.slice(1).toLowerCase() }}</span>
      </div>
      <div class="lt-gps-dots">
        <span class="lt-gps-d" style="opacity:1">●</span>
        <span class="lt-gps-d" style="opacity:0.5">●</span>
        <span class="lt-gps-d" style="opacity:0.22">●</span>
      </div>
    </div>

    <!-- Big timer (recording / paused) -->
    <div v-if="hasStarted" class="lt-timer-block" :class="{ 'lt-timer-block--dim': !isTracking }">
      <div class="lt-timer">{{ formatDurationClock(elapsedTime) }}</div>
    </div>

    <!-- 3-up stat row (recording / paused) -->
    <div v-if="hasStarted" class="lt-stats-row" :class="{ 'lt-stats-row--dim': !isTracking }">
      <div class="lt-stat">
        <div class="lt-stat-label">DIST</div>
        <div class="lt-stat-val">{{ formatDistance(totalDistance) }}</div>
      </div>
      <div class="lt-stat-div"></div>
      <div class="lt-stat">
        <div class="lt-stat-label">PACE</div>
        <div class="lt-stat-val lt-stat-val--pace">{{ formatPace(currentPaceMinPerKm) }}</div>
      </div>
      <div class="lt-stat-div"></div>
      <div class="lt-stat">
        <div class="lt-stat-label">ELEV</div>
        <div class="lt-stat-val">{{ formatElevation(elevationGain) }}</div>
      </div>
    </div>

    <!-- Map -->
    <div class="lt-map-wrap" :class="{ 'lt-map-wrap--dim': !isTracking && hasStarted }">
      <div ref="liveMapContainer" class="lt-map"></div>
      <!-- GPS ready chip (ready state only) -->
      <div v-if="!hasStarted" class="lt-gps-chip">
        <span class="lt-gps-chip-dot"></span>GPS Ready
      </div>
      <div v-if="gpsError" class="lt-gps-error">
        <i class="bi bi-geo-alt-fill"></i>
        <p>{{ gpsError }}</p>
      </div>
    </div>

    <!-- Content zone — visible in ready state only; fills dead ink space above the sheet -->
    <div v-if="!hasStarted" class="lt-content-zone">

      <!-- Elevation teaser -->
      <div class="lt-cz-card">
        <div class="lt-cz-eyebrow">ELEVATION PROFILE</div>
        <svg class="lt-cz-elev-svg" viewBox="0 0 280 52" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points="0,48 40,36 80,42 130,14 175,24 210,8 250,20 280,26"
            fill="none" stroke="#2A55F5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
          />
          <polyline
            points="0,48 40,36 80,42 130,14 175,24 210,8 250,20 280,26 280,52 0,52"
            fill="rgba(42,85,245,0.14)" stroke="none"
          />
        </svg>
        <div class="lt-cz-elev-note">Elevation loads once you start tracking</div>
      </div>

      <!-- Today's plan -->
      <div class="lt-cz-card lt-cz-card--plan">
        <div class="lt-cz-eyebrow">TODAY'S PLAN</div>
        <div class="lt-cz-plan-row">
          <span class="lt-cz-plan-name">Tempo Intervals</span>
          <router-link to="/plans" class="lt-cz-plan-link">View →</router-link>
        </div>
      </div>

      <!-- 3-up mini stats -->
      <div class="lt-cz-stats">
        <div class="lt-cz-ms">
          <div class="lt-cz-ms-label">LAST RUN</div>
          <div class="lt-cz-ms-val">—</div>
        </div>
        <div class="lt-cz-ms-div"></div>
        <div class="lt-cz-ms">
          <div class="lt-cz-ms-label">WK TOTAL</div>
          <div class="lt-cz-ms-val">—</div>
        </div>
        <div class="lt-cz-ms-div"></div>
        <div class="lt-cz-ms">
          <div class="lt-cz-ms-label">STREAK</div>
          <div class="lt-cz-ms-val lt-cz-ms-val--streak">0 days</div>
        </div>
      </div>

    </div>

    <!-- Draft Recovery Banner -->
    <div v-if="showDraftBanner" class="lt-draft-banner">
      <div class="lt-draft-text">
        <i class="bi bi-clock-history"></i>
        Unfinished session from {{ draftAge }} — resume it?
      </div>
      <div class="lt-draft-actions">
        <button class="lt-draft-btn lt-draft-btn--resume" type="button" @click="resumeDraft">Resume</button>
        <button class="lt-draft-btn lt-draft-btn--discard" type="button" @click="discardDraft">Discard</button>
      </div>
    </div>

    <!-- Save error -->
    <div v-if="saveError" class="lt-save-error">
      <i class="bi bi-exclamation-circle"></i> {{ saveError }}
    </div>

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
            :title="micListening ? 'Stop recording' : 'Dictate note'"
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

    <!-- Bottom cream sheet -->
    <div class="lt-sheet">

      <!-- READY: sport selector + round Start button -->
      <template v-if="!hasStarted">
        <div class="lt-sport-row">
          <div class="lt-sport-label">SPORT</div>
          <div class="lt-sport-options">
            <button
              v-for="sport in sports"
              :key="sport.value"
              :class="['lt-sport-btn', { 'lt-sport-btn--active': selectedSport === sport.value }]"
              @click="selectedSport = sport.value"
              type="button"
            >
              <span class="lt-sport-icon">{{ sport.value.charAt(0) }}</span>
              <span class="lt-sport-name">{{ sport.label }}</span>
            </button>
          </div>
        </div>
        <div class="lt-ready-row">
          <div class="lt-flanker">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
          </div>
          <button class="lt-start-btn" @click="startTracking" type="button" aria-label="Start tracking">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg>
          </button>
          <div class="lt-flanker">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </div>
        </div>
      </template>

      <!-- RECORDING: Lap / Stop / Pause round buttons -->
      <template v-if="isTracking">
        <div class="lt-ctrl-row">
          <div class="lt-ctrl-col">
            <button class="lt-ctrl lt-ctrl--lap" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
            </button>
            <span class="lt-ctrl-lbl">LAP</span>
          </div>
          <div class="lt-ctrl-col">
            <button class="lt-ctrl lt-ctrl--stop" @click="showFinishConfirm = true" :disabled="saving" type="button">
              <span v-if="saving" class="spinner-border spinner-border-sm"></span>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="#fff"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
            </button>
            <span class="lt-ctrl-lbl">STOP</span>
          </div>
          <div class="lt-ctrl-col">
            <button class="lt-ctrl lt-ctrl--pause" @click="pauseTracking" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
            </button>
            <span class="lt-ctrl-lbl">PAUSE</span>
          </div>
        </div>
        <button v-if="!isSharing" class="lt-share-btn" @click="startSharing" type="button">
          <i class="bi bi-broadcast"></i> Share Live
        </button>
      </template>

      <!-- PAUSED: Resume + Finish + Discard -->
      <template v-if="!isTracking && hasStarted">
        <div class="lt-paused-row">
          <button class="lt-resume-btn" @click="resumeTracking" type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            Resume
          </button>
          <button class="lt-finish-btn" @click="showFinishConfirm = true" :disabled="saving" type="button">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ saving ? 'Saving…' : 'Finish' }}
          </button>
        </div>
        <button class="lt-discard-link" @click="showFinishConfirm = true" type="button">Discard Activity</button>
      </template>

    </div>

    <!-- Broadcasting banner -->
    <div v-if="isSharing" class="lt-share-banner">
      <span class="lt-share-dot"></span>
      <span class="lt-share-label">BROADCASTING</span>
      <span class="lt-share-url">{{ shareUrl.replace('https://', '').slice(0, 32) }}…</span>
      <button class="lt-share-stop" @click="stopSharing">Stop Sharing</button>
    </div>
    <div v-if="shareCopied" class="lt-share-toast">Link copied!</div>

    <ConfirmModal
      v-model="showFinishConfirm"
      title="Finish Activity?"
      body="Save this workout and end the session."
      confirm-label="Save & Finish"
      @confirm="stopTracking"
    />

    <!-- SOS Button -->
    <button v-if="isTracking" class="lt-sos-btn" @click="showSosModal = true" type="button">
      <i class="bi bi-exclamation-triangle-fill"></i> SOS
    </button>

    <!-- SOS Modal -->
    <div v-if="showSosModal" class="lt-sos-overlay">
      <div class="lt-sos-modal">
        <div class="lt-sos-title"><i class="bi bi-exclamation-triangle-fill"></i> SEND SOS ALERT</div>
        <p class="lt-sos-sub">This will sound an alert and send an email to your emergency contacts with your current location.</p>
        <div v-if="sosContacts.length === 0" class="lt-sos-no-contacts">
          No emergency contacts found. Add contacts in Settings → Safety.
        </div>
        <div v-else class="lt-sos-contacts">
          <div v-for="c in sosContacts" :key="c.id" class="lt-sos-contact">
            <span class="lt-sos-name">{{ c.name }}</span>
            <span v-if="c.email" class="lt-sos-email">{{ c.email }}</span>
          </div>
        </div>
        <div class="lt-sos-actions">
          <button class="lt-sos-cancel" @click="showSosModal = false">Cancel</button>
          <button class="lt-sos-confirm" @click="sendSos">
            <i class="bi bi-exclamation-triangle-fill"></i> Send SOS
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
/* ── Outer wrapper — always full-bleed ink ── */
.lt {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--nav-h, 66px));
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  background: #16130F;
  color: #FBF6EC;
}

/* ── Status bar ── */
.lt-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 44px;
  padding: 0 20px;
  background: #2A55F5;
  flex-shrink: 0;
}
.lt-status-bar--paused {
  background: rgba(22,19,15,0.9);
  border-bottom: 2px solid #FFC53D;
}
.lt-status-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.lt-rec-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(251,246,236,0.4);
  flex-shrink: 0;
}
.lt-rec-dot--active {
  background: #ff3b30;
  animation: ltBlink 1.1s ease-in-out infinite;
}
@keyframes ltBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
.lt-status-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #fff;
}
.lt-gps-dots {
  display: flex;
  gap: 3px;
  align-items: center;
}
.lt-gps-d {
  font-size: 0.48rem;
  color: #fff;
}

/* ── Big timer ── */
.lt-timer-block {
  padding: 20px 20px 0;
  text-align: center;
  flex-shrink: 0;
  transition: opacity 0.3s;
}
.lt-timer-block--dim { opacity: 0.5; }
.lt-timer {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(72px, 18vw, 112px);
  font-weight: 900;
  color: #FBF6EC;
  letter-spacing: 0.01em;
  font-variant-numeric: tabular-nums;
  line-height: 0.85;
  text-transform: uppercase;
}

/* ── 3-up stats row ── */
.lt-stats-row {
  display: flex;
  align-items: stretch;
  margin: 16px 20px 0;
  border: 2px solid rgba(251,246,236,0.18);
  flex-shrink: 0;
  transition: opacity 0.3s;
}
.lt-stats-row--dim { opacity: 0.5; }
.lt-stat {
  flex: 1;
  padding: 10px 12px;
  text-align: center;
}
.lt-stat-div {
  width: 2px;
  background: rgba(251,246,236,0.18);
  flex-shrink: 0;
}
.lt-stat-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(251,246,236,0.5);
  margin-bottom: 4px;
}
.lt-stat-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  color: #FBF6EC;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.lt-stat-val--pace { color: #FFC53D; }

/* ── Map ── */
.lt-map-wrap {
  position: relative;
  flex: 1;
  min-height: 180px;
  transition: opacity 0.3s;
}
.lt-map-wrap--dim { opacity: 0.55; }
.lt-map {
  width: 100%;
  height: 100%;
  min-height: 180px;
}

/* GPS ready chip */
.lt-gps-chip {
  position: absolute;
  top: 14px;
  left: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(22,19,15,0.75);
  border: 1.5px solid #2A55F5;
  padding: 6px 12px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #FBF6EC;
}
.lt-gps-chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2A55F5;
  animation: ltPulse 2s ease-in-out infinite;
  flex-shrink: 0;
}
@keyframes ltPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(42,85,245,0.6); }
  50% { box-shadow: 0 0 0 6px rgba(42,85,245,0); }
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
  font-size: 0.85rem;
  font-weight: 600;
  color: #C0392B;
  text-align: center;
  padding: 20px;
}
.lt-gps-error i { font-size: 1.8rem; }

/* ── Draft banner ── */
.lt-draft-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: #FFC53D;
  border-top: 2px solid #16130F;
  flex-shrink: 0;
}
.lt-draft-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #16130F;
}
.lt-draft-actions { display: flex; gap: 8px; flex-shrink: 0; }
.lt-draft-btn {
  padding: 7px 14px;
  border: 2px solid #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
}
.lt-draft-btn--resume { background: #16130F; color: #FBF6EC; }
.lt-draft-btn--discard { background: transparent; color: #16130F; }

/* ── Save error ── */
.lt-save-error {
  padding: 12px 16px;
  background: rgba(192,57,43,0.12);
  border-top: 2px solid #C0392B;
  color: #C0392B;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* ── Bottom cream sheet ── */
.lt-sheet {
  background: #FBF6EC;
  border-top: 3px solid #2A55F5;
  padding: 20px 20px 28px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* READY state */
.lt-sport-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #5A5348;
  margin-bottom: 10px;
}
.lt-sport-options {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.lt-sport-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 10px 8px;
  border: 2px solid #16130F;
  background: #FBF6EC;
  cursor: pointer;
  flex: 1;
  min-width: 52px;
  transition: background 0.12s;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  color: #16130F;
}
.lt-sport-btn:hover { background: #E7DFCE; }
.lt-sport-btn--active {
  background: #2A55F5;
  border-color: #16130F;
  color: #fff;
  box-shadow: 2px 2px 0 #16130F;
}
.lt-sport-icon {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 700;
  width: 24px;
  height: 24px;
  border: 1.5px solid currentColor;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
}
.lt-sport-name {
  font-size: 0.58rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lt-ready-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}
.lt-flanker {
  width: 48px;
  height: 48px;
  border: 2px solid #16130F;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5A5348;
  cursor: pointer;
}
.lt-start-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #2A55F5;
  border: 3px solid #16130F;
  box-shadow: 4px 4px 0 #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
}
.lt-start-btn:hover { background: #1E42D6; }
.lt-start-btn:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #16130F; }

/* RECORDING state */
.lt-ctrl-row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 28px;
}
.lt-ctrl-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.lt-ctrl-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #5A5348;
}
.lt-ctrl {
  border-radius: 50%;
  border: 3px solid #16130F;
  box-shadow: 3px 3px 0 #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.1s;
}
.lt-ctrl:active { transform: translate(1px, 1px); box-shadow: 2px 2px 0 #16130F; }
.lt-ctrl:disabled { opacity: 0.4; cursor: not-allowed; }
.lt-ctrl--lap {
  width: 56px;
  height: 56px;
  background: #fff;
  color: #16130F;
}
.lt-ctrl--stop {
  width: 72px;
  height: 72px;
  background: #C0392B;
  color: #fff;
}
.lt-ctrl--pause {
  width: 64px;
  height: 64px;
  background: #16130F;
  color: #FBF6EC;
}

.lt-share-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  height: 44px;
  border: 2px solid #16130F;
  background: #FBF6EC;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
  transition: background 0.12s;
}
.lt-share-btn:hover { background: #E7DFCE; }

/* PAUSED state */
.lt-paused-row {
  display: flex;
  gap: 12px;
}
.lt-resume-btn {
  flex: 1;
  height: 52px;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  box-shadow: 4px 4px 0 #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
.lt-resume-btn:hover { background: #1E42D6; }
.lt-finish-btn {
  flex: 1;
  height: 52px;
  background: #16130F;
  color: #FBF6EC;
  border: 2px solid #16130F;
  border-radius: 999px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.lt-finish-btn:hover:not(:disabled) { opacity: 0.82; }
.lt-finish-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.lt-discard-link {
  background: none;
  border: none;
  color: #C0392B;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  text-decoration: underline;
  cursor: pointer;
  text-align: center;
  padding: 0;
}
.lt-discard-link:hover { opacity: 0.75; }

/* ── Sharing banner ── */
.lt-share-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 16px;
  background: #16130F;
  border-top: 3px solid #2A55F5;
  flex-shrink: 0;
}
.lt-share-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2A55F5;
  flex-shrink: 0;
  animation: ltBlink 1.5s ease-in-out infinite;
}
.lt-share-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #2A55F5;
  text-transform: uppercase;
}
.lt-share-url {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  color: rgba(251,246,236,0.55);
}
.lt-share-stop {
  margin-left: auto;
  background: none;
  border: none;
  color: #FBF6EC;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  text-decoration: underline;
}
.lt-share-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #16130F;
  color: #FBF6EC;
  padding: 10px 22px;
  border: 2px solid rgba(251,246,236,0.3);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  z-index: 9999;
}

/* ── SOS ── */
.lt-sos-btn {
  width: 100%;
  height: 48px;
  background: #C0392B;
  color: #fff;
  border: none;
  border-top: 2px solid rgba(192,57,43,0.4);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.lt-sos-btn:hover { background: #a93226; }

.lt-sos-overlay {
  position: absolute;
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
  border: 2px solid #16130F;
  box-shadow: 5px 5px 0 #16130F;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #16130F;
}
.lt-sos-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.6rem;
  font-weight: 900;
  color: #C0392B;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 0.9;
  display: flex;
  align-items: center;
  gap: 10px;
}
.lt-sos-sub { font-size: 0.85rem; color: #5A5348; margin: 0; }
.lt-sos-no-contacts {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  color: #5A5348;
  font-weight: 600;
  background: #E7DFCE;
  border: 2px solid #16130F;
  padding: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.lt-sos-contacts { display: flex; flex-direction: column; border: 2px solid #16130F; }
.lt-sos-contact {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-bottom: 2px solid #16130F;
  background: #fff;
}
.lt-sos-contact:last-child { border-bottom: none; }
.lt-sos-name { font-weight: 700; font-size: 0.9rem; }
.lt-sos-email { font-size: 0.75rem; color: #5A5348; }
.lt-sos-actions { display: flex; border: 2px solid #16130F; margin-top: 4px; }
.lt-sos-cancel {
  flex: 1;
  height: 48px;
  border: none;
  border-right: 2px solid #16130F;
  background: #FBF6EC;
  color: #5A5348;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
  transition: background 0.12s;
}
.lt-sos-cancel:hover { background: #E7DFCE; color: #16130F; }
.lt-sos-confirm {
  flex: 2;
  height: 48px;
  background: #C0392B;
  color: #fff;
  border: none;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 900;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.15s;
}
.lt-sos-confirm:hover { background: #a93226; }

/* ── Notes overlay ── */
.lt-notes-overlay {
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
.lt-notes-inner {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #16130F;
}
.lt-notes-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #16130F;
  line-height: 0.9;
}
.lt-notes-sub { font-size: 0.9rem; color: #5A5348; margin: 0; }
.lt-notes-input-wrap { position: relative; }
.lt-notes-textarea {
  width: 100%;
  border: 2px solid #16130F;
  border-radius: 0;
  background: #fff;
  padding: 12px 12px 40px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
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
.lt-mic-btn:hover { background: #2A55F5; }
.lt-mic-btn--active {
  background: #C0392B;
  border-color: #C0392B;
  animation: ltMicPulse 1s ease-in-out infinite;
}
@keyframes ltMicPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192,57,43,0.4); }
  50% { box-shadow: 0 0 0 6px rgba(192,57,43,0); }
}
.lt-notes-actions {
  display: flex;
  border: 2px solid #16130F;
  margin-top: 4px;
}
.lt-notes-skip {
  flex: 1;
  padding: 14px;
  border: none;
  border-right: 2px solid #16130F;
  background: #FBF6EC;
  color: #5A5348;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background 0.12s;
}
.lt-notes-skip:hover { background: #E7DFCE; }
.lt-notes-done {
  flex: 2;
  padding: 14px;
  border: none;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background 0.15s;
}
.lt-notes-done:hover:not(:disabled) { background: #1E42D6; }
.lt-notes-done:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Mapbox control overrides ── */
:deep(.mapboxgl-ctrl-geolocate),
:deep(.mapboxgl-ctrl-zoom-in),
:deep(.mapboxgl-ctrl-zoom-out),
:deep(.mapboxgl-ctrl-compass) { border-radius: 0 !important; }
:deep(.mapboxgl-ctrl-group) {
  border-radius: 0 !important;
  box-shadow: none !important;
  border: 2px solid rgba(251,246,236,0.25) !important;
}

.me-1 { margin-right: 4px; }
.me-2 { margin-right: 8px; }

@media (max-width: 640px) {
  .lt-timer { font-size: clamp(60px, 16vw, 88px); }
  .lt-stats-row { margin: 12px 14px 0; }
  .lt-sheet { padding: 16px 16px 24px; }
  .lt-start-btn { width: 72px; height: 72px; }
  .lt-ctrl--stop { width: 64px; height: 64px; }
  .lt-ctrl--pause { width: 56px; height: 56px; }
  .lt-ctrl--lap { width: 48px; height: 48px; }
  .lt-ctrl-row { gap: 20px; }
}

/* ── Content zone (ready state) ── */
.lt-content-zone {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: #16130F;
  border-top: 2px solid rgba(251,246,236,0.12);
  flex-shrink: 0;
}

.lt-cz-card {
  padding: 14px 20px;
  border-bottom: 2px solid rgba(251,246,236,0.1);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lt-cz-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.4);
}

/* Elevation card */
.lt-cz-elev-svg {
  width: 100%;
  height: 52px;
  display: block;
}

.lt-cz-elev-note {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.72rem;
  color: rgba(251,246,236,0.35);
}

/* Plan card */
.lt-cz-card--plan { padding-top: 12px; padding-bottom: 12px; }

.lt-cz-plan-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lt-cz-plan-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #FBF6EC;
  line-height: 0.95;
}

.lt-cz-plan-link {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #2A55F5;
  text-decoration: none;
  flex-shrink: 0;
}
.lt-cz-plan-link:hover { color: #FBF6EC; }

/* 3-up mini stats */
.lt-cz-stats {
  display: flex;
  align-items: stretch;
  border-bottom: 2px solid rgba(251,246,236,0.1);
}

.lt-cz-ms {
  flex: 1;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.lt-cz-ms-div {
  width: 2px;
  background: rgba(251,246,236,0.1);
  flex-shrink: 0;
}

.lt-cz-ms-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.52rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.4);
}

.lt-cz-ms-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.1rem;
  font-weight: 900;
  color: #FBF6EC;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.lt-cz-ms-val--streak {
  color: #FFC53D;
}
</style>
