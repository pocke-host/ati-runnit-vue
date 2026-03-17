<!-- src/views/Races.vue — All US Sports Edition -->
<!--
  Data sources (parallel fetch):
    1. RunSignup REST API: https://runsignup.com/Rest/races?format=json (no auth)
    2. FindARace backend proxy: GET /api/events/findarace
    3. BikeReg backend proxy:   GET /api/events/bikereg
  Sport detection is client-side keyword matching against race name/description.
  Filtering is entirely client-side — no re-fetch on filter changes.
-->
<template>
  <main class="events-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl d-flex align-items-center justify-content-between gap-4">
        <div class="hero-copy">
          <p class="eyebrow mb-2">Event Calendar</p>
          <h1 class="display-5 fw-bold mb-2">Every sport.<br>Every start line.</h1>
          <p class="lead mb-0">
            Running, cycling, trail, triathlon, OCR, open water, nordic — every race in America.
          </p>
        </div>
        <div class="hero-art d-none d-lg-block" aria-hidden="true">
          <div class="hero-panel">
            <div class="panel-kicker">ALL US EVENTS · LIVE DATA</div>
            <div class="panel-row flex-wrap">
              <span class="panel-pill">🏃 Running</span>
              <span class="panel-pill">🚴 Cycling</span>
              <span class="panel-pill">🏔️ Trail</span>
              <span class="panel-pill">🏊 Triathlon</span>
              <span class="panel-pill">🪖 OCR</span>
              <span class="panel-pill">🌊 Open Water</span>
            </div>
            <div class="panel-sub">RunSignup · FindARace · BikeReg</div>
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

          <select v-model="stateFilter" class="filter-select">
            <option value="">Any state</option>
            <option v-for="st in US_STATES" :key="st.abbr" :value="st.abbr">{{ st.abbr }} — {{ st.name }}</option>
          </select>

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
            <article v-for="event in pagedEvents" :key="event.id" class="event-card" style="cursor:pointer" @click="openRaceDrawer(event)">
              <div class="event-img" :style="getCardStyle(event)">
                <span class="date-badge">{{ formatDateShort(event.date) }}</span>
                <span class="sport-badge">{{ event.sportEmoji }} {{ event.sportLabel }}</span>
                <span v-if="event.isPast" class="past-badge">Past</span>
                <button
                  class="bookmark-btn"
                  :class="{ bookmarked: bookmarkedIds.has(String(event.id)) }"
                  :title="bookmarkedIds.has(String(event.id)) ? 'Remove bookmark' : 'Bookmark race'"
                  @click.prevent="toggleBookmark(event)"
                >
                  <i :class="bookmarkedIds.has(String(event.id)) ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'"></i>
                </button>
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
                    <a v-if="event.url" :href="event.url" target="_blank" rel="noopener" class="btn-details" @click.stop>Details</a>
                    <a v-if="event.registerUrl" :href="event.registerUrl" target="_blank" rel="noopener" class="btn-register" @click.stop>Register</a>
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

  <!-- RACE DETAIL DRAWER -->
  <Teleport to="body">
    <transition name="drawer-slide">
      <div v-if="drawerRace" class="race-drawer" role="dialog" aria-modal="true">
        <!-- Sticky header -->
        <div class="rd-header">
          <button class="rd-close" @click="drawerRace = null"><i class="bi bi-x-lg"></i></button>
          <span class="rd-sport-label">{{ drawerRace.sportEmoji }} {{ drawerRace.sportLabel }}</span>
        </div>

        <div class="rd-scroll">
          <!-- Hero -->
          <div class="rd-hero" :style="getCardStyle(drawerRace)">
            <span class="rd-date-badge">{{ formatDateLong(drawerRace.date) }}</span>
          </div>

          <!-- Title block -->
          <div class="rd-title-block">
            <h2 class="rd-name">{{ drawerRace.name }}</h2>
            <p class="rd-location"><i class="bi bi-geo-alt me-1"></i>{{ drawerRace.city }}<span v-if="drawerRace.state">, {{ drawerRace.state }}</span></p>
            <div class="rd-pills">
              <span v-for="d in drawerRace.distances" :key="d" class="dist-pill">{{ d }}</span>
            </div>
          </div>

          <!-- PACING CALCULATOR — shown for run/trail/tri/duathlon -->
          <div v-if="showPaceCalc" class="rd-section">
            <div class="rd-section-label">Pacing Calculator</div>
            <div class="rd-pace-inputs">
              <select v-model="paceDistance" class="rd-select">
                <option v-for="(_, label) in DISTANCE_MILES" :key="label" :value="label">{{ label }}</option>
              </select>
              <input
                v-model="goalTimeInput"
                class="rd-input"
                placeholder="Goal time H:MM:SS"
                @input="calcSplits"
              />
            </div>
            <div v-if="splits.length" class="rd-splits">
              <div class="rd-splits-head">
                <span>Mile</span><span>Split</span><span>Cumulative</span>
              </div>
              <div v-for="s in splits" :key="s.mile" class="rd-split-row">
                <span>{{ s.mile }}</span>
                <span>{{ s.split }}</span>
                <span>{{ s.cum }}</span>
              </div>
            </div>
          </div>

          <!-- ADD TO CALENDAR -->
          <div class="rd-section">
            <div class="rd-section-label">Add to Calendar</div>
            <div class="rd-cal-btns">
              <a :href="googleCalUrl(drawerRace)" target="_blank" rel="noopener" class="rd-btn-outline">
                <i class="bi bi-google me-2"></i>Google Calendar
              </a>
              <button class="rd-btn-outline" @click="downloadIcs(drawerRace)">
                <i class="bi bi-download me-2"></i>Download .ics
              </button>
            </div>
          </div>

          <!-- TRAINING PLAN — running/trail/tri only -->
          <div v-if="showPaceCalc" class="rd-section">
            <div class="rd-section-label">Training Plan</div>
            <p class="rd-section-sub">Generate a Sunday long-run schedule building to race day.</p>
            <div v-if="planError" class="rd-plan-error">{{ planError }}</div>
            <button
              class="rd-btn-primary"
              :disabled="planGenerating || planGenerated"
              @click="generatePlan(drawerRace)"
            >
              <span v-if="planGenerating" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else-if="planGenerated" class="bi bi-check-lg me-2"></i>
              {{ planGenerated ? 'Plan Added to Calendar' : planGenerating ? 'Generating…' : 'Generate Training Plan' }}
            </button>
          </div>

          <!-- External links -->
          <div class="rd-section rd-links">
            <a v-if="drawerRace.url" :href="drawerRace.url" target="_blank" rel="noopener" class="rd-btn-outline">
              <i class="bi bi-box-arrow-up-right me-2"></i>Race Details
            </a>
            <a v-if="drawerRace.registerUrl" :href="drawerRace.registerUrl" target="_blank" rel="noopener" class="rd-btn-primary">
              Register
            </a>
          </div>
        </div>
      </div>
    </transition>
    <transition name="fade">
      <div v-if="drawerRace" class="drawer-overlay" @click="drawerRace = null"></div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import axios from 'axios'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

/* ─── Bookmarks ───────────────────────────────────────────── */
const bookmarkedIds = ref(new Set())
const bookmarkIdMap = ref({})

const loadBookmarks = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/race-bookmarks`)
    const ids = new Set()
    const idMap = {}
    for (const bm of data) {
      if (bm.externalRaceId) {
        ids.add(String(bm.externalRaceId))
        idMap[String(bm.externalRaceId)] = bm.id
      }
    }
    bookmarkedIds.value = ids
    bookmarkIdMap.value = idMap
  } catch { /* not logged in or API down — silently skip */ }
}

const toggleBookmark = async (event) => {
  const extId = String(event.id)
  if (bookmarkedIds.value.has(extId)) {
    const bmId = bookmarkIdMap.value[extId]
    bookmarkedIds.value = new Set([...bookmarkedIds.value].filter(x => x !== extId))
    try {
      await axios.delete(`${API_URL}/race-bookmarks/${bmId}`)
    } catch {
      bookmarkedIds.value.add(extId)
    }
  } else {
    bookmarkedIds.value = new Set([...bookmarkedIds.value, extId])
    try {
      const dateStr = event.date
        ? (event.date.includes('/')
            ? (() => { const [m, d, y] = event.date.split('/'); return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}` })()
            : event.date)
        : null
      const { data } = await axios.post(`${API_URL}/race-bookmarks`, {
        externalRaceId: extId,
        raceName:       event.name,
        raceDate:       dateStr,
        raceType:       event.sport,
        city:           event.city,
        state:          event.state,
        raceUrl:        event.url || '',
      })
      bookmarkIdMap.value = { ...bookmarkIdMap.value, [extId]: data.id }
    } catch {
      bookmarkedIds.value = new Set([...bookmarkedIds.value].filter(x => x !== extId))
    }
  }
}

/* ─── Sport types (10 sports) ─────────────────────────────── */
const sportTypes = [
  { value: 'all',       emoji: '🏅', label: 'All Events'  },
  { value: 'running',   emoji: '🏃', label: 'Running'     },
  { value: 'trail',     emoji: '🏔️', label: 'Trail'       },
  { value: 'cycling',   emoji: '🚴', label: 'Cycling'     },
  { value: 'gravel',    emoji: '🪨', label: 'Gravel/MTB'  },
  { value: 'triathlon', emoji: '🏊', label: 'Triathlon'   },
  { value: 'duathlon',  emoji: '🔁', label: 'Duathlon'    },
  { value: 'openwater', emoji: '🌊', label: 'Open Water'  },
  { value: 'ocr',       emoji: '🪖', label: 'OCR'         },
  { value: 'nordic',    emoji: '⛷️', label: 'Nordic/Ski'  },
]

const sportEmojiMap = {
  running:   '🏃',
  trail:     '🏔️',
  cycling:   '🚴',
  gravel:    '🪨',
  triathlon: '🏊',
  duathlon:  '🔁',
  openwater: '🌊',
  ocr:       '🪖',
  nordic:    '⛷️',
}

const sportLabelMap = {
  running:   'Running',
  trail:     'Trail',
  cycling:   'Cycling',
  gravel:    'Gravel/MTB',
  triathlon: 'Triathlon',
  duathlon:  'Duathlon',
  openwater: 'Open Water',
  ocr:       'OCR',
  nordic:    'Nordic/Ski',
}

/* ─── Distance chips per sport ───────────────────────────── */
const CHIPS_BY_SPORT = {
  running:   ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra', '1-Mile'],
  trail:     ['5K', '10K', '25K', '50K', '100K', '100mi'],
  cycling:   ['Metric Century', 'Century', 'Gran Fondo', 'Criterium', '25mi', '50mi'],
  gravel:    ['25mi', '50mi', '100mi', '200mi', 'Enduro', 'XC'],
  triathlon: ['Sprint', 'Olympic', '70.3', 'Ironman'],
  duathlon:  ['Sprint', 'Standard', 'Long Course'],
  openwater: ['1K', '2.5K', '5K', '10K'],
  ocr:       ['3mi', '5mi', '13mi', '24hr'],
  nordic:    ['5K', '10K', '25K', '50K'],
}

const ALL_CHIPS = ['5K', 'Half Marathon', 'Marathon', 'Century', 'Triathlon', '70.3', 'Trail', 'OCR']

const activeChips = computed(() => {
  const s = selectedSport.value
  if (s !== 'all' && CHIPS_BY_SPORT[s]) return CHIPS_BY_SPORT[s]
  return ALL_CHIPS
})

/* ─── Filter state ───────────────────────────────────────── */
const selectedSport = ref('all')
const q             = ref('')
const zipcode       = ref('')
const stateFilter   = ref('')
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

const US_STATES = [
  { abbr: 'AL', name: 'Alabama' },      { abbr: 'AK', name: 'Alaska' },
  { abbr: 'AZ', name: 'Arizona' },      { abbr: 'AR', name: 'Arkansas' },
  { abbr: 'CA', name: 'California' },   { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' },  { abbr: 'DE', name: 'Delaware' },
  { abbr: 'FL', name: 'Florida' },      { abbr: 'GA', name: 'Georgia' },
  { abbr: 'HI', name: 'Hawaii' },       { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' },     { abbr: 'IN', name: 'Indiana' },
  { abbr: 'IA', name: 'Iowa' },         { abbr: 'KS', name: 'Kansas' },
  { abbr: 'KY', name: 'Kentucky' },     { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' },        { abbr: 'MD', name: 'Maryland' },
  { abbr: 'MA', name: 'Massachusetts' },{ abbr: 'MI', name: 'Michigan' },
  { abbr: 'MN', name: 'Minnesota' },    { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' },     { abbr: 'MT', name: 'Montana' },
  { abbr: 'NE', name: 'Nebraska' },     { abbr: 'NV', name: 'Nevada' },
  { abbr: 'NH', name: 'New Hampshire' },{ abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' },   { abbr: 'NY', name: 'New York' },
  { abbr: 'NC', name: 'North Carolina' },{ abbr: 'ND', name: 'North Dakota' },
  { abbr: 'OH', name: 'Ohio' },         { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' },       { abbr: 'PA', name: 'Pennsylvania' },
  { abbr: 'RI', name: 'Rhode Island' }, { abbr: 'SC', name: 'South Carolina' },
  { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' },        { abbr: 'UT', name: 'Utah' },
  { abbr: 'VT', name: 'Vermont' },      { abbr: 'VA', name: 'Virginia' },
  { abbr: 'WA', name: 'Washington' },   { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' },    { abbr: 'WY', name: 'Wyoming' },
]

/* ─── API state ──────────────────────────────────────────── */
const loading       = ref(false)
const apiError      = ref('')
const events        = ref([])
const usingLiveData = ref(false)

const RUNSIGNUP_BASE = 'https://runsignup.com/Rest/races'

/* ─── Keyword patterns for sport detection ───────────────── */
const OCR_KEYWORDS       = /spartan|tough.?mudder|warrior.?dash|mud.?run|obstacle.?course|battlefrog|rugged.?maniac|savage.?race|goruck|bonefrog/i
const NORDIC_KEYWORDS    = /\bnordic\b|snowshoe.?race|ski.?marathon|cross.?country.?ski|skate.?ski|birkebeiner|loppet|vasaloppet/i
const OPENWATER_KEYWORDS = /open.?water\s*swim|lake\s*swim|ocean\s*swim|river\s*swim|bay\s*swim|\bows\b/i
const DUATHLON_KEYWORDS  = /\bduathlon\b|run[\s-]bike[\s-]run|powerman/i
const TRI_KEYWORDS       = /triath|ironman|70\.3|half.?iron|swim.?bike.?run|aquabike/i
const GRAVEL_KEYWORDS    = /gravel\s*ride|gravel\s*race|dirty\s*kanza|unbound\s*gravel|mountain\s*bike\s*race|\bxco\b|enduro\s*race|cyclocross|fat\s*bike/i
const CYCLING_KEYWORDS   = /\bcriterium\b|\bcrit\b|gran\s*fondo|century\s*ride|bike\s*century|tour\s*de\b|velodrome|road\s*race.*bike/i
const TRAIL_KEYWORDS     = /trail\s*run|mountain\s*run|skyrace|sky\s*race|single\s*track\s*run/i
const RUN_KEYWORDS       = /run|race|marathon|5k|10k|ultra|road\s*race|fun\s*run|relay/i

const detectSport = (r) => {
  const text = `${r.name || ''} ${r.description || ''}`
  if (OCR_KEYWORDS.test(text))       return 'ocr'
  if (NORDIC_KEYWORDS.test(text))    return 'nordic'
  if (OPENWATER_KEYWORDS.test(text)) return 'openwater'
  if (DUATHLON_KEYWORDS.test(text))  return 'duathlon'
  if (TRI_KEYWORDS.test(text))       return 'triathlon'
  if (GRAVEL_KEYWORDS.test(text))    return 'gravel'
  if (CYCLING_KEYWORDS.test(text))   return 'cycling'
  if (TRAIL_KEYWORDS.test(text))     return 'trail'
  if (RUN_KEYWORDS.test(text))       return 'running'
  return 'running'
}

/* ─── Distance extraction from race name ─────────────────── */
const extractDistances = (r) => {
  const name = (r.name || '').toLowerCase()
  const found = []

  // Triathlon distances
  if (/ironman 70\.3|half.?iron|70\.3/i.test(name)) found.push('70.3')
  else if (/ironman|140\.6/i.test(name)) found.push('Ironman')
  if (/olympic/i.test(name) && TRI_KEYWORDS.test(name)) found.push('Olympic')
  if (/sprint/i.test(name) && TRI_KEYWORDS.test(name)) found.push('Sprint')

  // Cycling distances
  if (/century/i.test(name) && !/metric/i.test(name)) found.push('Century')
  if (/metric.?century/i.test(name)) found.push('Metric Century')
  if (/gran.?fondo/i.test(name)) found.push('Gran Fondo')
  if (/criterium|\bcrit\b/i.test(name)) found.push('Criterium')

  // OCR distances
  if (/beast|ultra\s*beast/i.test(name) && OCR_KEYWORDS.test(name)) found.push('13mi')
  else if (/super/i.test(name) && OCR_KEYWORDS.test(name)) found.push('5mi')
  else if (/sprint|fire/i.test(name) && OCR_KEYWORDS.test(name)) found.push('3mi')

  // Running distances
  if (/\bmarathon\b/i.test(name) && !/half/i.test(name)) found.push('Marathon')
  if (/half.?marathon|half\s*marathon/i.test(name)) found.push('Half Marathon')
  if (/\b10k\b|\b10\s*km\b/i.test(name)) found.push('10K')
  if (/\b5k\b|\b5\s*km\b/i.test(name)) found.push('5K')
  if (/\b25k\b/i.test(name)) found.push('25K')
  if (/\b50k\b/i.test(name)) found.push('50K')
  if (/\b100k\b/i.test(name)) found.push('100K')
  if (/100.?mi|100\s*mile/i.test(name)) found.push('100mi')
  if (/\bultral?\b/i.test(name)) found.push('Ultra')
  if (/\btrail\b/i.test(name) && TRAIL_KEYWORDS.test(name)) found.push('Trail')

  // Sub-events from events[] array when present
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

  return [...new Set(found)].slice(0, 4)
}

/* ─── Normalise RunSignup race → our event shape ──────────── */
const normalizeRace = (race) => {
  const r        = race.race || race
  const sport    = detectSport(r)
  const distances = extractDistances(r)
  const city     = r.address?.city  || ''
  const state    = r.address?.state || ''

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

/* ─── Fetch: RunSignup + FindARace + BikeReg in parallel ──── */
const fetchEvents = async () => {
  loading.value  = true
  apiError.value = ''

  const params = new URLSearchParams({
    format:             'json',
    future_events_only: 'T',
    results_per_page:   '100',
    page:               '1',
  })
  if (zipcode.value.trim()) params.set('zipcode', zipcode.value.trim())

  const [rsResult, farResult, bikeResult] = await Promise.allSettled([
    // 1. RunSignup: try direct first, then proxy
    (async () => {
      try {
        const { data } = await axios.get(`${RUNSIGNUP_BASE}?${params}`, { timeout: 8000 })
        return Array.isArray(data) ? data : (data.races || [])
      } catch { /* CORS — try proxy */ }
      const proxyParams = { page: 1, results_per_page: 100, future_events_only: 'T' }
      if (zipcode.value.trim()) proxyParams.zipcode = zipcode.value.trim()
      const { data } = await axios.get(`${API_URL}/events`, { params: proxyParams, timeout: 8000 })
      return Array.isArray(data) ? data : (data.races || [])
    })(),
    // 2. FindARace backend proxy (triathlon-heavy)
    axios.get(`${API_URL}/events/findarace`, { timeout: 15000 }).then(r => r.data),
    // 3. BikeReg backend proxy (cycling events)
    axios.get(`${API_URL}/events/bikereg`, { timeout: 10000 }).then(r => r.data),
  ])

  let rawRaces = null
  let farEvents = []
  let bikeEvents = []

  if (rsResult.status === 'fulfilled' && rsResult.value?.length) {
    rawRaces = rsResult.value
    usingLiveData.value = true
  }
  if (farResult.status === 'fulfilled' && Array.isArray(farResult.value)) {
    farEvents = farResult.value
    usingLiveData.value = true
  }
  if (bikeResult.status === 'fulfilled' && Array.isArray(bikeResult.value)) {
    bikeEvents = bikeResult.value
    usingLiveData.value = true
  }

  if (!rawRaces && farEvents.length === 0 && bikeEvents.length === 0) {
    events.value    = sampleEvents
    usingLiveData.value = false
    loading.value   = false
    return
  }

  // Normalize RunSignup races — no sport filter, show everything
  const rsNormalized = (rawRaces || []).map(normalizeRace)

  // Merge all sources, deduplicate by name+date
  const seen = new Set()
  const merged = []
  for (const ev of [...rsNormalized, ...farEvents, ...bikeEvents]) {
    const key = `${ev.name}|${ev.date}`
    if (!seen.has(key)) {
      seen.add(key)
      merged.push(ev)
    }
  }

  // If live data came back sparse, supplement with sample events
  if (merged.length < 10) {
    for (const s of sampleEvents) {
      const key = `${s.name}|${s.date}`
      if (!seen.has(key)) { seen.add(key); merged.push(s) }
    }
  }

  events.value = merged
  loading.value = false
}

/* ─── Client-side filtering + sorting ───────────────────── */
const today = new Date(); today.setHours(0, 0, 0, 0)

const filteredEvents = computed(() => {
  let r = events.value.filter(e => !e.date || parseDate(e.date) >= today)

  if (selectedSport.value !== 'all') {
    r = r.filter(e => e.sport === selectedSport.value)
  }

  if (stateFilter.value) {
    r = r.filter(e => e.state === stateFilter.value)
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
    r = r.filter(x => {
      const d = x.date
      if (!d) return false
      if (d.includes('/')) return d.startsWith(month.value + '/')
      return d.slice(5, 7) === month.value
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
    r = [...r].sort((a, b) => parseDate(a.date) - parseDate(b.date))
  } else {
    r = [...r].sort((a, b) => a.name.localeCompare(b.name))
  }

  return r
})

const pagedEvents = computed(() => filteredEvents.value.slice(0, perPage.value))

/* ─── Helpers ────────────────────────────────────────────── */
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
}

const resetFilters = () => {
  q.value = ''; zipcode.value = ''; stateFilter.value = ''
  month.value = ''; sort.value = 'soon'; chipActive.value = ''
  selectedSport.value = 'all'; perPage.value = 12
}

const getCardStyle = (event) => {
  if (event.image) return { backgroundImage: `url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  return { background: '#111' }
}

/* ─── Sample / fallback data — all 10 sport types ────────── */
const sampleEvents = [
  // ── RUNNING ──
  {
    id: 's-run-1', name: 'LA Marathon', date: '2026-03-15', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running', city: 'Los Angeles', state: 'CA',
    distances: ['Marathon', 'Half Marathon'],
    summary: 'Iconic 26.2-mile course through LA neighborhoods — Dodger Stadium to Santa Monica.',
    url: 'https://www.lamarathon.com', registerUrl: 'https://www.lamarathon.com', image: '',
  },
  {
    id: 's-run-2', name: 'Boston Marathon', date: '2026-04-20', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running', city: 'Boston', state: 'MA',
    distances: ['Marathon'],
    summary: "The world's oldest annual marathon. Hopkinton to Boylston Street — qualification required.",
    url: 'https://www.baa.org', registerUrl: 'https://www.baa.org', image: '',
  },
  {
    id: 's-run-3', name: 'Big Sur International Marathon', date: '2026-04-26', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running', city: 'Big Sur', state: 'CA',
    distances: ['Marathon', '21 mi', '10.6 mi', '5K'],
    summary: 'Point-to-point along Highway 1 — the most scenic marathon in America.',
    url: 'https://www.bsim.org', registerUrl: 'https://www.bsim.org', image: '',
  },
  {
    id: 's-run-4', name: 'Chicago Marathon', date: '2026-10-11', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running', city: 'Chicago', state: 'IL',
    distances: ['Marathon'],
    summary: 'World Marathon Major through 29 neighborhoods of Chicago. Flat, fast, legendary.',
    url: 'https://www.chicagomarathon.com', registerUrl: 'https://www.chicagomarathon.com', image: '',
  },
  {
    id: 's-run-5', name: 'NYC Marathon', date: '2026-11-01', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running', city: 'New York', state: 'NY',
    distances: ['Marathon'],
    summary: 'The world\'s largest marathon — 26.2 miles through all five boroughs of New York City.',
    url: 'https://www.nyrr.org/tcsnycmarathon', registerUrl: 'https://www.nyrr.org/tcsnycmarathon', image: '',
  },
  {
    id: 's-run-6', name: 'Run Wild Missoula Half Marathon', date: '2026-07-04', sport: 'running',
    sportEmoji: '🏃', sportLabel: 'Running', city: 'Missoula', state: 'MT',
    distances: ['Half Marathon', '10K', '5K'],
    summary: 'Beloved summer race through the streets of downtown Missoula. All distances welcome.',
    url: '#', registerUrl: '#', image: '',
  },
  // ── TRAIL ──
  {
    id: 's-trail-1', name: 'Western States 100', date: '2026-06-27', sport: 'trail',
    sportEmoji: '🏔️', sportLabel: 'Trail', city: 'Squaw Valley', state: 'CA',
    distances: ['100mi'],
    summary: 'The most storied 100-mile trail run in the world. Squaw Valley to Auburn through the Sierra Nevada.',
    url: 'https://www.wser.org', registerUrl: 'https://www.wser.org', image: '',
  },
  {
    id: 's-trail-2', name: 'Leadville Trail 100', date: '2026-08-15', sport: 'trail',
    sportEmoji: '🏔️', sportLabel: 'Trail', city: 'Leadville', state: 'CO',
    distances: ['100mi', '50mi'],
    summary: 'Run through the clouds. 100 miles at altitude — the "Race Across the Sky."',
    url: 'https://www.leadvilleraceseries.com', registerUrl: 'https://www.leadvilleraceseries.com', image: '',
  },
  {
    id: 's-trail-3', name: 'Hardrock 100', date: '2026-07-11', sport: 'trail',
    sportEmoji: '🏔️', sportLabel: 'Trail', city: 'Silverton', state: 'CO',
    distances: ['100mi'],
    summary: '100-mile loop through the San Juan Mountains with over 33,000 ft of gain. Lottery entry.',
    url: 'https://www.hardrock100.com', registerUrl: 'https://www.hardrock100.com', image: '',
  },
  {
    id: 's-trail-4', name: 'Sean O\'Brien 100K', date: '2026-02-01', sport: 'trail',
    sportEmoji: '🏔️', sportLabel: 'Trail', city: 'Malibu', state: 'CA',
    distances: ['100K', '50K', '50mi'],
    summary: 'A premier WSER-qualifier through the hills above Malibu. Multi-distance options available.',
    url: '#', registerUrl: '#', image: '',
  },
  // ── CYCLING ──
  {
    id: 's-cyc-1', name: 'Tour of the Battenkill', date: '2026-04-19', sport: 'cycling',
    sportEmoji: '🚴', sportLabel: 'Cycling', city: 'Cambridge', state: 'NY',
    distances: ['50mi', '66mi'],
    summary: 'America\'s Queen of the Classics — rolling roads and gravel through the New York countryside.',
    url: 'https://www.mybattenkill.com', registerUrl: 'https://www.mybattenkill.com', image: '',
  },
  {
    id: 's-cyc-2', name: 'Red Rocks Gran Fondo', date: '2026-06-06', sport: 'cycling',
    sportEmoji: '🚴', sportLabel: 'Cycling', city: 'Morrison', state: 'CO',
    distances: ['Gran Fondo', 'Metric Century', '50mi'],
    summary: 'Climb through Red Rocks Amphitheatre and the Colorado foothills. Breathtaking views all route.',
    url: '#', registerUrl: '#', image: '',
  },
  {
    id: 's-cyc-3', name: 'Chicago Criterium', date: '2026-07-18', sport: 'cycling',
    sportEmoji: '🚴', sportLabel: 'Cycling', city: 'Chicago', state: 'IL',
    distances: ['Criterium'],
    summary: 'Urban circuit race through downtown Chicago. Cat 1–5 fields, spectator-friendly course.',
    url: '#', registerUrl: '#', image: '',
  },
  // ── GRAVEL / MTB ──
  {
    id: 's-grv-1', name: 'Unbound Gravel', date: '2026-06-06', sport: 'gravel',
    sportEmoji: '🪨', sportLabel: 'Gravel/MTB', city: 'Emporia', state: 'KS',
    distances: ['200mi', '100mi', '50mi', '25mi'],
    summary: 'The world\'s premier gravel race. 200 miles of unforgiving Kansas dirt — brutal and iconic.',
    url: 'https://www.unboundgravel.com', registerUrl: 'https://www.unboundgravel.com', image: '',
  },
  {
    id: 's-grv-2', name: 'Belgian Waffle Ride', date: '2026-04-05', sport: 'gravel',
    sportEmoji: '🪨', sportLabel: 'Gravel/MTB', city: 'San Marcos', state: 'CA',
    distances: ['130mi', '71mi', '35mi'],
    summary: 'Cobbles, climbs, and chaos — California\'s answer to the Classics. Gravel in the hills of Palomar.',
    url: 'https://www.belgianwaffleride.bike', registerUrl: 'https://www.belgianwaffleride.bike', image: '',
  },
  {
    id: 's-grv-3', name: 'SBT GRVL', date: '2026-08-09', sport: 'gravel',
    sportEmoji: '🪨', sportLabel: 'Gravel/MTB', city: 'Steamboat Springs', state: 'CO',
    distances: ['144mi', '60mi', '36mi'],
    summary: 'Mountain gravel racing through Routt County — stunning Colorado scenery, serious altitude.',
    url: 'https://www.sbtgrvl.com', registerUrl: 'https://www.sbtgrvl.com', image: '',
  },
  // ── TRIATHLON ──
  {
    id: 's-tri-1', name: 'IRONMAN 70.3 Oceanside', date: '2026-03-28', sport: 'triathlon',
    sportEmoji: '🏊', sportLabel: 'Triathlon', city: 'Oceanside', state: 'CA',
    distances: ['70.3'],
    summary: 'Swim, bike, and run along the Southern California coast. One of the most popular 70.3s in the US.',
    url: 'https://www.ironman.com', registerUrl: 'https://www.ironman.com', image: '',
  },
  {
    id: 's-tri-2', name: 'Escape From Alcatraz Triathlon', date: '2026-06-07', sport: 'triathlon',
    sportEmoji: '🏊', sportLabel: 'Triathlon', city: 'San Francisco', state: 'CA',
    distances: ['Olympic'],
    summary: 'Swim from the island, bike the Marin Headlands, run the coastal trails. A true bucket-list race.',
    url: 'https://www.escapealcatraztri.com', registerUrl: 'https://www.escapealcatraztri.com', image: '',
  },
  {
    id: 's-tri-3', name: 'IRONMAN Coeur d\'Alene', date: '2026-06-28', sport: 'triathlon',
    sportEmoji: '🏊', sportLabel: 'Triathlon', city: 'Coeur d\'Alene', state: 'ID',
    distances: ['Ironman'],
    summary: '2.4-mile swim, 112-mile bike, 26.2-mile run through Idaho\'s panhandle. Full-distance glory.',
    url: 'https://www.ironman.com', registerUrl: 'https://www.ironman.com', image: '',
  },
  // ── DUATHLON ──
  {
    id: 's-du-1', name: 'USAT Duathlon Nationals', date: '2026-09-12', sport: 'duathlon',
    sportEmoji: '🔁', sportLabel: 'Duathlon', city: 'Tucson', state: 'AZ',
    distances: ['Sprint', 'Standard'],
    summary: 'Run-bike-run on fast desert roads. USAT Age Group National Championship — qualifier required.',
    url: 'https://www.usatriathlon.org', registerUrl: 'https://www.usatriathlon.org', image: '',
  },
  {
    id: 's-du-2', name: 'Powerman Alabama', date: '2026-04-18', sport: 'duathlon',
    sportEmoji: '🔁', sportLabel: 'Duathlon', city: 'Auburn', state: 'AL',
    distances: ['Long Course', 'Standard', 'Sprint'],
    summary: 'Run-bike-run through the rolling hills of Auburn. Part of the Powerman World Series.',
    url: '#', registerUrl: '#', image: '',
  },
  // ── OPEN WATER ──
  {
    id: 's-ow-1', name: 'Great Chesapeake Bay Swim', date: '2026-06-13', sport: 'openwater',
    sportEmoji: '🌊', sportLabel: 'Open Water', city: 'Annapolis', state: 'MD',
    distances: ['4.4mi'],
    summary: 'Cross the Chesapeake Bay from Sandy Point to Kent Island — 4.4 miles of open water.',
    url: '#', registerUrl: '#', image: '',
  },
  {
    id: 's-ow-2', name: 'Horsetooth Open Water Swim', date: '2026-08-08', sport: 'openwater',
    sportEmoji: '🌊', sportLabel: 'Open Water', city: 'Fort Collins', state: 'CO',
    distances: ['10K', '5K', '2.5K', '1K'],
    summary: 'Mountain reservoir racing in Colorado. Multiple distances from 1K to the 10K championship.',
    url: '#', registerUrl: '#', image: '',
  },
  // ── OCR ──
  {
    id: 's-ocr-1', name: 'Spartan Race World Championship', date: '2026-10-03', sport: 'ocr',
    sportEmoji: '🪖', sportLabel: 'OCR', city: 'Lake Tahoe', state: 'CA',
    distances: ['13mi', '5mi'],
    summary: 'Elite and age group athletes converge on Tahoe for the ultimate Spartan showdown.',
    url: 'https://www.spartan.com', registerUrl: 'https://www.spartan.com', image: '',
  },
  {
    id: 's-ocr-2', name: 'Tough Mudder Chicago', date: '2026-05-16', sport: 'ocr',
    sportEmoji: '🪖', sportLabel: 'OCR', city: 'Joliet', state: 'IL',
    distances: ['5mi', '3mi'],
    summary: 'Team-oriented mud and obstacles through the Illinois countryside. All fitness levels welcome.',
    url: 'https://www.toughmudder.com', registerUrl: 'https://www.toughmudder.com', image: '',
  },
  {
    id: 's-ocr-3', name: 'Savage Race Southeast', date: '2026-04-04', sport: 'ocr',
    sportEmoji: '🪖', sportLabel: 'OCR', city: 'Plant City', state: 'FL',
    distances: ['5mi'],
    summary: 'Savage Race packs more obstacles per mile than any other OCR. Challenging and creative course design.',
    url: 'https://www.savagerace.com', registerUrl: 'https://www.savagerace.com', image: '',
  },
  // ── NORDIC / SKI ──
  {
    id: 's-nor-1', name: 'American Birkebeiner', date: '2026-02-21', sport: 'nordic',
    sportEmoji: '⛷️', sportLabel: 'Nordic/Ski', city: 'Hayward', state: 'WI',
    distances: ['50K', '25K', '10K', '5K'],
    summary: 'North America\'s largest cross-country ski marathon — the "Birkie." 55 km through the Northwoods.',
    url: 'https://www.birkie.com', registerUrl: 'https://www.birkie.com', image: '',
  },
  {
    id: 's-nor-2', name: 'Craftsbury Marathon', date: '2026-01-17', sport: 'nordic',
    sportEmoji: '⛷️', sportLabel: 'Nordic/Ski', city: 'Craftsbury Common', state: 'VT',
    distances: ['50K', '25K', '10K'],
    summary: 'Classic New England nordic skiing through Vermont\'s Northeast Kingdom. Groomed trails, stunning scenery.',
    url: '#', registerUrl: '#', image: '',
  },
]

/* ─── Race Detail Drawer ──────────────────────────────────── */
const drawerRace     = ref(null)
const goalTimeInput  = ref('')
const paceDistance   = ref('Marathon')
const splits         = ref([])
const planGenerating = ref(false)
const planGenerated  = ref(false)
const planError      = ref('')

// Show pace calc and training plan for run/trail/tri/duathlon only
const PACE_CALC_SPORTS = new Set(['running', 'trail', 'triathlon', 'duathlon'])
const showPaceCalc = computed(() =>
  drawerRace.value && PACE_CALC_SPORTS.has(drawerRace.value.sport)
)

const DISTANCE_MILES = {
  '5K': 3.1, '10K': 6.2, '25K': 15.5, '50K': 31.1, '100K': 62.1, '100mi': 100,
  'Half Marathon': 13.1, 'Marathon': 26.2, 'Ultra': 50,
  'Sprint': 16.2, 'Olympic': 32.1, '70.3': 70.3, 'Ironman': 140.6,
  'Standard Duathlon': 18.5, 'Metric Century': 62.1, 'Century': 100,
}

const openRaceDrawer = (event) => {
  drawerRace.value     = event
  goalTimeInput.value  = ''
  splits.value         = []
  planError.value      = ''
  planGenerated.value  = !!localStorage.getItem(`plan_gen_${event.id}`)
  if (event.distances?.length) {
    const first = event.distances[0]
    if (DISTANCE_MILES[first]) paceDistance.value = first
    else paceDistance.value = 'Marathon'
  }
}

const parseGoalTime = (s) => {
  const parts = s.trim().split(':').map(Number)
  if (parts.some(isNaN)) return null
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
  if (parts.length === 2) return parts[0] * 60 + parts[1]
  return null
}

const fmtSecs = (totalSecs) => {
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = Math.round(totalSecs % 60)
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

const calcSplits = () => {
  const totalSecs = parseGoalTime(goalTimeInput.value)
  const miles     = DISTANCE_MILES[paceDistance.value]
  if (!totalSecs || !miles) { splits.value = []; return }
  const secsPerMile = totalSecs / miles
  const rows = []
  let cumSecs = 0
  for (let i = 1; i <= Math.floor(miles); i++) {
    cumSecs += secsPerMile
    rows.push({ mile: i, split: fmtSecs(secsPerMile), cum: fmtSecs(cumSecs) })
  }
  const remaining = miles - Math.floor(miles)
  if (remaining > 0.01) {
    const partial = secsPerMile * remaining
    cumSecs += partial
    rows.push({ mile: `${miles.toFixed(1)}`, split: fmtSecs(partial), cum: fmtSecs(cumSecs) })
  }
  splits.value = rows
}

/* ─── Calendar helpers ────────────────────────────────────── */
const googleCalUrl = (event) => {
  const d   = parseDate(event.date)
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const start = fmt(d)
  const end   = fmt(new Date(d.getTime() + 86400000))
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.name)}&dates=${start}/${end}&details=${encodeURIComponent(event.summary || '')}&location=${encodeURIComponent((event.city || '') + (event.state ? ', ' + event.state : ''))}`
}

const downloadIcs = (event) => {
  const d   = parseDate(event.date)
  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '').slice(0, 15) + 'Z'
  const start = fmt(d)
  const end   = fmt(new Date(d.getTime() + 86400000))
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Runnit//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${event.name}`,
    `DESCRIPTION:${(event.summary || '').replace(/\n/g, '\\n')}`,
    `LOCATION:${(event.city || '')}${event.state ? ', ' + event.state : ''}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n')
  const blob = new Blob([ics], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${event.name.replace(/\s+/g, '_')}.ics`
  a.click()
}

/* ─── Training plan generator ─────────────────────────────── */
const generatePlan = async (event) => {
  if (planGenerated.value) return
  planError.value    = ''
  planGenerating.value = true

  const raceDate = parseDate(event.date)
  const now      = new Date(); now.setHours(0, 0, 0, 0)

  const sundays = []
  const cur = new Date(now)
  cur.setDate(cur.getDate() + ((7 - cur.getDay()) % 7 || 7))
  while (cur <= raceDate) {
    sundays.push(new Date(cur))
    cur.setDate(cur.getDate() + 7)
  }

  if (sundays.length === 0) {
    planError.value = 'Race date is too close to generate a plan.'
    planGenerating.value = false
    return
  }

  const raceMiles  = DISTANCE_MILES[event.distances?.[0]] || 13.1
  const peakMiles  = raceMiles * 0.85
  const total      = sundays.length
  const token      = localStorage.getItem('token')
  const headers    = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  const isoDate    = (d) => d.toISOString().slice(0, 10)

  try {
    for (let i = 0; i < total; i++) {
      let miles
      const weeksOut = total - 1 - i
      if (weeksOut === 0)      miles = raceMiles * 0.30
      else if (weeksOut === 1) miles = peakMiles * 0.60
      else if (weeksOut === 2) miles = peakMiles * 0.75
      else                     miles = peakMiles * ((i + 1) / (total - 2))
      miles = Math.max(3, Math.round(miles * 10) / 10)

      await axios.post(`${API_URL}/workout-events`, {
        title:       `Long Run — ${miles} mi`,
        description: `Training for ${event.name}`,
        eventDate:   isoDate(sundays[i]),
        duration:    Math.round(miles * 10),
        source:      'RACE_PLAN',
        raceId:      String(event.id),
      }, { headers })
    }
    planGenerated.value = true
    localStorage.setItem(`plan_gen_${event.id}`, '1')
  } catch {
    planError.value = 'Failed to generate plan. Please try again.'
  } finally {
    planGenerating.value = false
  }
}

onMounted(() => {
  fetchEvents()
  loadBookmarks()
})

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
  background: #fff;
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
  font-size: 0.72rem;
}
.panel-sub { color: rgba(255,255,255,0.40); font-size: 0.72rem; font-weight: 600; }

/* SPORT TABS — scrollable for 10 tabs */
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
  color: rgba(15,18,16,0.45);
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.sport-tab:hover { color: rgba(15,18,16,0.80); }
.sport-tab.active { color: #000; border-bottom-color: #000; }
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
.filter-input:focus { border-color: #000; }
.filter-input--sm { flex: 0 0 120px; padding-left: 12px; }
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
.filter-select:focus { border-color: #000; }
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
.chip-btn.active { border-color: #000; color: #fff; background: #000; }

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
}

.event-img {
  position: relative;
  height: 140px;
  background: #111;
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
.bookmark-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 30px;
  height: 30px;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(255,255,255,0.30);
  color: #000;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.12s, color 0.12s;
}
.bookmark-btn:hover { background: #fff; }
.bookmark-btn.bookmarked { background: #ef4444; color: #fff; border-color: #ef4444; }

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
  background: #000;
  color: #fff;
  font-size: 0.76rem;
  font-weight: 700;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background 0.15s;
}
.btn-register:hover { background: #222; }

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
  .filter-input--sm { flex: 1 1 100px; }
  .events-grid { grid-template-columns: 1fr; }
  .sport-tabs { padding: 0 12px; }
  .sport-tab { padding: 12px 14px; font-size: 0.76rem; }
}

/* ── Race Detail Drawer ── */
.drawer-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1040;
}
.race-drawer {
  position: fixed; top: 0; right: 0; width: 480px; max-width: 100vw;
  height: 100vh; background: #fff; border-left: 1px solid #E5E5E5;
  z-index: 1050; display: flex; flex-direction: column;
  font-family: Futura, "Futura PT", "Avenir Next", system-ui, sans-serif;
}
.drawer-slide-enter-active, .drawer-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
}
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }

.rd-header {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-bottom: 1px solid #E5E5E5;
  flex-shrink: 0; position: sticky; top: 0; background: #fff; z-index: 2;
}
.rd-close {
  width: 36px; height: 36px; border: 1px solid #E5E5E5; background: #fff;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 0.9rem; color: #767676;
  transition: border-color 0.15s;
}
.rd-close:hover { border-color: #000; color: #000; }
.rd-sport-label {
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; color: #767676;
}

.rd-scroll { flex: 1; overflow-y: auto; }

.rd-hero {
  height: 160px; background: #111; position: relative; flex-shrink: 0;
  display: flex; align-items: flex-end; padding: 12px;
}
.rd-date-badge {
  background: rgba(255,255,255,0.93); color: #000;
  font-size: 0.72rem; font-weight: 900; padding: 4px 10px;
  letter-spacing: 0.04em; border: 1px solid rgba(15,18,16,0.08);
}

.rd-title-block { padding: 20px 20px 0; }
.rd-name {
  font-size: 1.3rem; font-weight: 900; color: #000;
  margin: 0 0 6px; line-height: 1.25;
}
.rd-location { font-size: 0.82rem; color: #767676; margin: 0 0 10px; }
.rd-pills { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 4px; }

.rd-section {
  padding: 20px; border-top: 1px solid #E5E5E5; margin-top: 8px;
}
.rd-section-label {
  font-size: 0.68rem; font-weight: 900; letter-spacing: 0.14em;
  text-transform: uppercase; color: #767676; margin-bottom: 14px;
}
.rd-section-sub { font-size: 0.82rem; color: #767676; margin: -8px 0 14px; }

/* Pacing */
.rd-pace-inputs { display: flex; gap: 10px; margin-bottom: 14px; }
.rd-select, .rd-input {
  height: 40px; border: 1px solid #E5E5E5; border-radius: 0;
  padding: 0 12px; font-size: 0.88rem; font-family: inherit;
  color: #000; outline: none; background: #fff;
  transition: border-color 0.15s;
}
.rd-select {
  flex: 0 0 160px; appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 5 5-5' stroke='%23000' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
  cursor: pointer;
}
.rd-input { flex: 1; }
.rd-select:focus, .rd-input:focus { border-color: #000; }

.rd-splits { border: 1px solid #E5E5E5; }
.rd-splits-head, .rd-split-row {
  display: grid; grid-template-columns: 60px 1fr 1fr;
  padding: 8px 12px; font-size: 0.80rem;
}
.rd-splits-head {
  background: #000; color: #fff; font-weight: 700;
  font-size: 0.68rem; letter-spacing: 0.08em; text-transform: uppercase;
}
.rd-split-row { border-top: 1px solid #E5E5E5; color: #333; }
.rd-split-row:nth-child(even) { background: #fafafa; }

/* Calendar */
.rd-cal-btns { display: flex; gap: 10px; flex-wrap: wrap; }

/* Plan */
.rd-plan-error {
  background: #fef2f2; border: 1px solid #fca5a5; color: #dc2626;
  font-size: 0.82rem; padding: 10px 12px; margin-bottom: 12px;
}

/* Buttons */
.rd-btn-outline {
  display: inline-flex; align-items: center;
  height: 40px; padding: 0 16px; border: 1px solid #E5E5E5;
  background: #fff; color: #000; font-size: 0.80rem; font-weight: 700;
  text-decoration: none; cursor: pointer; font-family: inherit;
  transition: border-color 0.15s;
}
.rd-btn-outline:hover { border-color: #000; }
.rd-btn-primary {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; height: 44px; background: #000; color: #fff;
  border: none; font-size: 0.82rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.10em; cursor: pointer;
  font-family: inherit; transition: background 0.15s;
}
.rd-btn-primary:hover:not(:disabled) { background: #222; }
.rd-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.rd-links { display: flex; gap: 10px; }
.rd-links .rd-btn-primary { width: auto; flex: 1; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
