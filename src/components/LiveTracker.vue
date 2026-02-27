<!-- ========== LiveTracker.vue ========== -->
<template>
    <div class="live-tracker">
      <!-- Sport Picker (pre-start only) -->
      <div v-if="!hasStarted" class="sport-picker-row">
        <SportsPicker v-model="selectedSport" />
      </div>
      <div v-else class="active-sport-chip">
        <i :class="`bi ${sportIcon}`"></i> {{ selectedSport }}
      </div>

      <!-- Header -->
      <div class="tracker-header">
        <div class="tracker-status">
          <div :class="['status-indicator', { active: isTracking }]"></div>
          <span>{{ isTracking ? 'Tracking...' : 'Paused' }}</span>
        </div>
        <div class="tracker-time">{{ formatTime(elapsedTime) }}</div>
        <SOSButton v-if="hasStarted" />
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="live-stat">
          <div class="stat-label">Distance</div>
          <div class="stat-value">{{ (totalDistance / 1000).toFixed(2) }} <span class="unit">km</span></div>
        </div>
        <div class="live-stat">
          <div class="stat-label">Current Pace</div>
          <div class="stat-value">{{ formatPace(currentPace) }} <span class="unit">/km</span></div>
        </div>
        <div class="live-stat">
          <div class="stat-label">Avg Pace</div>
          <div class="stat-value">{{ formatPace(averagePace) }} <span class="unit">/km</span></div>
        </div>
        <div class="live-stat">
          <div class="stat-label">Elevation</div>
          <div class="stat-value">{{ elevationGain.toFixed(0) }} <span class="unit">m</span></div>
        </div>
      </div>

      <!-- Map -->
      <div class="live-map-container">
        <div ref="liveMapContainer" class="live-map"></div>
      </div>

      <!-- Live Share Toggle -->
      <div class="live-share-row">
        <div class="share-info">
          <i class="bi bi-broadcast"></i>
          <div>
            <div class="share-label">Live Location Sharing</div>
            <div class="share-sub">{{ safetyStore.liveShareActive ? 'Your contacts can follow your run' : 'Share route with selected contacts' }}</div>
          </div>
        </div>
        <button
          :class="['share-toggle', { active: safetyStore.liveShareActive }]"
          @click="toggleLiveShare"
        >
          {{ safetyStore.liveShareActive ? 'ON' : 'OFF' }}
        </button>
      </div>

      <!-- Music Player -->
      <MusicPlayer />

      <!-- Controls -->
      <div class="tracker-controls">
        <button
          v-if="!isTracking && !hasStarted"
          class="control-btn control-btn-primary"
          @click="startTracking"
        >
          <i class="bi bi-play-fill"></i>
          Start
        </button>

        <button
          v-if="isTracking"
          class="control-btn control-btn-warning"
          @click="pauseTracking"
        >
          <i class="bi bi-pause-fill"></i>
          Pause
        </button>

        <button
          v-if="!isTracking && hasStarted"
          class="control-btn control-btn-primary"
          @click="resumeTracking"
        >
          <i class="bi bi-play-fill"></i>
          Resume
        </button>

        <button
          v-if="hasStarted"
          class="control-btn control-btn-danger"
          @click="stopTracking"
        >
          <i class="bi bi-stop-fill"></i>
          Finish
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import mapboxgl from 'mapbox-gl'
  import 'mapbox-gl/dist/mapbox-gl.css'
  import { Geolocation } from '@capacitor/geolocation'
  import SOSButton from '@/components/SOSButton.vue'
  import MusicPlayer from '@/components/MusicPlayer.vue'
  import SportsPicker from '@/components/SportsPicker.vue'
  import { useSafetyStore } from '@/stores/safety'
  import { useMusicStore } from '@/stores/music'
  
  const router = useRouter()
  const safetyStore = useSafetyStore()
  const musicStore = useMusicStore()

  const selectedSport = ref('running')
  const sportIconMap = { running: 'bi-person-walking', cycling: 'bi-bicycle', swimming: 'bi-water', hiking: 'bi-tree-fill', triathlon: 'bi-lightning-charge-fill', strength: 'bi-award-fill', yoga: 'bi-stars' }
  const sportIcon = computed(() => sportIconMap[selectedSport.value] || 'bi-activity')

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicnVubml0IiwiYSI6ImNsZjR...'
  
  const liveMapContainer = ref(null)
  const map = ref(null)
  const isTracking = ref(false)
  const hasStarted = ref(false)
  const elapsedTime = ref(0)
  const totalDistance = ref(0)
  const currentPace = ref(0)
  const elevationGain = ref(0)
  const routeCoordinates = ref([])
  const lastPosition = ref(null)
  const startTime = ref(null)
  const pausedTime = ref(0)
  
  let watchId = null
  let timerInterval = null
  let currentMarker = null
  
  const averagePace = computed(() => {
    if (totalDistance.value === 0 || elapsedTime.value === 0) return 0
    const distanceKm = totalDistance.value / 1000
    const timeMinutes = elapsedTime.value / 60
    return timeMinutes / distanceKm
  })
  
  const initializeMap = async () => {
    mapboxgl.accessToken = MAPBOX_TOKEN

    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000
      })
      const { latitude, longitude } = position.coords

      map.value = new mapboxgl.Map({
        container: liveMapContainer.value,
        style: 'mapbox://styles/mapbox/outdoors-v12',
        center: [longitude, latitude],
        zoom: 15
      })

      map.value.on('load', () => {
        // Add route source
        map.value.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        })

        // Add route layer
        map.value.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#C46A2A',
            'line-width': 4,
            'line-opacity': 0.8
          }
        })

        // Add current position marker
        currentMarker = new mapboxgl.Marker({ color: '#10b981' })
          .setLngLat([longitude, latitude])
          .addTo(map.value)
      })
    } catch (error) {
      console.error('Geolocation error:', error)
      alert('Please enable location access to use live tracking')
    }
  }
  
  const startTracking = async () => {
    isTracking.value = true
    hasStarted.value = true
    startTime.value = Date.now() - pausedTime.value
  
    // Start GPS tracking
    watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 5000 },
      (position, err) => {
        if (err) { handlePositionError(err); return }
        handlePositionUpdate(position)
      }
    )
  
    // Start timer
    timerInterval = setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
    }, 1000)
  }
  
  const pauseTracking = async () => {
    isTracking.value = false
    pausedTime.value = elapsedTime.value * 1000
  
    // Stop GPS tracking
    if (watchId !== null) {
      await Geolocation.clearWatch({ id: watchId })
      watchId = null
    }
  
    // Stop timer
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }
  
  const resumeTracking = () => {
    startTracking()
  }
  
  const stopTracking = async () => {
    if (!confirm('Finish this activity?')) return
  
    pauseTracking()
  
    // Encode route as polyline
    const encodedPolyline = encodePolyline(routeCoordinates.value)
  
    // Navigate to create activity page with pre-filled data
    router.push({
      path: '/dashboard',
      query: {
        autoCreate: 'true',
        distance: totalDistance.value.toFixed(0),
        duration: elapsedTime.value,
        polyline: encodedPolyline,
        elevation: elevationGain.value.toFixed(0)
      }
    })
  }
  
  const handlePositionUpdate = (position) => {
    const { latitude, longitude, altitude } = position.coords
    const newCoord = [longitude, latitude]
  
    // Update current marker
    if (currentMarker) {
      currentMarker.setLngLat(newCoord)
    }
  
    // Center map on current position
    if (map.value) {
      map.value.easeTo({ center: newCoord })
    }
  
    // Calculate distance from last position
    if (lastPosition.value) {
      const distance = calculateDistance(
        lastPosition.value[1],
        lastPosition.value[0],
        latitude,
        longitude
      )
      totalDistance.value += distance
  
      // Calculate current pace (last 10 seconds)
      const timeDiff = (Date.now() - lastPosition.value[2]) / 1000 / 60 // minutes
      currentPace.value = timeDiff / (distance / 1000) // min/km
  
      // Calculate elevation gain
      if (lastPosition.value[3] && altitude) {
        const elevDiff = altitude - lastPosition.value[3]
        if (elevDiff > 0) {
          elevationGain.value += elevDiff
        }
      }
    }
  
    // Add to route
    routeCoordinates.value.push(newCoord)
    lastPosition.value = [longitude, latitude, Date.now(), altitude]
  
    // Broadcast live location if sharing
    safetyStore.broadcastLocation({ latitude, longitude })

    // Sync music to current pace
    if (currentPace.value > 0 && currentPace.value < 60) {
      musicStore.syncToPace(currentPace.value)
    }

    // Update route on map
    if (map.value && map.value.getSource('route')) {
      map.value.getSource('route').setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: routeCoordinates.value
        }
      })
    }
  }
  
  const handlePositionError = (error) => {
    console.error('Position error:', error)
  }

  const toggleLiveShare = async () => {
    if (safetyStore.liveShareActive) {
      await safetyStore.stopLiveShare()
    } else {
      await safetyStore.startLiveShare()
    }
  }
  
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula
    const R = 6371e3 // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180
  
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
    return R * c // meters
  }
  
  const encodePolyline = (coordinates) => {
    // Simple polyline encoding (use a library for production)
    let encoded = ''
    let prevLat = 0
    let prevLng = 0
  
    for (const coord of coordinates) {
      const lat = Math.round(coord[1] * 1e5)
      const lng = Math.round(coord[0] * 1e5)
  
      const dlat = lat - prevLat
      const dlng = lng - prevLng
  
      encoded += encodeValue(dlat) + encodeValue(dlng)
  
      prevLat = lat
      prevLng = lng
    }
  
    return encoded
  }
  
  const encodeValue = (value) => {
    let encoded = ''
    let v = value < 0 ? ~(value << 1) : value << 1
  
    while (v >= 0x20) {
      encoded += String.fromCharCode((0x20 | (v & 0x1f)) + 63)
      v >>= 5
    }
  
    encoded += String.fromCharCode(v + 63)
    return encoded
  }
  
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
  
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
  
  const formatPace = (pace) => {
    if (!pace || pace === Infinity) return '--:--'
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  onMounted(() => {
    initializeMap()
  })
  
  onUnmounted(() => {
    if (watchId !== null) {
      Geolocation.clearWatch({ id: watchId })
    }
    if (timerInterval) {
      clearInterval(timerInterval)
    }
    if (map.value) {
      map.value.remove()
    }
  })
  </script>
  
  <style scoped>
  .live-tracker {
    --r-olive: #5A6B4E;
    --r-accent: #C46A2A;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  .sport-picker-row { background: rgba(255,255,255,.85); border-radius: 16px; padding: 12px; }
  .active-sport-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(90,107,78,.15); border-radius: 999px; padding: 6px 14px; font-size: .85rem; font-weight: 800; color: #2C3726; text-transform: capitalize; }

  .live-share-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(255,255,255,.98), rgba(255,255,255,.92));
    border: 1px solid rgba(15,18,16,.10);
    border-radius: 16px;
    padding: 14px 16px;
  }
  .share-info { display: flex; align-items: center; gap: 12px; }
  .share-info > i { font-size: 1.3rem; color: #5A6B4E; }
  .share-label { font-weight: 800; font-size: .9rem; }
  .share-sub { font-size: .78rem; color: #6b7280; }
  .share-toggle {
    padding: 8px 18px;
    border-radius: 999px;
    border: 2px solid rgba(15,18,16,.15);
    background: rgba(15,18,16,.06);
    font-weight: 900;
    font-size: .8rem;
    cursor: pointer;
    transition: all .2s;
    color: #6b7280;
  }
  .share-toggle.active {
    background: #10b981;
    border-color: #10b981;
    color: white;
    box-shadow: 0 0 0 4px rgba(16,185,129,.2);
  }
  
  .tracker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
    border: 1px solid rgba(15,18,16,0.10);
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 4px 16px rgba(15,18,16,0.08);
  }
  
  .tracker-status {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 700;
    color: rgba(15,18,16,0.80);
  }
  
  .status-indicator {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #94a3b8;
    transition: all 0.3s;
  }
  
  .status-indicator.active {
    background: #10b981;
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  
  .tracker-time {
    font-size: 2rem;
    font-weight: 900;
    color: var(--r-accent);
    font-family: 'Courier New', monospace;
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .live-stat {
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
    border: 1px solid rgba(15,18,16,0.10);
    border-radius: 16px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 4px 16px rgba(15,18,16,0.08);
  }
  
  .stat-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(15,18,16,0.60);
    margin-bottom: 8px;
  }
  
  .stat-value {
    font-size: 1.8rem;
    font-weight: 900;
    color: rgba(15,18,16,0.92);
    font-family: 'Courier New', monospace;
  }
  
  .stat-value .unit {
    font-size: 1rem;
    font-weight: 600;
    color: rgba(15,18,16,0.50);
    margin-left: 4px;
  }
  
  .live-map-container {
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(15,18,16,0.15);
  }
  
  .live-map {
    width: 100%;
    height: 400px;
  }
  
  .tracker-controls {
    display: flex;
    gap: 12px;
  }
  
  .control-btn {
    flex: 1;
    height: 56px;
    border-radius: 16px;
    border: none;
    font-weight: 900;
    font-size: 1.05rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(15,18,16,0.12);
  }
  
  .control-btn i {
    font-size: 1.3rem;
  }
  
  .control-btn-primary {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }
  
  .control-btn-primary:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3);
  }
  
  .control-btn-warning {
    background: linear-gradient(135deg, #f59e0b, #d97706);
    color: white;
  }
  
  .control-btn-warning:hover {
    background: linear-gradient(135deg, #d97706, #b45309);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.3);
  }
  
  .control-btn-danger {
    background: linear-gradient(135deg, #ef4444, #dc2626);
    color: white;
  }
  
  .control-btn-danger:hover {
    background: linear-gradient(135deg, #dc2626, #b91c1c);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
  }
  
  @media (max-width: 768px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }
    
    .tracker-time {
      font-size: 1.5rem;
    }
  }
  </style>