<template>
    <main class="heatmap-page">
      <div id="map" class="map"></div>
  
      <!-- Controls -->
      <div class="panel card shadow-sm">
        <div class="row g-2">
          <div class="col-6">
            <label class="form-label small mb-1">Sport</label>
            <select v-model="sport" class="form-select form-select-sm" @change="applyFilters">
              <option value="All">All</option>
              <option>Running</option>
              <option>Cycling</option>
              <option>Walking</option>
              <option>Hiking</option>
              <option>Other</option>
            </select>
          </div>
  
          <div class="col-6">
            <label class="form-label small mb-1">Opacity {{ heatOpacity }}%</label>
            <input type="range" min="10" max="100" step="5" v-model.number="heatOpacity"
                   class="form-range" @input="updateHeatmapPaint" />
          </div>
  
          <div class="col-12">
            <label class="form-label small mb-1">Color theme</label>
            <select v-model="colorTheme" class="form-select form-select-sm" @change="updateHeatmapPaint">
              <option value="purple">RUNNIT Purple</option>
              <option value="fire">Fire</option>
              <option value="mobileblue">Mobile Blue</option>
              <option value="viridis">Viridis</option>
            </select>
          </div>
  
          <div class="col-12">
            <div class="form-check mt-1">
              <input id="useStatic" class="form-check-input" type="checkbox" v-model="useStaticFile"
                     @change="loadData" />
              <label class="form-check-label small" for="useStatic">
                Load from <code>/data/activities.geojson</code> (if present)
              </label>
            </div>
          </div>
        </div>
      </div>
    </main>
  </template>
  
  <script setup>
  import 'maplibre-gl/dist/maplibre-gl.css'
  import maplibregl from 'maplibre-gl'
  import { onMounted, onBeforeUnmount, ref } from 'vue'
  
  const sport = ref('All')
  const heatOpacity = ref(100)
  const colorTheme = ref('purple')
  const useStaticFile = ref(false)   // toggle between demo/random vs static file
  
  let map
  const sourceId = 'runnit-geojson'
  const heatLayerId = 'runnit-heat'
  const pointLayerId = 'runnit-points'
  
  // init
  onMounted(() => {
    map = new maplibregl.Map({
      container: 'map',
      style: 'https://demotiles.maplibre.org/style.json', // free MapLibre basemap
      center: [-122.4194, 37.7749], // SF
      zoom: 9,
      attributionControl: true
    })
    map.addControl(new maplibregl.NavigationControl(), 'top-right')
  
    map.on('load', async () => {
      map.addSource(sourceId, { type: 'geojson', data: emptyFC() })
  
      map.addLayer({
        id: heatLayerId,
        type: 'heatmap',
        source: sourceId,
        maxzoom: 15,
        paint: {
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 16, 13, 26],
          'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 0.7, 13, 1.4],
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
          'circle-radius': 2,
          'circle-color': '#fff',
          'circle-stroke-color': '#000',
          'circle-stroke-width': 0.5,
          'circle-opacity': 0.4
        }
      })
  
      await loadData()
      map.on('moveend', applyFilters) // keep same data; just filter in client
    })
  })
  
  onBeforeUnmount(() => { if (map) map.remove() })
  
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
    width: 280px; background:#fff; border-radius:12px; padding:12px;
  }
  .card{ border:1px solid #eee; }
  .form-label{ color:#444; }
  .small{ font-size:.85rem; }
  </style>
  