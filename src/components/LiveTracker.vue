<!-- ========== LiveTracker.vue ========== -->
<template>
    <div class="live-tracker">
      <!-- Header -->
      <div class="tracker-header">
        <div class="tracker-status">
          <div :class="['status-indicator', { active: isTracking }]"></div>
          <span>{{ isTracking ? 'Tracking...' : 'Paused' }}</span>
        </div>
        <div class="tracker-time">{{ formatTime(elapsedTime) }}</div>
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
          :disabled="saving"
        >
          <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="bi bi-stop-fill"></i>
          {{ saving ? 'Saving...' : 'Finish' }}
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, computed } from 'vue'
  import { useRouter } from 'vue-router'
  import mapboxgl from 'mapbox-gl'
  import 'mapbox-gl/dist/mapbox-gl.css'
  import axios from 'axios'

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  const router = useRouter()

  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

  const sports = [
    { value: 'RUN',  emoji: '🏃', label: 'Run'  },
    { value: 'BIKE', emoji: '🚴', label: 'Bike' },
    { value: 'SWIM', emoji: '🏊', label: 'Swim' },
    { value: 'HIKE', emoji: '🥾', label: 'Hike' },
    { value: 'WALK', emoji: '🚶', label: 'Walk' },
  ]

  const selectedSport = ref('RUN')
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
  const saving = ref(false)
  const saveError = ref('')

  let watchId = null
  let timerInterval = null
  let currentMarker = null
  
  const averagePace = computed(() => {
    if (totalDistance.value === 0 || elapsedTime.value === 0) return 0
    const distanceKm = totalDistance.value / 1000
    const timeMinutes = elapsedTime.value / 60
    return timeMinutes / distanceKm
  })
  
  const initializeMap = () => {
    mapboxgl.accessToken = MAPBOX_TOKEN
  
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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
        },
        (error) => {
          console.error('Geolocation error:', error)
          alert('Please enable location access to use live tracking')
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }
  
  const startTracking = () => {
    isTracking.value = true
    hasStarted.value = true
    startTime.value = Date.now() - pausedTime.value
  
    // Start GPS tracking
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        handlePositionUpdate,
        handlePositionError,
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      )
    }
  
    // Start timer
    timerInterval = setInterval(() => {
      elapsedTime.value = Math.floor((Date.now() - startTime.value) / 1000)
    }, 1000)
  }
  
  const pauseTracking = () => {
    isTracking.value = false
    pausedTime.value = elapsedTime.value * 1000
  
    // Stop GPS tracking
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
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
    saving.value = true
    saveError.value = ''

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        `${API_URL}/activities`,
        {
          sportType: selectedSport.value,
          durationSeconds: elapsedTime.value,
          distanceMeters: Math.round(totalDistance.value),
          elevationGain: Math.round(elevationGain.value),
          routePolyline: routeCoordinates.value.length
            ? encodePolyline(routeCoordinates.value)
            : null
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      )
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to save activity:', err)
      saveError.value = 'Failed to save activity. Tap Finish again to retry.'
      saving.value = false
      // Resume tracking so the user doesn't lose their data
      startTracking()
    }
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
      navigator.geolocation.clearWatch(watchId)
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
  
  .sport-selector {
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
    border: 1px solid rgba(15,18,16,0.10);
    border-radius: 16px;
    padding: 16px 20px;
    box-shadow: 0 4px 16px rgba(15,18,16,0.08);
  }

  .sport-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(15,18,16,0.60);
    margin-bottom: 12px;
  }

  .sport-options {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .sport-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(15,18,16,0.12);
    background: rgba(255,255,255,0.70);
    cursor: pointer;
    transition: all 0.2s;
    flex: 1;
    min-width: 60px;
  }

  .sport-btn:hover {
    background: rgba(255,255,255,0.95);
    border-color: var(--r-accent);
  }

  .sport-btn.active {
    background: var(--r-accent);
    border-color: var(--r-accent);
    color: white;
    box-shadow: 0 4px 12px rgba(196,106,42,0.30);
  }

  .sport-emoji {
    font-size: 1.5rem;
    line-height: 1;
  }

  .sport-name {
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .save-error {
    background: rgba(239,68,68,0.10);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    padding: 12px 16px;
    color: #dc2626;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
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