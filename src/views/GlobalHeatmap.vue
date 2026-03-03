<template>
  <main class="heatmap-page">
    <div ref="mapContainer" class="map"></div>
  </main>
</template>

<script setup>
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { onMounted, onBeforeUnmount, ref } from 'vue'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

const mapContainer = ref(null)

let map
const sourceId = 'runnit-geojson'
const heatLayerId = 'runnit-heat'
const pointLayerId = 'runnit-points'

onMounted(() => {
  map = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/dark-v11',
    center: [-98.5795, 39.8283],
    zoom: 4,
  })
  map.addControl(new mapboxgl.NavigationControl(), 'top-right')
  map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

  map.on('load', () => {
    map.addSource(sourceId, { type: 'geojson', data: emptyFC() })

    map.addLayer({
      id: heatLayerId,
      type: 'heatmap',
      source: sourceId,
      maxzoom: 15,
      paint: {
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 18, 13, 30],
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.8, 13, 1.6],
        'heatmap-color': [
          'interpolate', ['linear'], ['heatmap-density'],
          0, 'rgba(255,255,255,0)', 0.2, '#ffe08a', 0.4, '#ffc46b',
          0.6, '#ff914d', 0.8, '#ff5c33', 1, '#ff1f1f'
        ],
        'heatmap-opacity': 0.8
      }
    })

    map.addLayer({
      id: pointLayerId,
      type: 'circle',
      source: sourceId,
      minzoom: 13,
      paint: {
        'circle-radius': 2.5,
        'circle-color': '#fff',
        'circle-stroke-color': '#000',
        'circle-stroke-width': 0.5,
        'circle-opacity': 0.5
      }
    })

    map.getSource(sourceId).setData(generateSamplePoints())
  })
})

onBeforeUnmount(() => { if (map) map.remove() })

function emptyFC() { return { type: 'FeatureCollection', features: [] } }

function generateSamplePoints() {
  const sports = ['Running', 'Cycling', 'Walking', 'Hiking', 'Swimming', 'Other']
  const fc = emptyFC()
  for (let i = 0; i < 3000; i++) {
    const lng = -98.5795 + (Math.random() - 0.5) * 60
    const lat = 39.8283 + (Math.random() - 0.5) * 30
    fc.features.push({
      type: 'Feature',
      properties: { sport: sports[i % sports.length] },
      geometry: { type: 'Point', coordinates: [lng, lat] }
    })
  }
  return fc
}
</script>

<style scoped>
.heatmap-page {
  --nav-h: 64px;
  position: relative;
  height: 100vh;
}
.map {
  position: absolute;
  top: var(--nav-h);
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
