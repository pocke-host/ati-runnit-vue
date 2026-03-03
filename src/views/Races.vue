<!-- src/views/Races.vue — Events page, powered by RunSignup API -->
<!--
  BACKEND SETUP (Spring Boot):
  Add to your controller a GET /api/events endpoint that proxies:
    GET https://runsignup.com/Rest/races?format=json
      &results_per_page=24&page={page}
      &event_type={eventType}   ← running | cycling | triathlon | swimming | hiking | walking | obstacle
      &future_events_only=T
      &zipcode={zip}&radius=50   (when zip provided)
  No API key required for public race reads.
  Return the races[] array directly.
-->
<template>
  <main class="events-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl d-flex align-items-center justify-content-between gap-4">
        <div class="hero-copy">
          <p class="eyebrow mb-2">Event Calendar</p>
          <h1 class="display-5 fw-bold mb-2">Find your next<br>start line.</h1>
          <p class="lead mb-0">
            Races, rides, triathlons, swims, and obstacle courses — filter by sport, location, and month.
          </p>
        </div>
        <div class="hero-art d-none d-lg-block" aria-hidden="true">
          <div class="hero-panel">
            <div class="panel-kicker">UPCOMING EVENTS</div>
            <div class="panel-row">
              <span class="panel-pill">🏃 Running</span>
              <span class="panel-pill">🚴 Cycling</span>
              <span class="panel-pill">🏊 Triathlon</span>
            </div>
            <div class="panel-sub">Every sport. Every distance. One calendar.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SPORT TYPE TABS -->
    <div class="sport-tabs-wrap">
      <div class="container-xxl">
        <div class="sport-tabs">
          <button
            v-for="s in sportTypes"
            :key="s.value"
            class="sport-tab"
            :class="{ active: selectedSport === s.value }"
            @click="setActiveSport(s.value)"
          >
            <span class="sport-emoji">{{ s.emoji }}</span>
            {{ s.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- FILTERS -->
    <section class="filters border-bottom">
      <div class="container-xxl">
        <form class="row g-2 align-items-center" @submit.prevent>
          <div class="col-12 col-md">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input v-model.trim="q" class="form-control" placeholder="Search events, city, name…" />
            </div>
          </div>

          <div class="col-6 col-md-2">
            <input v-model.trim="zipcode" class="form-control" placeholder="ZIP code" maxlength="10" />
          </div>

          <div class="col-6 col-md-2">
            <select v-model="month" class="form-select">
              <option value="">Any month</option>
              <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <select v-model="sort" class="form-select">
              <option value="soon">Soonest first</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          <div class="col-6 col-md-auto text-md-end">
            <button type="button" class="btn btn-outline-secondary w-100" @click="resetFilters">Clear</button>
          </div>
        </form>

        <!-- Distance chips (shown for running only) -->
        <div v-if="selectedSport === 'running'" class="chips mt-3 d-flex flex-wrap gap-2">
          <button
            v-for="chip in runningChips"
            :key="chip"
            class="btn btn-chip"
            :class="{ active: chipActive === chip }"
            @click="chipActive = chipActive === chip ? '' : chip"
          >
            {{ chip }}
          </button>
        </div>
      </div>
    </section>

    <!-- RESULTS -->
    <section class="results">
      <div class="container-xxl">

        <!-- Loading -->
        <div v-if="loading" class="events-loading">
          <div class="spinner-border" role="status"></div>
          <p>Loading events…</p>
        </div>

        <!-- Error state -->
        <div v-else-if="apiError" class="events-error">
          <i class="bi bi-wifi-off"></i>
          <p>{{ apiError }}</p>
          <button class="btn btn-outline-dark btn-sm" @click="fetchEvents">Retry</button>
        </div>

        <template v-else>
          <div class="d-flex justify-content-between align-items-center mb-3">
            <p class="mb-0 text-muted small">
              {{ filteredEvents.length }} event{{ filteredEvents.length !== 1 ? 's' : '' }}
              <span v-if="usingLiveData" class="live-badge ms-2">Live</span>
              <span v-else class="sample-badge ms-2">Sample</span>
            </p>
          </div>

          <div v-if="filteredEvents.length === 0" class="events-empty">
            <i class="bi bi-calendar-x"></i>
            <p>No events found. Try adjusting your filters.</p>
          </div>

          <div v-else class="row g-4">
            <div v-for="event in pagedEvents" :key="event.id" class="col-12 col-md-6 col-lg-4">
              <article class="event-card h-100">
                <div class="event-img" :style="getCardStyle(event)">
                  <span class="badge date-badge">{{ formatDateShort(event.date) }}</span>
                  <span class="badge sport-badge">{{ event.sportEmoji }} {{ event.sport }}</span>
                </div>
                <div class="card-body">
                  <h3 class="h5 mb-1">{{ event.name }}</h3>
                  <p class="text-muted mb-1 small">
                    <i class="bi bi-geo-alt me-1"></i>{{ event.city }}<span v-if="event.state">, {{ event.state }}</span> · {{ event.country }}
                  </p>
                  <div class="event-distances mb-2">
                    <span v-for="d in event.distances" :key="d" class="dist-pill">{{ d }}</span>
                  </div>
                  <p class="small mb-3 event-desc">{{ event.summary }}</p>

                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small text-muted">
                      <i class="bi bi-calendar-event me-1"></i>{{ formatDateLong(event.date) }}
                    </span>
                    <div class="d-flex gap-2">
                      <a v-if="event.url" :href="event.url" target="_blank" rel="noopener" class="btn btn-outline-dark btn-sm">Details</a>
                      <a v-if="event.registerUrl" :href="event.registerUrl" target="_blank" rel="noopener" class="btn btn-primary btn-sm">Register</a>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <!-- Load more -->
          <div v-if="pagedEvents.length < filteredEvents.length" class="text-center mt-4">
            <button class="btn btn-outline-dark" @click="perPage += 9">Load more</button>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

/* ── Sport types ── */
const sportTypes = [
  { value: 'all',      emoji: '🏅', label: 'All Sports' },
  { value: 'running',  emoji: '🏃', label: 'Running' },
  { value: 'cycling',  emoji: '🚴', label: 'Cycling' },
  { value: 'triathlon',emoji: '🏊', label: 'Triathlon' },
  { value: 'swimming', emoji: '🏊', label: 'Swimming' },
  { value: 'hiking',   emoji: '🥾', label: 'Hiking' },
  { value: 'obstacle', emoji: '🧗', label: 'Obstacle' },
  { value: 'walking',  emoji: '🚶', label: 'Walking' },
]

const sportEmojiMap = {
  running: '🏃', cycling: '🚴', triathlon: '🏊', swimming: '🏊',
  hiking: '🥾', obstacle: '🧗', walking: '🚶', other: '🏅'
}

/* ── Filters state ── */
const selectedSport = ref('all')
const q = ref('')
const zipcode = ref('')
const month = ref('')
const sort = ref('soon')
const chipActive = ref('')
const perPage = ref(9)

const months = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September'},{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
]
const runningChips = ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra', 'Trail']

/* ── API data ── */
const loading = ref(false)
const apiError = ref('')
const events = ref([])
const usingLiveData = ref(false)

/* ── Normalize RunSignup race → our event shape ── */
const normalizeRunSignup = (race) => {
  const r = race.race || race
  const distances = (r.events || []).map(e => {
    const dist = parseFloat(e.distance)
    const unit = (e.distance_unit_id || '').toLowerCase()
    if (!dist) return e.name
    if (unit === 'km' || unit === 'k') {
      if (dist === 5) return '5K'
      if (dist === 10) return '10K'
      if (dist === 21.1 || dist === 21) return 'Half Marathon'
      if (dist === 42.2 || dist === 42) return 'Marathon'
      return `${dist}K`
    }
    if (unit === 'm' || unit === 'mi') {
      return `${dist} mi`
    }
    return e.name || `${dist} ${unit}`
  }).filter(Boolean).slice(0, 3)

  const eventType = (r.event_type || r.tag_list || 'running').toLowerCase()
  const sport = sportTypes.find(s => s.value !== 'all' && eventType.includes(s.value))?.value || 'running'

  return {
    id: r.race_id || Math.random(),
    name: r.name || 'Untitled Event',
    date: r.next_date || r.last_date || '',
    sport,
    sportEmoji: sportEmojiMap[sport] || '🏅',
    city: r.address?.city || '',
    state: r.address?.state || '',
    country: r.address?.country_code || 'US',
    distances: distances.length ? distances : ['Open'],
    summary: r.description ? r.description.replace(/<[^>]*>/g, '').slice(0, 120) + '…' : `${r.name} in ${r.address?.city || 'your area'}.`,
    url: r.url || '',
    registerUrl: r.url || '',
    image: r.logo_url || ''
  }
}

/* ── Fetch from backend proxy ── */
const fetchEvents = async () => {
  loading.value = true
  apiError.value = ''

  try {
    const params = { page: 1, results_per_page: 48 }
    if (selectedSport.value !== 'all') params.event_type = selectedSport.value
    if (zipcode.value.trim()) params.zipcode = zipcode.value.trim()

    const { data } = await axios.get(`${API_URL}/events`, { params, timeout: 8000 })

    // RunSignup returns { races: [...] } or we return the array directly from proxy
    const rawRaces = Array.isArray(data) ? data : (data.races || [])
    events.value = rawRaces.map(normalizeRunSignup)
    usingLiveData.value = true
  } catch {
    // Fall back to sample data — backend proxy not configured yet
    events.value = sampleEvents
    usingLiveData.value = false
    // Don't show error — sample data is enough for browsing
  } finally {
    loading.value = false
  }
}

/* ── Filtering + sorting ── */
const today = new Date(); today.setHours(0, 0, 0, 0)

const filteredEvents = computed(() => {
  let r = events.value.filter(e => !e.date || new Date(e.date) >= today)

  if (selectedSport.value !== 'all') {
    r = r.filter(e => e.sport === selectedSport.value)
  }

  if (q.value) {
    const needle = q.value.toLowerCase()
    r = r.filter(x =>
      x.name.toLowerCase().includes(needle) ||
      x.city.toLowerCase().includes(needle) ||
      x.summary.toLowerCase().includes(needle)
    )
  }

  if (month.value) r = r.filter(x => (x.date || '').slice(5, 7) === month.value)

  if (chipActive.value) {
    r = r.filter(x => x.distances.some(d => d.includes(chipActive.value)))
  }

  if (sort.value === 'soon') r.sort((a, b) => new Date(a.date) - new Date(b.date))
  else r.sort((a, b) => a.name.localeCompare(b.name))

  return r
})

const pagedEvents = computed(() => filteredEvents.value.slice(0, perPage.value))

/* ── Helpers ── */
const setActiveSport = (sport) => {
  selectedSport.value = sport
  chipActive.value = ''
  perPage.value = 9
  fetchEvents()
}

const resetFilters = () => {
  q.value = ''; zipcode.value = ''; month.value = ''
  sort.value = 'soon'; chipActive.value = ''; selectedSport.value = 'all'
  perPage.value = 9
  fetchEvents()
}

const sportBgColors = {
  running: 'linear-gradient(135deg, #1a1a1a, #333)',
  cycling: 'linear-gradient(135deg, #1a2d1a, #3a5a3a)',
  triathlon: 'linear-gradient(135deg, #0a1a2a, #1a3a5a)',
  swimming: 'linear-gradient(135deg, #0a1a2d, #1a3a5a)',
  hiking: 'linear-gradient(135deg, #1a1a0a, #3a3a1a)',
  obstacle: 'linear-gradient(135deg, #2d0a0a, #5a1a1a)',
  walking: 'linear-gradient(135deg, #1a1a1a, #3a3a3a)',
  other: 'linear-gradient(135deg, #1a1a1a, #444)'
}

const getCardStyle = (event) => {
  if (event.image) return { backgroundImage: `url(${event.image})` }
  return { background: sportBgColors[event.sport] || sportBgColors.other }
}

const formatDateShort = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
const formatDateLong = (iso) => {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

/* ── Sample data (fallback when API not configured) ── */
const sampleEvents = [
  {
    id: 1, name: 'LA Marathon', date: '2026-03-15', sport: 'running', sportEmoji: '🏃',
    city: 'Los Angeles', state: 'CA', country: 'US',
    distances: ['Marathon', 'Half Marathon'],
    summary: 'Iconic course through 26 LA neighborhoods — from Dodger Stadium to Santa Monica.',
    url: 'https://www.lamarathon.com', registerUrl: 'https://www.lamarathon.com',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1200&auto=format'
  },
  {
    id: 2, name: 'Escape From Alcatraz Triathlon', date: '2026-06-07', sport: 'triathlon', sportEmoji: '🏊',
    city: 'San Francisco', state: 'CA', country: 'US',
    distances: ['Olympic'],
    summary: 'Swim from the island, bike the Marin Headlands, run the coastal trails.',
    url: 'https://www.escapealcatraztri.com', registerUrl: 'https://www.escapealcatraztri.com',
    image: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=1200&auto=format'
  },
  {
    id: 3, name: 'Gran Fondo NYC', date: '2026-05-17', sport: 'cycling', sportEmoji: '🚴',
    city: 'New York', state: 'NY', country: 'US',
    distances: ['100 mi', '62 mi', '32 mi'],
    summary: 'Mass-start road cycling event across the George Washington Bridge into New Jersey.',
    url: 'https://granfondonYC.com', registerUrl: 'https://granfondonYC.com',
    image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?q=80&w=1200&auto=format'
  },
  {
    id: 4, name: 'Tough Mudder Chicago', date: '2026-08-01', sport: 'obstacle', sportEmoji: '🧗',
    city: 'Chicago', state: 'IL', country: 'US',
    distances: ['10 mi', '5K'],
    summary: '20+ military-style obstacles, mud, ice baths, and electric shocks. Not for the faint of heart.',
    url: 'https://www.toughmudder.com', registerUrl: 'https://www.toughmudder.com',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1200&auto=format'
  },
  {
    id: 5, name: 'BSAC National Open Water Championships', date: '2026-07-12', sport: 'swimming', sportEmoji: '🏊',
    city: 'Lake District', state: '', country: 'UK',
    distances: ['1500m', '750m'],
    summary: 'Open-water competition in the stunning English Lake District. All levels welcome.',
    url: '#', registerUrl: '#',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=1200&auto=format'
  },
  {
    id: 6, name: 'REI Half Dome Hike Challenge', date: '2026-09-20', sport: 'hiking', sportEmoji: '🥾',
    city: 'Yosemite', state: 'CA', country: 'US',
    distances: ['17 mi'],
    summary: 'Guided group ascent to Half Dome. Permit included for lottery winners.',
    url: '#', registerUrl: '#',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format'
  },
  {
    id: 7, name: 'Boston Marathon', date: '2026-04-20', sport: 'running', sportEmoji: '🏃',
    city: 'Boston', state: 'MA', country: 'US',
    distances: ['Marathon'],
    summary: 'The world\'s oldest annual marathon. Hopkinton to Boylston Street.',
    url: 'https://www.baa.org', registerUrl: 'https://www.baa.org',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1200&auto=format'
  },
  {
    id: 8, name: 'Ironman Coeur d\'Alene', date: '2026-06-28', sport: 'triathlon', sportEmoji: '🏊',
    city: 'Coeur d\'Alene', state: 'ID', country: 'US',
    distances: ['140.6 mi'],
    summary: '2.4-mile swim, 112-mile bike, 26.2-mile run through Idaho\'s panhandle.',
    url: 'https://www.ironman.com', registerUrl: 'https://www.ironman.com',
    image: 'https://images.unsplash.com/photo-1549576490-b0b4831ef60a?q=80&w=1200&auto=format'
  },
  {
    id: 9, name: 'Tour de Cure Denver', date: '2026-06-14', sport: 'cycling', sportEmoji: '🚴',
    city: 'Denver', state: 'CO', country: 'US',
    distances: ['100 mi', '62 mi', '30 mi', '10 mi'],
    summary: 'ADA fundraiser ride through the Rocky Mountain foothills. All abilities welcome.',
    url: '#', registerUrl: '#',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format'
  },
  {
    id: 10, name: 'Run Wild Missoula', date: '2026-07-04', sport: 'running', sportEmoji: '🏃',
    city: 'Missoula', state: 'MT', country: 'US',
    distances: ['Half Marathon', '10K', '5K'],
    summary: 'Beloved summer race through the streets and trails of downtown Missoula.',
    url: '#', registerUrl: '#',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1200&auto=format'
  },
  {
    id: 11, name: 'Spartan Sprint NYC', date: '2026-05-09', sport: 'obstacle', sportEmoji: '🧗',
    city: 'East Rutherford', state: 'NJ', country: 'US',
    distances: ['3–5 mi'],
    summary: '20+ obstacles, barbed wire, fire, and sandbag carries. Entry-level Spartan race.',
    url: 'https://www.spartan.com', registerUrl: 'https://www.spartan.com',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format'
  },
  {
    id: 12, name: 'Big Sur International Marathon', date: '2026-04-26', sport: 'running', sportEmoji: '🏃',
    city: 'Big Sur', state: 'CA', country: 'US',
    distances: ['Marathon', '21 mi', '10.6 mi', '9 mi', '5K'],
    summary: 'Point-to-point along Highway 1 — the most scenic marathon in America.',
    url: 'https://www.bsim.org', registerUrl: 'https://www.bsim.org',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1200&auto=format'
  }
]

onMounted(fetchEvents)

// Re-fetch when zipcode changes (with debounce)
let zipDebounce = null
watch(zipcode, () => {
  clearTimeout(zipDebounce)
  zipDebounce = setTimeout(fetchEvents, 600)
})
</script>

<style scoped>
.events-page {
  --r-black: #000;
  --r-border: #E5E5E5;
  min-height: 100vh;
  background: #fff;
  font-family: Futura, "Futura PT", "Avenir Next", system-ui, sans-serif;
}

/* HERO */
.hero {
  padding: 48px 0;
  border-bottom: 1px solid rgba(15,18,16,0.08);
  background: #000;
  color: #fff;
}
.eyebrow {
  letter-spacing: .16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.55);
  font-weight: 800;
  font-size: 0.78rem;
}
.hero .lead { color: rgba(255,255,255,0.72) !important; }

.hero-art {
  width: 380px;
  min-height: 180px;
  background: #111;
  border: 1px solid rgba(255,255,255,0.14);
  position: relative;
}
.hero-panel {
  position: absolute;
  inset: 16px;
  padding: 14px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.10);
}
.panel-kicker {
  font-weight: 900;
  letter-spacing: .14em;
  font-size: .72rem;
  color: rgba(255,255,255,0.70);
  margin-bottom: 12px;
}
.panel-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
.panel-pill {
  padding: 6px 10px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.14);
  color: rgba(255,255,255,0.85);
  font-weight: 700;
  font-size: .78rem;
}
.panel-sub { color: rgba(255,255,255,0.60); font-size: 0.80rem; font-weight: 600; }

/* SPORT TABS */
.sport-tabs-wrap {
  background: #fff;
  border-bottom: 1px solid var(--r-border);
  position: sticky;
  top: 64px;
  z-index: 10;
}
.sport-tabs {
  display: flex;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.sport-tabs::-webkit-scrollbar { display: none; }
.sport-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(15,18,16,0.50);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.sport-tab:hover { color: rgba(15,18,16,0.80); }
.sport-tab.active {
  color: #000;
  border-bottom-color: #000;
}
.sport-emoji { font-size: 1rem; }

/* FILTERS */
.filters { background: #fff; padding: 16px 0; }
.input-group-text {
  background: #F9F9F9;
  border-color: var(--r-border);
}
.form-control, .form-select {
  border-color: var(--r-border);
  border-radius: 0;
}
.form-control:focus, .form-select:focus {
  border-color: #000;
  box-shadow: none;
}
.btn-chip {
  border: 1px solid var(--r-border);
  background: #fff;
  border-radius: 0;
  padding: .28rem .85rem;
  font-weight: 700;
  font-size: .85rem;
  font-family: inherit;
}
.btn-chip.active { border-color: #000; background: #f0f0f0; }

/* RESULTS */
.results { padding: 28px 0 80px; }

/* Loading / Error / Empty */
.events-loading, .events-error, .events-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 300px;
  color: rgba(15,18,16,0.50);
}
.events-error i, .events-empty i { font-size: 2.5rem; }
.events-error p, .events-empty p { font-size: 0.95rem; margin: 0; }

/* Badges */
.live-badge {
  display: inline-block;
  background: #10b981;
  color: #fff;
  font-size: 0.60rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  text-transform: uppercase;
}
.sample-badge {
  display: inline-block;
  background: rgba(15,18,16,0.15);
  color: rgba(15,18,16,0.60);
  font-size: 0.60rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  padding: 2px 6px;
  text-transform: uppercase;
}

/* Event cards */
.event-card {
  border: 1px solid var(--r-border);
  border-radius: 0;
  overflow: hidden;
  background: #fff;
  box-shadow: none;
}
.event-img {
  position: relative;
  height: 160px;
  background: #1a1a1a center/cover no-repeat;
}
.badge {
  border-radius: 0;
  padding: .35rem .6rem;
  font-size: .72rem;
  font-weight: 700;
}
.date-badge {
  position: absolute; left: 12px; top: 12px;
  background: rgba(255,255,255,0.92);
  color: #000;
  border: 1px solid rgba(15,18,16,0.10);
}
.sport-badge {
  position: absolute; right: 12px; top: 12px;
  background: #000;
  color: #fff;
}
.card-body { padding: 16px; }
.event-distances {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.dist-pill {
  font-size: 0.70rem;
  font-weight: 700;
  padding: 2px 8px;
  border: 1px solid var(--r-border);
  color: rgba(15,18,16,0.60);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.event-desc {
  color: rgba(15,18,16,0.60);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Buttons */
.btn-primary {
  --bs-btn-bg: #000;
  --bs-btn-border-color: #000;
  --bs-btn-hover-bg: #333;
  --bs-btn-hover-border-color: #333;
  border-radius: 0;
}
.btn-outline-dark { border-radius: 0; }
.btn-outline-secondary { border-color: var(--r-border); border-radius: 0; }
.btn-outline-secondary:hover { background: rgba(15,18,16,0.04); }

@media (max-width: 992px) {
  .hero { padding: 32px 0; }
  .hero-art { display: none; }
}
</style>
