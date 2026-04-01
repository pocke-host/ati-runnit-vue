<template>
  <div class="explore-page">

    <!-- HEADER -->
    <div class="explore-header">
      <div class="explore-header-inner">
        <div>
          <h1 class="explore-title">Explore</h1>
          <p class="explore-sub">Discover athletes and routes near you</p>
        </div>

        <!-- Filters -->
        <div class="explore-filters">
          <select v-model="selectedSport" class="filter-select" @change="loadNearby">
            <option value="">All sports</option>
            <option value="RUN">Running</option>
            <option value="BIKE">Cycling</option>
            <option value="SWIM">Swimming</option>
            <option value="HIKE">Hiking</option>
            <option value="WALK">Walking</option>
          </select>
          <select v-model="radiusKm" class="filter-select" @change="loadNearby">
            <option :value="isImperial ? 16 : 10">{{ isImperial ? '10 mi' : '10 km' }}</option>
            <option :value="isImperial ? 40 : 25">{{ isImperial ? '25 mi' : '25 km' }}</option>
            <option :value="isImperial ? 80 : 50">{{ isImperial ? '50 mi' : '50 km' }}</option>
            <option :value="isImperial ? 160 : 100">{{ isImperial ? '100 mi' : '100 km' }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- PERMISSION GATE -->
    <div v-if="locationStatus === 'denied'" class="permission-banner">
      <i class="bi bi-geo-alt-fill"></i>
      Location access denied. Enable it in your browser settings to discover nearby athletes.
    </div>

    <div class="explore-body">

      <!-- MAP -->
      <div class="map-panel">
        <div ref="mapContainer" class="map-container"></div>
        <div v-if="locationStatus === 'loading'" class="map-overlay">
          <div class="spinner-border text-dark" style="width:1.5rem;height:1.5rem"></div>
          <span>Getting your location…</span>
        </div>
      </div>

      <!-- ACTIVITY LIST -->
      <div class="list-panel">
        <div v-if="loading" class="list-loading">
          <div class="spinner-border" style="width:1.2rem;height:1.2rem;border-color:#E5E5E5;border-top-color:#000"></div>
        </div>

        <div v-else-if="loadError" class="list-empty">
          <i class="bi bi-exclamation-circle" style="font-size:2rem;color:#E5E5E5"></i>
          <p>{{ loadError }}</p>
          <button class="retry-btn" @click="loadNearby">Try Again</button>
        </div>

        <div v-else-if="!activities.length" class="list-empty">
          <i class="bi bi-map" style="font-size:2rem;color:#E5E5E5"></i>
          <p>No activities found nearby.<br>Try increasing the radius or changing sport.</p>
        </div>

        <template v-else>
          <!-- Nearby athletes summary -->
          <div class="nearby-athletes" v-if="nearbyAthletes.length">
            <div class="list-section-label">{{ nearbyAthletes.length }} athletes near you</div>
            <div class="athlete-scroll">
              <div
                v-for="athlete in nearbyAthletes"
                :key="athlete.userId"
                class="athlete-chip"
                @click="goToProfile(athlete.userId)"
              >
                <img
                  v-if="athlete.avatarUrl"
                  :src="athlete.avatarUrl"
                  class="athlete-avatar"
                  :alt="athlete.displayName"
                />
                <div v-else class="athlete-avatar athlete-avatar-fallback">
                  {{ athlete.displayName?.charAt(0)?.toUpperCase() }}
                </div>
                <div class="athlete-info">
                  <div class="athlete-name">{{ athlete.displayName }}</div>
                  <div class="athlete-count">{{ athlete.activityCount }} activit{{ athlete.activityCount === 1 ? 'y' : 'ies' }}</div>
                </div>
                <button
                  v-if="!athlete.isFollowing"
                  class="follow-btn"
                  @click.stop="followAthlete(athlete)"
                >Follow</button>
                <span v-else class="following-label">Following</span>
              </div>
            </div>
          </div>

          <!-- Activity list -->
          <div class="list-section-label" style="margin-top:16px">
            {{ activities.length }} recent activities
          </div>
          <div
            v-for="act in activities"
            :key="act.id"
            class="activity-row"
            @click="goToActivity(act.id)"
            @mouseenter="highlightPin(act.id)"
            @mouseleave="dimPin(act.id)"
          >
            <div class="activity-row-left">
              <i :class="`bi ${sportIcon(act.sport_type)} activity-sport-icon`"></i>
              <div>
                <div class="activity-row-user">{{ act.display_name || 'Athlete' }}</div>
                <div class="activity-row-title">{{ act.title || act.sport_type }}</div>
                <div class="activity-row-meta">
                  <span v-if="act.distance_meters">{{ formatDistance(act.distance_meters) }}</span>
                  <span v-if="act.duration_seconds">{{ formatDur(act.duration_seconds) }}</span>
                </div>
              </div>
            </div>
            <div class="activity-row-date">{{ relativeDate(act.created_at) }}</div>
          </div>
        </template>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import mapboxgl from 'mapbox-gl'
import { useUnits } from '@/composables/useUnits'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const router = useRouter()
const { formatDistance, isImperial } = useUnits()
const { user } = storeToRefs(useAuthStore())

const mapContainer = ref(null)
let map = null
const markers = {}

const locationStatus = ref('loading') // 'loading' | 'ok' | 'denied'
const userLat = ref(null)
const userLng = ref(null)

const selectedSport = ref('')
const radiusKm = ref(50)
const loading = ref(false)
const loadError = ref('')
const activities = ref([])

// ── Computed: unique athletes from the activity list ──────────────
const nearbyAthletes = computed(() => {
  const seen = new Map()
  for (const a of activities.value) {
    if (!seen.has(a.user_id)) {
      seen.set(a.user_id, {
        userId:        a.user_id,
        displayName:   a.display_name,
        avatarUrl:     a.avatar_url,
        activityCount: 1,
        isFollowing:   false,
      })
    } else {
      seen.get(a.user_id).activityCount++
    }
  }
  return [...seen.values()]
})

// ── Map init ──────────────────────────────────────────────────────
function initMap(lat, lng) {
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/light-v11',
    center: [lng, lat],
    zoom: 11,
  })

  // User location dot
  new mapboxgl.Marker({ color: '#0052FF', scale: 0.8 })
    .setLngLat([lng, lat])
    .addTo(map)
}

function plotActivities() {
  // Remove old markers
  Object.values(markers).forEach(m => m.remove())
  Object.keys(markers).forEach(k => delete markers[k])

  for (const act of activities.value) {
    if (!act.start_lat || !act.start_lng) continue

    const el = document.createElement('div')
    el.className = 'map-pin'
    el.dataset.id = act.id

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat([act.start_lng, act.start_lat])
      .setPopup(new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div class="map-popup">
          <div class="map-popup-user">${(act.display_name || 'Athlete').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]))}</div>
          <div class="map-popup-title">${(act.title || act.sport_type || '').replace(/[<>&"]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]))}</div>
          ${act.distance_meters ? `<div class="map-popup-meta">${(act.distance_meters / 1000).toFixed(1)} km</div>` : ''}
        </div>
      `))
      .addTo(map)

    el.addEventListener('click', () => router.push(`/activities/${act.id}`))
    markers[act.id] = marker
  }
}

function highlightPin(id) {
  const el = document.querySelector(`.map-pin[data-id="${id}"]`)
  if (el) el.classList.add('map-pin--active')
}

function dimPin(id) {
  const el = document.querySelector(`.map-pin[data-id="${id}"]`)
  if (el) el.classList.remove('map-pin--active')
}

// ── Data loading ──────────────────────────────────────────────────
async function loadNearby() {
  if (!userLat.value) return
  loading.value = true
  loadError.value = ''
  try {
    const token = localStorage.getItem('token')
    const params = new URLSearchParams({
      lat: userLat.value,
      lng: userLng.value,
      radius: radiusKm.value,
      size: 50,
    })
    if (selectedSport.value) params.set('sport', selectedSport.value)

    const { data } = await axios.get(`${API_URL}/activities/nearby?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    activities.value = data.content || data || []
    plotActivities()
  } catch {
    loadError.value = 'Could not load nearby activities. Check your connection and try again.'
    activities.value = []
  } finally {
    loading.value = false
  }
}

// ── Follow ────────────────────────────────────────────────────────
async function followAthlete(athlete) {
  try {
    const token = localStorage.getItem('token')
    await axios.post(`${API_URL}/follow/${athlete.userId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    })
    athlete.isFollowing = true
  } catch {
    loadError.value = 'Failed to follow athlete. Please try again.'
  }
}

// ── Navigation ────────────────────────────────────────────────────
function goToActivity(id) { router.push(`/activities/${id}`) }
function goToProfile(id)  { router.push(`/profile/${id}`) }

// ── Formatting ────────────────────────────────────────────────────
function sportIcon(type) {
  switch ((type || '').toUpperCase()) {
    case 'RUN':  return 'bi-person-walking'
    case 'BIKE': return 'bi-bicycle'
    case 'SWIM': return 'bi-water'
    case 'HIKE': return 'bi-tree'
    default:     return 'bi-activity'
  }
}

function formatDur(s) {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function relativeDate(iso) {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const d = Math.floor(diff / 86400000)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  if (d < 7)  return `${d}d ago`
  if (d < 30) return `${Math.floor(d / 7)}w ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(() => {
  navigator.geolocation.getCurrentPosition(
    pos => {
      userLat.value = pos.coords.latitude
      userLng.value = pos.coords.longitude
      locationStatus.value = 'ok'
      initMap(userLat.value, userLng.value)
      loadNearby()
    },
    () => { locationStatus.value = 'denied' },
    { enableHighAccuracy: true, timeout: 8000 }
  )
})

onBeforeUnmount(() => { map?.remove() })
</script>

<style scoped>
.explore-page {
  display: flex;
  flex-direction: column;
  height: calc(100vh - var(--nav-h, 64px));
  background: #fff;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

/* Header */
.explore-header {
  border-bottom: 1px solid #E5E5E5;
  background: #fff;
  flex-shrink: 0;
}
.explore-header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.explore-title {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.01em;
  margin: 0;
  text-transform: uppercase;
}
.explore-sub {
  font-size: 0.8rem;
  color: #767676;
  margin: 2px 0 0;
  letter-spacing: 0.04em;
}
.explore-filters {
  display: flex;
  gap: 8px;
}
.filter-select {
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  border: 1px solid #E5E5E5;
  background: #fff;
  cursor: pointer;
  text-transform: uppercase;
  font-family: inherit;
}
.filter-select:focus { outline: 2px solid #000; }

/* Permission banner */
.permission-banner {
  background: #fff3cd;
  border-bottom: 1px solid #ffc107;
  padding: 10px 24px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Body: map + list side by side */
.explore-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* Map */
.map-panel {
  flex: 1;
  position: relative;
  min-height: 300px;
}
.map-container {
  width: 100%;
  height: 100%;
}
.map-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #767676;
}

/* List panel */
.list-panel {
  width: 360px;
  flex-shrink: 0;
  border-left: 1px solid #E5E5E5;
  overflow-y: auto;
  background: #fff;
}
.list-loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}
.list-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  text-align: center;
  color: #767676;
  font-size: 0.85rem;
}

.retry-btn {
  background: #000;
  color: #fff;
  border: none;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  cursor: pointer;
  margin-top: 4px;
}
.retry-btn:hover { background: #222; }

/* Athletes strip */
.nearby-athletes {
  padding: 16px 16px 0;
}
.list-section-label {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
  padding: 0 16px;
  margin-bottom: 8px;
}
.athlete-scroll {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.athlete-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  cursor: pointer;
  border-bottom: 1px solid #F5F5F5;
}
.athlete-chip:hover { background: #FAFAFA; }
.athlete-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
.athlete-avatar-fallback {
  background: #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
}
.athlete-info { flex: 1; min-width: 0; }
.athlete-name {
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.athlete-count { font-size: 0.75rem; color: #767676; }
.follow-btn {
  padding: 4px 12px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: #000;
  color: #fff;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
}
.following-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #767676;
  flex-shrink: 0;
}

/* Activity rows */
.activity-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #F5F5F5;
  cursor: pointer;
  transition: background 0.1s;
}
.activity-row:hover { background: #FAFAFA; }
.activity-row-left { display: flex; align-items: flex-start; gap: 10px; }
.activity-sport-icon { font-size: 1rem; color: #767676; margin-top: 2px; }
.activity-row-user { font-size: 0.75rem; color: #767676; }
.activity-row-title { font-size: 0.85rem; font-weight: 600; }
.activity-row-meta { display: flex; gap: 8px; font-size: 0.75rem; color: #767676; margin-top: 2px; }
.activity-row-date { font-size: 0.72rem; color: #A0A0A0; flex-shrink: 0; }

/* Mobile: stack map on top */
@media (max-width: 768px) {
  .explore-body { flex-direction: column; }
  .map-panel { height: 280px; flex: none; }
  .list-panel { width: 100%; border-left: none; border-top: 1px solid #E5E5E5; }
  .explore-header-inner { padding: 12px 16px; }
}
</style>

<style>
/* Map pin — not scoped so Mapbox can use it */
.map-pin {
  width: 12px;
  height: 12px;
  background: #0052FF;
  border: 2px solid #fff;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
}
.map-pin--active {
  transform: scale(1.8);
  background: #000;
}
.map-popup { font-family: Futura, "Avenir Next", system-ui, sans-serif; font-size: 12px; }
.map-popup-user { color: #767676; margin-bottom: 2px; }
.map-popup-title { font-weight: 700; }
.map-popup-meta { color: #767676; margin-top: 2px; }
</style>
