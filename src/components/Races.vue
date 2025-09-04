<!-- src/pages/Races.vue -->
<template>
  <main class="races-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl d-flex align-items-center justify-content-between gap-4">
        <div class="hero-copy">
          <p class="eyebrow mb-2">Discover races</p>
          <h1 class="display-5 fw-bold mb-2">Find Your Next Start Line</h1>
          <p class="lead mb-0">Browse 5Ks to ultras—filter by month, distance, and location.</p>
        </div>
        <div class="hero-art d-none d-lg-block" aria-hidden="true"></div>
      </div>
    </section>

    <!-- FILTERS -->
    <section class="filters border-bottom">
      <div class="container-xxl">
        <form class="row g-2 align-items-center" @submit.prevent>
          <div class="col-12 col-md">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input v-model.trim="q" class="form-control" placeholder="Search races, city, keyword…" />
            </div>
          </div>

          <div class="col-6 col-md-2">
            <select v-model="month" class="form-select">
              <option value="">Any month</option>
              <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <select v-model="distance" class="form-select">
              <option value="">Any distance</option>
              <option v-for="d in distances" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>

          <div class="col-6 col-md-2">
            <select v-model="sort" class="form-select">
              <option value="soon">Soonest first</option>
              <option value="new">Recently added</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          <div class="col-6 col-md-auto text-md-end">
            <button type="button" class="btn btn-outline-secondary w-100" @click="resetFilters">Clear</button>
          </div>
        </form>

        <!-- Chip filters -->
        <div class="chips mt-3 d-flex flex-wrap gap-2">
          <button
            v-for="chip in chips"
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
        <div class="d-flex justify-content-between align-items-center mb-3">
          <p class="mb-0 text-muted">{{ filteredRaces.length }} races</p>
          <small class="text-muted">Updated daily</small>
        </div>

        <div class="row g-4">
          <div v-for="race in pagedRaces" :key="race.id" class="col-12 col-md-6 col-lg-4">
            <article class="race-card h-100">
              <div class="race-img" :style="{ backgroundImage: `url(${race.image})` }">
                <span class="badge date-badge">
                  {{ formatDateShort(race.date) }}
                </span>
                <span class="badge dist-badge">{{ race.distance }}</span>
              </div>
              <div class="card-body">
                <h3 class="h5 mb-1">{{ race.name }}</h3>
                <p class="text-muted mb-2">
                  <i class="bi bi-geo-alt me-1"></i>{{ race.city }}, {{ race.country }}
                </p>
                <p class="small mb-3">{{ race.summary }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="small text-muted">
                    <i class="bi bi-calendar-event me-1"></i>{{ formatDateLong(race.date) }}
                  </span>
                  <div class="d-flex gap-2">
                    <a :href="race.url" target="_blank" class="btn btn-outline-dark btn-sm">Details</a>
                    <a :href="race.registerUrl" target="_blank" class="btn btn-primary btn-sm">Register</a>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- Load more -->
        <div v-if="filteredRaces.length > perPage" class="text-center mt-4">
          <button class="btn btn-outline-dark" @click="perPage += 9">Load more</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

/* Filters state */
const q = ref('')
const month = ref('')
const distance = ref('')
const sort = ref('soon')
const chipActive = ref('')

const months = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' },   { value: '04', label: 'April' },
  { value: '05', label: 'May' },     { value: '06', label: 'June' },
  { value: '07', label: 'July' },    { value: '08', label: 'August' },
  { value: '09', label: 'September'},{ value: '10', label: 'October' },
  { value: '11', label: 'November' },{ value: '12', label: 'December' },
]
const distances = ['5K', '10K', 'Half Marathon', 'Marathon', 'Ultra']
const chips = ['Trail', 'Road', 'Flat', 'Hilly', 'Scenic', 'Boston Qualifier']

/* Demo data (replace with API later) */
const races = ref([
  {
    id: 1,
    name: 'Golden Gate Half',
    date: '2025-11-02',
    distance: 'Half Marathon',
    city: 'San Francisco',
    country: 'USA',
    summary: 'Iconic waterfront course with bridge views.',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=1600&auto=format&fit=crop',
    url: '#', registerUrl: '#', tags: ['Road', 'Scenic']
  },
  {
    id: 2,
    name: 'City 10K',
    date: '2025-09-21',
    distance: '10K',
    city: 'Chicago',
    country: 'USA',
    summary: 'Fast, flat downtown loop—great for PBs.',
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?q=80&w=1600&auto=format&fit=crop',
    url: '#', registerUrl: '#', tags: ['Road', 'Flat', 'Boston Qualifier']
  },
  {
    id: 3,
    name: 'Sierra Trail 50K',
    date: '2025-10-12',
    distance: 'Ultra',
    city: 'Truckee',
    country: 'USA',
    summary: 'Alpine trails, serious vert, unreal views.',
    image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=1600&auto=format&fit=crop',
    url: '#', registerUrl: '#', tags: ['Trail', 'Hilly', 'Scenic']
  },
  {
    id: 4,
    name: 'Harbor 5K',
    date: '2025-09-07',
    distance: '5K',
    city: 'Boston',
    country: 'USA',
    summary: 'Beginner-friendly route along the water.',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop',
    url: '#', registerUrl: '#', tags: ['Road', 'Flat']
  },
  {
    id: 5,
    name: 'Marathon by the Bay',
    date: '2026-01-18',
    distance: 'Marathon',
    city: 'Sydney',
    country: 'Australia',
    summary: 'Bucket-list marathon with harbor finish.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=1600&auto=format&fit=crop',
    url: '#', registerUrl: '#', tags: ['Road', 'Scenic']
  },
  {
    id: 6,
    name: 'Forest Half',
    date: '2025-12-06',
    distance: 'Half Marathon',
    city: 'Portland',
    country: 'USA',
    summary: 'Shaded trails and rolling hills.',
    image: 'https://images.unsplash.com/photo-1502810365585-89ada3973b3e?q=80&w=1600&auto=format&fit=crop',
    url: '#', registerUrl: '#', tags: ['Trail', 'Hilly']
  },
])

/* Filtering + sorting */
const filteredRaces = computed(() => {
  let r = races.value.slice()

  if (q.value) {
    const needle = q.value.toLowerCase()
    r = r.filter(x =>
      x.name.toLowerCase().includes(needle) ||
      x.city.toLowerCase().includes(needle) ||
      x.country.toLowerCase().includes(needle) ||
      x.summary.toLowerCase().includes(needle)
    )
  }

  if (month.value) {
    r = r.filter(x => (x.date || '').slice(5, 7) === month.value)
  }

  if (distance.value) {
    r = r.filter(x => x.distance === distance.value)
  }

  if (chipActive.value) {
    r = r.filter(x => x.tags?.includes(chipActive.value))
  }

  if (sort.value === 'soon') {
    r.sort((a, b) => new Date(a.date) - new Date(b.date))
  } else if (sort.value === 'new') {
    r.sort((a, b) => b.id - a.id)
  } else if (sort.value === 'name') {
    r.sort((a, b) => a.name.localeCompare(b.name))
  }

  return r
})

/* Pagination-ish */
const perPage = ref(9)
const pagedRaces = computed(() => filteredRaces.value.slice(0, perPage.value))

/* Helpers */
const resetFilters = () => {
  q.value = ''; month.value = ''; distance.value = ''; sort.value = 'soon'; chipActive.value = ''
}
const formatDateShort = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
const formatDateLong = (iso) => {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
:root { --runnit-purple: #800080; }

/* Fill the viewport between fixed nav & footer */
.races-page{
  --nav-h:72px; --footer-h:40px;
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  background:#fff;
}

/* HERO */
.hero{
  background:
    linear-gradient(90deg, rgba(128,0,128,.12), rgba(128,0,128,0) 60%),
    #faf7ff;
  padding: 48px 0;
  border-bottom: 1px solid #eee;
}
.eyebrow{ letter-spacing:.08em; text-transform:uppercase; color:#6b7280; font-weight:600; }
.hero-art{
  width: 420px; height: 220px;
  border-radius: 16px;
  background:
    linear-gradient(135deg, rgba(128,0,128,.3), rgba(128,0,128,.05)),
    url('https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop') center/cover no-repeat;
  box-shadow: 0 12px 28px rgba(0,0,0,.12);
}

/* FILTERS */
.filters{ background:#fff; padding: 16px 0; }
.btn-chip{
  border:1px solid #e5e7eb; background:#fff; border-radius:999px; padding:.25rem .75rem;
  font-weight:600; font-size:.9rem;
}
.btn-chip.active{ border-color:var(--runnit-purple); color:#fff; background:var(--runnit-purple); }

/* CARDS */
.race-card{
  border:1px solid #eee; border-radius:14px; overflow:hidden; background:#fff;
  transition: transform .12s ease, box-shadow .12s ease;
}
.race-card:hover{ transform:translateY(-2px); box-shadow:0 10px 24px rgba(0,0,0,.08); }
.race-img{
  position:relative; height:180px; background:#ddd center/cover no-repeat;
}
.date-badge{
  position:absolute; left:12px; top:12px; background:#fff; color:#111; border:1px solid #eee;
}
.dist-badge{
  position:absolute; right:12px; top:12px; background:var(--runnit-purple);
}
.card-body{ padding:16px; }
.btn-primary{
  --bs-btn-bg: var(--runnit-purple);
  --bs-btn-border-color: var(--runnit-purple);
  --bs-btn-hover-bg: #6a006a;
  --bs-btn-hover-border-color: #6a006a;
}

/* Inputs focus (brand) */
.form-control:focus, .form-select:focus{
  border-color: var(--runnit-purple);
  box-shadow: 0 0 0 .2rem rgba(128,0,128,.15);
}

/* Spacing */
.results{ padding: 28px 0 60px; }

@media (max-width: 992px){
  .hero{ padding:32px 0; }
  .hero-art{ display:none; }
}
</style>
