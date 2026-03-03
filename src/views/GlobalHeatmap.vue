<template>
    <main class="heatmap-page">
      <div ref="mapContainer" class="map"></div>

      <!-- Controls -->
      <div class="panel">
        <div class="panel-title">GLOBAL HEATMAP</div>
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label small mb-1">Sport</label>
            <select v-model="sport" class="form-select form-select-sm" @change="applyFilters">
              <option value="All">All Sports</option>
              <option>Running</option>
              <option>Cycling</option>
              <option>Walking</option>
              <option>Hiking</option>
              <option>Swimming</option>
              <option>Other</option>
            </select>
          </div>

          <div class="col-6">
            <label class="form-label small mb-1">Intensity {{ heatOpacity }}%</label>
            <input type="range" min="10" max="100" step="5" v-model.number="heatOpacity"
                   class="form-range" @input="updateHeatmapPaint" />
          </div>

          <div class="col-12">
            <label class="form-label small mb-1">Color theme</label>
            <select v-model="colorTheme" class="form-select form-select-sm" @change="updateHeatmapPaint">
              <option value="fire">Fire</option>
              <option value="purple">Purple</option>
              <option value="mobileblue">Blue</option>
              <option value="viridis">Viridis</option>
            </select>
          </div>

          <div class="col-12">
            <label class="form-label small mb-1">Map style</label>
            <select v-model="mapStyle" class="form-select form-select-sm" @change="switchStyle">
              <option value="dark-v11">Dark (recommended)</option>
              <option value="light-v11">Light</option>
              <option value="satellite-v9">Satellite</option>
              <option value="outdoors-v12">Outdoors</option>
            </select>
          </div>
        </div>
      </div>
    </main>
  </template>

  <script setup>
  import mapboxgl from 'mapbox-gl'
  import 'mapbox-gl/dist/mapbox-gl.css'
  import { onMounted, onBeforeUnmount, ref } from 'vue'

  mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || ''

  const mapContainer = ref(null)
  const sport = ref('All')
  const heatOpacity = ref(80)
  const colorTheme = ref('fire')
  const mapStyle = ref('dark-v11')
  const useStaticFile = ref(false)

  let map
  const sourceId = 'runnit-geojson'
  const heatLayerId = 'runnit-heat'
  const pointLayerId = 'runnit-points'

  const styleUrl = (name) => `mapbox://styles/mapbox/${name}`

  // init
  onMounted(() => {
    map = new mapboxgl.Map({
      container: mapContainer.value,
      style: styleUrl(mapStyle.value),
      center: [-98.5795, 39.8283], // continental US center
      zoom: 4,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.addControl(new mapboxgl.ScaleControl(), 'bottom-left')

    map.on('load', async () => {
      map.addSource(sourceId, { type: 'geojson', data: emptyFC() })

      map.addLayer({
        id: heatLayerId,
        type: 'heatmap',
        source: sourceId,
        maxzoom: 15,
        paint: {
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 18, 13, 30],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.8, 13, 1.6],
          'heatmap-color': themeColors(colorTheme.value),
          'heatmap-opacity': heatOpacity.value / 100
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

      await loadData()
    })
  })

  onBeforeUnmount(() => { if (map) map.remove() })

  function switchStyle() {
    if (!map) return
    map.setStyle(styleUrl(mapStyle.value))
    map.once('style.load', () => {
      // Re-add source + layers after style swap
      map.addSource(sourceId, { type: 'geojson', data: map.__RAW_FILTERED__ || emptyFC() })
      map.addLayer({
        id: heatLayerId, type: 'heatmap', source: sourceId, maxzoom: 15,
        paint: {
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 18, 13, 30],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.8, 13, 1.6],
          'heatmap-color': themeColors(colorTheme.value),
          'heatmap-opacity': heatOpacity.value / 100
        }
      })
      map.addLayer({
        id: pointLayerId, type: 'circle', source: sourceId, minzoom: 13,
        paint: {
          'circle-radius': 2.5, 'circle-color': '#fff',
          'circle-stroke-color': '#000', 'circle-stroke-width': 0.5, 'circle-opacity': 0.5
        }
      })
    })
  }
  
  function emptyFC(){ return { type: 'FeatureCollection', features: [] } }
  
  // DEMO: random points generator
  function generateSamplePoints(center=[-122.4194,37.7749], count=2000) {
    const sports = ['Running','Cycling','Walking','Hiking','Other']
    const fc = emptyFC()
    for (let i=0; i<count; i++) {
      const lng = center[0] + (Math.random()-0.5)*0.6
      const lat = center[1] + (Math.random()-0.5)*0.6
      fc.features.push({
        type:'Feature',
        properties:{ sport: sports[i % sports.length] },
        geometry:{ type:'Point', coordinates:[lng,lat] }
      })
    }
    return fc
  }
  
  // Load either /data/activities.geojson or random demo points
  async function loadData(){
    let data
    if (useStaticFile.value) {
      try {
        const res = await fetch('/data/activities.geojson', { cache: 'no-store' })
        data = await res.json()
      } catch (e) {
        console.warn('No /data/activities.geojson found; falling back to demo data.')
        data = generateSamplePoints()
      }
    } else {
      data = generateSamplePoints()
    }
    // store raw on the map instance for client-side filtering
    map.__RAW_DATA__ = data
    applyFilters()
  }
  
  // client-side filter by sport (for demo/static)
  function applyFilters(){
    const raw = map.__RAW_DATA__ || emptyFC()
    const filtered = (sport.value === 'All')
      ? raw
      : {
          type:'FeatureCollection',
          features: raw.features.filter(f => f.properties?.sport === sport.value)
        }
    const src = map.getSource(sourceId)
    if (src) src.setData(filtered)
  }
  
  function themeColors(name){
    switch(name){
      case 'fire':
        return ['interpolate',['linear'],['heatmap-density'],
          0,'rgba(255,255,255,0)', 0.2,'#ffe08a', 0.4,'#ffc46b',
          0.6,'#ff914d', 0.8,'#ff5c33', 1,'#ff1f1f'
        ]
      case 'viridis':
        return ['interpolate',['linear'],['heatmap-density'],
          0,'rgba(255,255,255,0)', 0.2,'#440154', 0.4,'#3b528b',
          0.6,'#21918c', 0.8,'#5ec962', 1,'#fde725'
        ]
      case 'mobileblue':
        return ['interpolate',['linear'],['heatmap-density'],
          0,'rgba(255,255,255,0)', 0.2,'#cfe8ff', 0.4,'#99ccff',
          0.6,'#66b2ff', 0.8,'#3385ff', 1,'#0057e7'
        ]
      case 'purple':
      default:
        return ['interpolate',['linear'],['heatmap-density'],
          0,'rgba(255,255,255,0)', 0.2,'#f3e8ff', 0.4,'#d8b4fe',
          0.6,'#a855f7', 0.8,'#7e22ce', 1,'#5b21b6'
        ]
    }
  }
  
  function updateHeatmapPaint(){
    if (!map || !map.getLayer(heatLayerId)) return
    map.setPaintProperty(heatLayerId, 'heatmap-color', themeColors(colorTheme.value))
    map.setPaintProperty(heatLayerId, 'heatmap-opacity', heatOpacity.value / 100)
  }
  </script>
  
  <style scoped>
  /* full screen between fixed nav/footer */
  .heatmap-page{
    --nav-h:100px;   
    padding-top: var(--nav-h);    /* match your TopNav */
    --footer-h:40px;  /* match your Footer */
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    position: relative;
  }
  .map{ position:absolute; inset:0; }
  .panel{
    position:absolute; top:16px; left:16px; z-index:2;
    width: 280px; background:#fff; border-radius:0; padding:12px;
  }
  .card{ border:1px solid #eee; }
  .form-label{ color:#444; }
  .small{ font-size:.85rem; }
  </style>
  