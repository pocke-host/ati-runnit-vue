<!-- src/views/Races.vue — powered by RunSignup public API (no key required) -->
<!--
  RunSignup REST API: https://runsignup.com/Rest/races?format=json
  Public endpoint — no auth needed for race discovery.
  Calls RunSignup directly from the browser; falls back to backend proxy
  at GET /api/events if CORS blocks the direct call.

  Sport detection is done client-side by matching keywords in the race name/description
  because RunSignup's event_type values ("running_race", "nonprofit_event", etc.) don't
  map cleanly to our UI sports. We filter for running & triathlon keyword sets.
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
            Running races and triathlons — filter by distance, location, and date.
          </p>
        </div>
        <div class="hero-art d-none d-lg-block" aria-hidden="true">
          <div class="hero-panel">
            <div class="panel-kicker">UPCOMING EVENTS</div>
            <div class="panel-row">
              <span class="panel-pill">🏃 Running</span>
              <span class="panel-pill">🏊 Triathlon</span>
            </div>
            <div class="panel-chips">
              <span class="panel-chip">5K</span>
              <span class="panel-chip">Half Marathon</span>
              <span class="panel-chip">Marathon</span>
              <span class="panel-chip">70.3</span>
              <span class="panel-chip">Ironman</span>
            </div>
            <div class="panel-sub">Live data · RunSignup + FindARace</div>
          </div>
        </div>
      </div>
    </section>

    <!-- SPORT TABS -->
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
    <section class="filters">
      <div class="container-xxl">
        <form class="filter-row" @submit.prevent>
          <div class="filter-search">
            <i class="bi bi-search filter-search-icon"></i>
            <input v-model.trim="q" class="filter-input" placeholder="Search by name or city…" />
          </div>

          <input v-model.trim="zipcode" class="filter-input filter-input--sm" placeholder="ZIP code" maxlength="10" />

          <select v-model="month" class="filter-select">
            <option value="">Any month</option>
            <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>

          <select v-model="sort" class="filter-select">
            <option value="soon">Soonest first</option>
            <option value="name">Name A–Z</option>
          </select>

          <button type="button" class="filter-clear" @click="resetFilters">
            <i class="bi bi-x-lg"></i> Clear
          </button>
        </form>

        <!-- Distance chips — change by sport -->
        <div class="chips">
          <button
            v-for="chip in activeChips"
            :key="chip"
            class="chip-btn"
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

        <AppSpinner v-if="loading" label="Loading events…" />

        <div v-else-if="apiError" class="events-error">
          <i class="bi bi-wifi-off"></i>
          <p>{{ apiError }}</p>
          <button class="retry-btn" @click="fetchEvents">Retry</button>
        </div>

        <template v-else>
          <div class="results-meta">
            <span class="results-count">
              {{ filteredEvents.length }} event{{ filteredEvents.length !== 1 ? 's' : '' }}
            </span>
            <span v-if="usingLiveData" class="live-badge">● Live</span>
            <span v-else class="sample-badge">Sample data</span>
          </div>

          <EmptyState
            v-if="filteredEvents.length === 0"
            icon="bi-calendar-x"
            title="No events found"
            message="Try adjusting your filters or clearing your search."
            action-label="Clear filters"
            @action="resetFilters"
          />

          <div v-else class="events-grid">
            <article v-for="event in pagedEvents" :key="event.id" class="event-card">
              <div class="event-img" :style="getCardStyle(event)">
                <span class="date-badge">{{ formatDateShort(event.date) }}</span>
                <span class="sport-badge">{{ event.sportEmoji }} {{ event.sportLabel }}</span>
                <span v-if="event.isPast" class="past-badge">Past</span>
              </div>
              <div class="event-body">
                <h3 class="event-name">{{ event.name }}</h3>
                <p class="event-location">
                  <i class="bi bi-geo-alt"></i>
                  {{ event.city }}<span v-if="event.state">, {{ event.state }}</span>
                </p>
                <div class="event-distances">
                  <span v-for="d in event.distances" :key="d" class="dist-pill">{{ d }}</span>
                </div>
                <p class="event-desc">{{ event.summary }}</p>
                <div class="event-footer">
                  <span class="event-date-full">
                    <i class="bi bi-calendar-event"></i>
                    {{ formatDateLong(event.date) }}
                  </span>
                  <div class="event-actions">
                    <a v-if="event.url" :href="event.url" target="_blank" rel="noopener" class="btn-details">Details</a>
                    <a v-if="event.registerUrl" :href="event.registerUrl" target="_blank" rel="noopener" class="btn-register">Register</a>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div v-if="pagedEvents.length < filteredEvents.length" class="load-more-wrap">
            <button class="load-more-btn" @click="perPage += 12">Load more</button>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const RUNSIGNUP_BASE = 'https://runsignup.com/Rest/races'

/* ─── Sport types (running + triathlon) ─────────────── */
const sportTypes = [
  { value: 'all',       emoji: '🏅', label: 'All Events' },
  { value: 'running',   emoji: '🏃', label: 'Running' },
  { value: 'triathlon', emoji: '🏊', label: 'Triathlon' },
]

const sportEmojiMap = { running: '🏃', triathlon: '🏊' }
const sportLabelMap = { running: 'Running', triathlon: 'Triathlon' }

/* ─── Distance chips per sport ───────────────────────── */
const runningChips   = ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra', 'Trail']
const triathlonChips = ['Sprint', 'Olympic', '70.3', 'Ironman']

const activeChips = computed(() => {
  if (selectedSport.value === 'running')   return runningChips
  if (selectedSport.value === 'triathlon') return triathlonChips
  return [...runningChips, ...triathlonChips]
})

/* ─── Filter state ───────────────────────────────────── */
const selectedSport = ref('all')
const q             = ref('')
const zipcode       = ref('')
const month         = ref('')
const sort          = ref('soon')
const chipActive    = ref('')
const perPage       = ref(12)

const months = [
  { value: '01', label: 'January' },  { value: '02', label: 'February' },
  { value: '03', label: 'March' },    { value: '04', label: 'April' },
  { value: '05', label: 'May' },      { value: '06', label: 'June' },
  { value: '07', label: 'July' },     { value: '08', label: 'August' },
  { value: '09', label: 'September' },{ value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
]

/* ─── API state ──────────────────────────────────────── */
const loading      = ref(false)
const apiError     = ref('')
const events       = ref([])
const usingLiveData = ref(false)

/* ─── Sport detection from race name / description ───── */
// RunSignup's event_type values (running_race, nonprofit_event, etc.) don't map
// to our UI — detect sport client-side from the race name.
const TRI_KEYWORDS  = /triath|ironman|70\.3|half.?iron|swim.?bike.?run|duathlon|aquabike/i
const RUN_KEYWORDS  = /run|race|marathon|5k|10k|ultra|trail|road race|fun run|relay/i

const detectSport = (r) => {
  const text = `${r.name || ''} ${r.description || ''}`.toLowerCase()
  if (TRI_KEYWORDS.test(text)) return 'triathlon'
  if (RUN_KEYWORDS.test(text)) return 'running'
  return 'running' // default — RunSignup is primarily a running platform
}

/* ─── Distance extraction from race name ─────────────── */
// RunSignup doesn't always return an `events` sub-array in the basic races endpoint;
// extract distance labels from the race name instead.
const extractDistances = (r) => {
  const name = (r.name || '').toLowerCase()
  const found = []

  // Triathlon distances
  if (/ironman 70\.3|half.?iron|70\.3/i.test(name)) found.push('70.3')
  else if (/ironman|140\.6/i.test(name)) found.push('Ironman')
  if (/olympic/i.test(name) && TRI_KEYWORDS.test(name)) found.push('Olympic')
  if (/sprint/i.test(name) && TRI_KEYWORDS.test(name)) found.push('Sprint')

  // Running distances
  if (/\bmarathon\b/i.test(name) && !/half/i.test(name)) found.push('Marathon')
  if (/half.?marathon|half\s*marathon/i.test(name)) found.push('Half Marathon')
  if (/\b10k\b|\b10\s*km\b/i.test(name)) found.push('10K')
  if (/\b5k\b|\b5\s*km\b/i.test(name)) found.push('5K')
  if (/\bultral?\b/i.test(name)) found.push('Ultra')
  if (/\btrail\b/i.test(name)) found.push('Trail')

  // Sub-events from the events[] array when present
  if (r.events?.length) {
    for (const e of r.events.slice(0, 3)) {
      const dist = parseFloat(e.distance)
      const unit = (e.distance_unit_id || '').toLowerCase()
      if (!dist) continue
      if (unit === 'km' || unit === 'k') {
        if (dist === 5)            found.push('5K')
        else if (dist === 10)      found.push('10K')
        else if (dist >= 21 && dist <= 21.2) found.push('Half Marathon')
        else if (dist >= 42 && dist <= 42.2) found.push('Marathon')
        else                       found.push(`${dist}K`)
      } else if (unit === 'm' || unit === 'mi') {
        if (dist === 26.2 || dist === 26) found.push('Marathon')
        else if (dist === 13.1)    found.push('Half Marathon')
        else                       found.push(`${dist} mi`)
      }
    }
  }

  // Deduplicate and cap
  return [...new Set(found)].slice(0, 4)
}

/* ─── Normalise RunSignup race → our event shape ─────── */
const normalizeRace = (race) => {
  const r = race.race || race
  const sport     = detectSport(r)
  const distances = extractDistances(r)
  const city      = r.address?.city  || ''
  const state     = r.address?.state || ''

  return {
    id:          r.race_id || Math.random(),
    name:        r.name    || 'Untitled Event',
    date:        r.next_date || r.last_date || '',
    sport,
    sportEmoji:  sportEmojiMap[sport]  || '🏅',
    sportLabel:  sportLabelMap[sport]  || sport,
    city,
    state,
    distances:   distances.length ? distances : ['Open'],
    summary:     r.description
                   ? r.description.replace(/<[^>]*>/g, '').slice(0, 140) + '…'
                   : `${r.name} in ${city || 'your area'}.`,
    url:         r.url || '',
    registerUrl: r.url || '',
    image:       r.logo_url || '',
  }
}

/* ─── Fetch: RunSignup + FindARace in parallel ─────────── */
const fetchEvents = async () => {
  loading.value  = true
  apiError.value = ''

  const params = new URLSearchParams({
    format:             'json',
    future_events_only: 'T',
    results_per_page:   '50',
    page:               '1',
  })
  if (zipcode.value.trim()) params.set('zipcode', zipcode.value.trim())

  let rawRaces = null
  let farEvents = []

  // Run RunSignup + FindARace in parallel
  const [rsResult, farResult] = await Promise.allSettled([
    // RunSignup: try direct first, then proxy
    (async () => {
      try {
        const { data } = await axios.get(`${RUNSIGNUP_BASE}?${params}`, { timeout: 8000 })
        return Array.isArray(data) ? data : (data.races || [])
      } catch { /* CORS — try proxy */ }
      const proxyParams = { page: 1, results_per_page: 50, future_events_only: 'T' }
      if (zipcode.value.trim()) proxyParams.zipcode = zipcode.value.trim()
      const { data } = await axios.get(`${API_URL}/events`, { params: proxyParams, timeout: 8000 })
      return Array.isArray(data) ? data : (data.races || [])
    })(),
    // FindARace backend proxy
    axios.get(`${API_URL}/events/findarace`, { timeout: 15000 }).then(r => r.data),
  ])

  // Process RunSignup results
  if (rsResult.status === 'fulfilled' && rsResult.value?.length) {
    rawRaces = rsResult.value
    usingLiveData.value = true
  }

  // Process FindARace results (already normalized)
  if (farResult.status === 'fulfilled' && Array.isArray(farResult.value)) {
    farEvents = farResult.value
    usingLiveData.value = true
  }

  // If both sources failed, use sample data
  if (!rawRaces && farEvents.length === 0) {
    events.value    = sampleEvents
    usingLiveData.value = false
    loading.value   = false
    return
  }

  // Normalize RunSignup races
  const rsNormalized = (rawRaces || [])
    .map(normalizeRace)
    .filter(e => e.sport === 'running' || e.sport === 'triathlon')

  // Merge: deduplicate by name+date
  const seen = new Set()
  const merged = []
  for (const ev of [...rsNormalized, ...farEvents]) {
    const key = `${ev.name}|${ev.date}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(ev)
    }
  }

  events.value = merged
  loading.value = false
}

/* ─── Client-side filtering + sorting ───────────────── */
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

  if (month.value) {
    // RunSignup date format: MM/DD/YYYY — also handle ISO YYYY-MM-DD
    r = r.filter(x => {
      const d = x.date
      if (!d) return false
      if (d.includes('/')) return d.startsWith(month.value + '/')          // MM/DD/YYYY
      return d.slice(5, 7) === month.value                                  // YYYY-MM-DD
    })
  }

  if (chipActive.value) {
    const needle = chipActive.value.toLowerCase()
    r = r.filter(x =>
      x.distances.some(d => d.toLowerCase().includes(needle)) ||
      x.name.toLowerCase().includes(needle)
    )
  }

  if (sort.value === 'soon') {
    r = [...r].sort((a, b) => {
      const da = parseDate(a.date), db = parseDate(b.date)
      return da - db
    })
  } else {
    r = [...r].sort((a, b) => a.name.localeCompare(b.name))
  }

  return r
})

const pagedEvents = computed(() => filteredEvents.value.slice(0, perPage.value))

/* ─── Helpers ────────────────────────────────────────── */
// RunSignup returns dates as MM/DD/YYYY — handle both formats
const parseDate = (d) => {
  if (!d) return new Date(0)
  if (d.includes('/')) {
    const [m, day, y] = d.split('/')
    return new Date(`${y}-${m.padStart(2,'0')}-${day.padStart(2,'0')}`)
  }
  return new Date(d)
}

const formatDateShort = (d) => {
  if (!d) return ''
  return parseDate(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
const formatDateLong = (d) => {
  if (!d) return ''
  return parseDate(d).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

const setActiveSport = (sport) => {
  selectedSport.value = sport
  chipActive.value    = ''
  perPage.value       = 12
  // No re-fetch needed — filtering is client-side
}

const resetFilters = () => {
  q.value = ''; zipcode.value = ''; month.value = ''
  sort.value = 'soon'; chipActive.value = ''; selectedSport.value = 'all'
  perPage.value = 12
}

const sportBgMap = {
  running:   'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)',
  triathlon: 'linear-gradient(135deg, #0a0a1a 0%, #0a2a4a 100%)',
}

const getCardStyle = (event) => {
  if (event.image) return { backgroundImage: `url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return { background: sportBgMap[event.sport] || sportBgMap.running }
}

/* ─── Sample / fallback data ─────────────────────────── */
const sampleEvents = [
  {
    id: 's1', name: 'LA Marathon', date: '2026-03-15', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running',
    city: 'Los Angeles', state: 'CA',
    distances: ['Marathon', 'Half Marathon'],
    summary: 'Iconic 26.2-mile course through LA neighborhoods — Dodger Stadium to Santa Monica.',
    url: 'https://www.lamarathon.com', registerUrl: 'https://www.lamarathon.com', image: '',
  },
  {
    id: 's2', name: 'IRONMAN 70.3 Oceanside', date: '2026-03-28', sport: 'triathlon',
    sportEmoji: '🏊', sportLabel: 'Triathlon',
    city: 'Oceanside', state: 'CA',
    distances: ['70.3'],
    summary: 'Swim, bike, and run along the Southern California coast. A premier half-iron event.',
    url: 'https://www.ironman.com', registerUrl: 'https://www.ironman.com', image: '',
  },
  {
    id: 's3', name: 'Boston Marathon', date: '2026-04-20', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running',
    city: 'Boston', state: 'MA',
    distances: ['Marathon'],
    summary: "The world's oldest annual marathon. Hopkinton to Boylston Street.",
    url: 'https://www.baa.org', registerUrl: 'https://www.baa.org', image: '',
  },
  {
    id: 's4', name: 'Escape From Alcatraz Triathlon', date: '2026-06-07', sport: 'triathlon',
    sportEmoji: '🏊', sportLabel: 'Triathlon',
    city: 'San Francisco', state: 'CA',
    distances: ['Olympic'],
    summary: 'Swim from the island, bike the Marin Headlands, run the coastal trails.',
    url: 'https://www.escapealcatraztri.com', registerUrl: 'https://www.escapealcatraztri.com', image: '',
  },
  {
    id: 's5', name: 'Big Sur International Marathon', date: '2026-04-26', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running',
    city: 'Big Sur', state: 'CA',
    distances: ['Marathon', '21 mi', '10.6 mi', '5K'],
    summary: 'Point-to-point along Highway 1 — the most scenic marathon in America.',
    url: 'https://www.bsim.org', registerUrl: 'https://www.bsim.org', image: '',
  },
  {
    id: 's6', name: 'Ironman Coeur d\'Alene', date: '2026-06-28', sport: 'triathlon',
    sportEmoji: '🏊', sportLabel: 'Triathlon',
    city: 'Coeur d\'Alene', state: 'ID',
    distances: ['Ironman'],
    summary: '2.4-mile swim, 112-mile bike, 26.2-mile run through Idaho\'s panhandle.',
    url: 'https://www.ironman.com', registerUrl: 'https://www.ironman.com', image: '',
  },
  {
    id: 's7', name: 'Run Wild Missoula Half Marathon', date: '2026-07-04', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running',
    city: 'Missoula', state: 'MT',
    distances: ['Half Marathon', '10K', '5K'],
    summary: 'Beloved summer race through the streets of downtown Missoula.',
    url: '#', registerUrl: '#', image: '',
  },
  {
    id: 's8', name: 'Alpha Win Napa Valley Triathlon', date: '2026-04-11', sport: 'triathlon',
    sportEmoji: '🏊', sportLabel: 'Triathlon',
    city: 'Napa', state: 'CA',
    distances: ['Olympic', 'Sprint'],
    summary: 'Multi-distance triathlon through Napa Valley wine country.',
    url: '#', registerUrl: '#', image: '',
  },
]

onMounted(fetchEvents)

// Re-fetch when zipcode changes (debounced)
let zipTimer = null
watch(zipcode, () => {
  clearTimeout(zipTimer)
  zipTimer = setTimeout(fetchEvents, 700)
})
</script>

<style scoped>
.events-page {
  min-height: 100vh;
  background: var(--rk-paper, #FAF8FF);
  font-family: Futura, "Futura PT", "Avenir Next", system-ui, sans-serif;
  padding-top: var(--nav-h, 64px);
}

/* HERO */
.hero {
  padding: 48px 0;
  background: #000;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.eyebrow {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.50);
}
.hero .lead { color: rgba(255,255,255,0.70) !important; }

.hero-art {
  width: 360px;
  min-height: 160px;
  background: #111;
  border: 1px solid rgba(255,255,255,0.12);
  position: relative;
}
.hero-panel {
  position: absolute;
  inset: 16px;
  padding: 16px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
}
.panel-kicker {
  font-weight: 900;
  letter-spacing: 0.14em;
  font-size: 0.68rem;
  color: rgba(255,255,255,0.55);
  margin-bottom: 12px;
}
.panel-row { display: flex; gap: 8px; margin-bottom: 10px; }
.panel-pill {
  padding: 5px 10px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.80);
  font-weight: 700;
  font-size: 0.76rem;
}
.panel-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
.panel-chip {
  padding: 3px 8px;
  border: 1px solid rgba(139,43,226,0.40);
  color: rgba(139,43,226,0.90);
  font-size: 0.70rem;
  font-weight: 700;
}
.panel-sub { color: rgba(255,255,255,0.40); font-size: 0.72rem; font-weight: 600; }

/* SPORT TABS */
.sport-tabs-wrap {
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
  position: sticky;
  top: var(--nav-h, 64px);
  z-index: 10;
}
.sport-tabs {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}
.sport-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  color: rgba(15,18,16,0.45);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
  letter-spacing: 0.04em;
}
.sport-tab:hover { color: rgba(15,18,16,0.80); }
.sport-tab.active { color: #000; border-bottom-color: var(--rk-signal, #8B2BE2); }
.sport-emoji { font-size: 1rem; }

/* FILTERS */
.filters {
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
  padding: 14px 0 12px;
}
.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.filter-search {
  flex: 1;
  min-width: 200px;
  position: relative;
}
.filter-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #767676;
  font-size: 0.9rem;
}
.filter-input {
  width: 100%;
  height: 40px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 0 12px 0 36px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #000;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.filter-input:focus { border-color: var(--rk-signal, #8B2BE2); }
.filter-input--sm { flex: 0 0 140px; padding-left: 12px; }
.filter-select {
  height: 40px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  padding: 0 32px 0 12px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #000;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 5 5-5' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
  box-sizing: border-box;
}
.filter-select:focus { border-color: var(--rk-signal, #8B2BE2); }
.filter-clear {
  height: 40px;
  padding: 0 16px;
  border: 1px solid #E5E5E5;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  color: #767676;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: border-color 0.15s, color 0.15s;
}
.filter-clear:hover { border-color: #000; color: #000; }

/* Distance chips */
.chips { display: flex; gap: 6px; flex-wrap: wrap; }
.chip-btn {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #E5E5E5;
  background: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  color: #767676;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  letter-spacing: 0.04em;
}
.chip-btn:hover { border-color: #000; color: #000; }
.chip-btn.active {
  border-color: var(--rk-signal, #8B2BE2);
  color: var(--rk-signal, #8B2BE2);
  background: rgba(139,43,226,0.06);
}

/* RESULTS */
.results { padding: 24px 0 80px; }

.results-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}
.results-count {
  font-size: 0.82rem;
  font-weight: 700;
  color: #767676;
  letter-spacing: 0.04em;
}
.live-badge {
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: #16a34a;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 2px 7px;
}
.sample-badge {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #767676;
  background: rgba(15,18,16,0.05);
  padding: 2px 7px;
}

/* Events grid */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.event-card {
  background: #fff;
  border: 1px solid #E5E5E5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.event-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.09);
}

.event-img {
  position: relative;
  height: 140px;
  background: #1a1a1a;
  flex-shrink: 0;
}

.date-badge {
  position: absolute;
  left: 12px;
  top: 12px;
  background: rgba(255,255,255,0.93);
  color: #000;
  font-size: 0.72rem;
  font-weight: 900;
  padding: 4px 8px;
  letter-spacing: 0.04em;
  border: 1px solid rgba(15,18,16,0.08);
}
.sport-badge {
  position: absolute;
  right: 12px;
  top: 12px;
  background: #000;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 4px 8px;
  letter-spacing: 0.04em;
}
.past-badge {
  position: absolute;
  left: 12px;
  bottom: 12px;
  background: #dc2626;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 6px;
}

.event-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.event-name {
  font-size: 1rem;
  font-weight: 900;
  color: #000;
  margin: 0 0 6px;
  line-height: 1.3;
}
.event-location {
  font-size: 0.80rem;
  color: #767676;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.event-distances {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 10px;
}
.dist-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border: 1px solid #E5E5E5;
  color: rgba(15,18,16,0.55);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.event-desc {
  font-size: 0.82rem;
  color: rgba(15,18,16,0.60);
  line-height: 1.55;
  margin: 0 0 auto;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-bottom: 14px;
}
.event-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #E5E5E5;
  margin-top: auto;
}
.event-date-full {
  font-size: 0.76rem;
  color: #767676;
  display: flex;
  align-items: center;
  gap: 4px;
}
.event-actions { display: flex; gap: 8px; }

.btn-details {
  height: 34px;
  padding: 0 14px;
  border: 1px solid #E5E5E5;
  background: #fff;
  color: #000;
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: border-color 0.15s;
}
.btn-details:hover { border-color: #000; }

.btn-register {
  height: 34px;
  padding: 0 14px;
  border: none;
  background: var(--rk-signal, #8B2BE2);
  color: #fff;
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background 0.15s;
}
.btn-register:hover { background: #7722CC; }

/* Error */
.events-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 280px;
  color: rgba(15,18,16,0.50);
}
.events-error i { font-size: 2.5rem; }
.events-error p  { font-size: 0.95rem; margin: 0; }
.retry-btn {
  height: 36px;
  padding: 0 20px;
  border: 1px solid #E5E5E5;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
}

/* Load more */
.load-more-wrap { text-align: center; padding-top: 32px; }
.load-more-btn {
  height: 44px;
  padding: 0 40px;
  border: 1px solid #000;
  background: #fff;
  font-size: 0.82rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}
.load-more-btn:hover { background: #000; color: #fff; }

@media (max-width: 768px) {
  .hero { padding: 28px 0; }
  .filter-row { gap: 8px; }
  .filter-input--sm { flex: 1 1 120px; }
  .events-grid { grid-template-columns: 1fr; }
  .sport-tabs { padding: 0 12px; }
  .sport-tab { padding: 12px 16px; font-size: 0.78rem; }
}
</style>
