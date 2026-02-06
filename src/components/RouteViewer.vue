<!-- ========== RouteViewer.vue ========== -->
<template>
    <div class="route-viewer">
      <div v-if="loading" class="route-loading">
        <div class="spinner-border text-primary"></div>
        <p>Loading route...</p>
      </div>
  
      <div v-else-if="error" class="route-error">
        <i class="bi bi-exclamation-triangle"></i>
        <p>{{ error }}</p>
      </div>
  
      <div v-else class="route-container">
        <!-- Map Container -->
        <div ref="mapContainer" class="map-container"></div>
  
        <!-- Route Stats Overlay -->
        <div class="route-stats-overlay">
          <div class="stat-item">
            <div class="stat-icon">📍</div>
            <div class="stat-content">
              <div class="stat-label">Distance</div>
              <div class="stat-value">{{ formatDistance(activity.distanceMeters) }}</div>
            </div>
          </div>
  
          <div class="stat-item">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <div class="stat-label">Duration</div>
              <div class="stat-value">{{ formatDuration(activity.durationSeconds) }}</div>
            </div>
          </div>
  
          <div class="stat-item">
            <div class="stat-icon">⚡</div>
            <div class="stat-content">
              <div class="stat-label">Avg Pace</div>
              <div class="stat-value">{{ formatPace(activity.averagePace) }}</div>
            </div>
          </div>
  
          <div v-if="activity.elevationGain" class="stat-item">
            <div class="stat-icon">⛰️</div>
            <div class="stat-content">
              <div class="stat-label">Elevation</div>
              <div class="stat-value">{{ activity.elevationGain }}m</div>
            </div>
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
          <button class="control-btn" @click="resetView" title="Reset view">
            <i class="bi bi-arrows-fullscreen"></i>
          </button>
          <button class="control-btn" @click="toggleMapStyle" title="Toggle map style">
            <i class="bi bi-map"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted, watch } from 'vue'
  import mapboxgl from 'mapbox-gl'
  import 'mapbox-gl/dist/mapbox-gl.css'
  
  const props = defineProps({
    activity: {
      type: Object,
      required: true
    },
    height: {
      type: String,
      default: '500px'
    }
  })
  
  const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicnVubml0IiwiYSI6ImNsZjR...'
  
  const mapContainer = ref(null)
  const map = ref(null)
  const loading = ref(true)
  const error = ref(null)
  const currentStyle = ref('outdoors-v12')
  
  const mapStyles = {
    'outdoors-v12': 'mapbox://styles/mapbox/outdoors-v12',
    'streets-v12': 'mapbox://styles/mapbox/streets-v12',
    'satellite-v9': 'mapbox://styles/mapbox/satellite-v9',
    'dark-v11': 'mapbox://styles/mapbox/dark-v11'
  }
  
  const decodePolyline = (encoded) => {
    const coordinates = []
    let index = 0
    const len = encoded.length
    let lat = 0
    let lng = 0
  
    while (index < len) {
      let b
      let shift = 0
      let result = 0
      
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      
      const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
      lat += dlat
  
      shift = 0
      result = 0
      
      do {
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      
      const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1))
      lng += dlng
  
      coordinates.push([lng / 1e5, lat / 1e5])
    }
  
    return coordinates
  }
  
  const initializeMap = () => {
    if (!props.activity.routePolyline) {
      error.value = 'No route data available'
      loading.value = false
      return
    }
  
    try {
      mapboxgl.accessToken = MAPBOX_TOKEN
  
      // Decode polyline to coordinates
      const coordinates = decodePolyline(props.activity.routePolyline)
  
      if (coordinates.length === 0) {
        error.value = 'Invalid route data'
        loading.value = false
        return
      }
  
      // Calculate bounds
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      )
  
      // Initialize map
      map.value = new mapboxgl.Map({
        container: mapContainer.value,
        style: mapStyles[currentStyle.value],
        bounds: bounds,
        fitBoundsOptions: {
          padding: 50
        }
      })
  
      map.value.on('load', () => {
        // Add route source
        map.value.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        })
  
        // Add route layer (outline)
        map.value.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.8
          }
        })
  
        // Add route layer (main)
        map.value.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#C46A2A',
            'line-width': 4
          }
        })
  
        // Add start marker
        new mapboxgl.Marker({ color: '#10b981' })
          .setLngLat(coordinates[0])
          .setPopup(new mapboxgl.Popup().setText('Start'))
          .addTo(map.value)
  
        // Add finish marker
        new mapboxgl.Marker({ color: '#ef4444' })
          .setLngLat(coordinates[coordinates.length - 1])
          .setPopup(new mapboxgl.Popup().setText('Finish'))
          .addTo(map.value)
  
        loading.value = false
      })
  
      map.value.on('error', (e) => {
        console.error('Mapbox error:', e)
        error.value = 'Failed to load map'
        loading.value = false
      })
  
    } catch (err) {
      console.error('Failed to initialize map:', err)
      error.value = 'Failed to initialize map'
      loading.value = false
    }
  }
  
  const zoomIn = () => {
    if (map.value) {
      map.value.zoomIn()
    }
  }
  
  const zoomOut = () => {
    if (map.value) {
      map.value.zoomOut()
    }
  }
  
  const resetView = () => {
    if (map.value && props.activity.routePolyline) {
      const coordinates = decodePolyline(props.activity.routePolyline)
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      )
      map.value.fitBounds(bounds, { padding: 50 })
    }
  }
  
  const toggleMapStyle = () => {
    const styles = Object.keys(mapStyles)
    const currentIndex = styles.indexOf(currentStyle.value)
    const nextIndex = (currentIndex + 1) % styles.length
    currentStyle.value = styles[nextIndex]
    
    if (map.value) {
      map.value.setStyle(mapStyles[currentStyle.value])
      
      // Re-add route after style change
      map.value.once('style.load', () => {
        const coordinates = decodePolyline(props.activity.routePolyline)
        
        map.value.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coordinates
            }
          }
        })
  
        map.value.addLayer({
          id: 'route-outline',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#ffffff',
            'line-width': 6,
            'line-opacity': 0.8
          }
        })
  
        map.value.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#C46A2A',
            'line-width': 4
          }
        })
      })
    }
  }
  
  const formatDistance = (meters) => {
    if (!meters) return '—'
    return `${(meters / 1000).toFixed(2)} km`
  }
  
  const formatDuration = (seconds) => {
    if (!seconds) return '—'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }
  
  const formatPace = (pace) => {
    if (!pace) return '—'
    const minutes = Math.floor(pace)
    const seconds = Math.round((pace - minutes) * 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`
  }
  
  onMounted(() => {
    initializeMap()
  })
  
  onUnmounted(() => {
    if (map.value) {
      map.value.remove()
    }
  })
  
  watch(() => props.activity, () => {
    if (map.value) {
      map.value.remove()
    }
    loading.value = true
    error.value = null
    initializeMap()
  })
  </script>
  
  <style scoped>
  .route-viewer {
    position: relative;
    width: 100%;
    --r-olive: #5A6B4E;
    --r-accent: #C46A2A;
  }
  
  .route-loading,
  .route-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    background: linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92));
    border: 1px solid rgba(15,18,16,0.10);
    border-radius: 20px;
    color: rgba(15,18,16,0.60);
  }
  
  .route-loading p,
  .route-error p {
    margin-top: 16px;
    font-weight: 600;
  }
  
  .route-error i {
    font-size: 3rem;
    color: #ef4444;
  }
  
  .route-container {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(15,18,16,0.15);
  }
  
  .map-container {
    width: 100%;
    height: v-bind(height);
    min-height: 400px;
  }
  
  .route-stats-overlay {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 1;
  }
  
  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(15,18,16,0.10);
    border-radius: 16px;
    padding: 12px 16px;
    box-shadow: 0 4px 16px rgba(15,18,16,0.10);
  }
  
  .stat-icon {
    font-size: 1.5rem;
    line-height: 1;
  }
  
  .stat-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .stat-label {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(15,18,16,0.60);
  }
  
  .stat-value {
    font-size: 1.1rem;
    font-weight: 900;
    color: rgba(15,18,16,0.92);
  }
  
  .route-controls {
    position: absolute;
    bottom: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    z-index: 1;
  }
  
  .control-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(15,18,16,0.10);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 16px rgba(15,18,16,0.10);
    font-size: 1.1rem;
    color: rgba(15,18,16,0.70);
  }
  
  .control-btn:hover {
    background: white;
    color: var(--r-accent);
    transform: scale(1.05);
  }
  
  .control-btn:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    .route-stats-overlay {
      top: 10px;
      left: 10px;
      gap: 8px;
    }
  
    .stat-item {
      padding: 8px 12px;
    }
  
    .stat-icon {
      font-size: 1.2rem;
    }
  
    .stat-value {
      font-size: 0.95rem;
    }
  
    .route-controls {
      bottom: 10px;
      right: 10px;
    }
  }
  </style>