<!-- src/pages/Races.vue -->
<template>
  <main class="races-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl d-flex align-items-center justify-content-between gap-4">
        <div class="hero-copy">
          <p class="eyebrow mb-2">Race queue</p>
          <h1 class="display-5 fw-bold mb-2">Pick your next start line.</h1>
          <p class="lead mb-0">
            Browse 5Ks to ultras — filter by month, distance, and terrain. Build your season on purpose.
          </p>
        </div>
        <div class="hero-art d-none d-lg-block" aria-hidden="true">
          <div class="hero-panel">
            <div class="panel-kicker">TODAY’S LOADOUT</div>
            <div class="panel-row">
              <span class="panel-pill">Road</span>
              <span class="panel-pill">Scenic</span>
              <span class="panel-pill">Half</span>
            </div>
            <div class="panel-sub">Find a race that matches your loop.</div>
          </div>
        </div>
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
                <span class="badge date-badge">{{ formatDateShort(race.date) }}</span>
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

  if (month.value) r = r.filter(x => (x.date || '').slice(5, 7) === month.value)
  if (distance.value) r = r.filter(x => x.distance === distance.value)
  if (chipActive.value) r = r.filter(x => x.tags?.includes(chipActive.value))

  if (sort.value === 'soon') r.sort((a, b) => new Date(a.date) - new Date(b.date))
  else if (sort.value === 'new') r.sort((a, b) => b.id - a.id)
  else if (sort.value === 'name') r.sort((a, b) => a.name.localeCompare(b.name))

  return r
})

/* Pagination-ish */
const perPage = ref(9)
const pagedRaces = computed(() => filteredRaces.value.slice(0, perPage.value))

/* Helpers */
const resetFilters = () => { q.value=''; month.value=''; distance.value=''; sort.value='soon'; chipActive.value='' }
const formatDateShort = (iso) => new Date(iso).toLocaleDateString(undefined, { month:'short', day:'numeric' })
const formatDateLong = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday:'short', month:'long', day:'numeric', year:'numeric' })
</script>

<style scoped>
.races-page{
  --r-olive:#5A6B4E;
  --r-olive-deep:#2C3726;
  --r-black:#0F1210;
  --r-stone:#A3A69F;
  --r-offwhite:#F5F6F3;
  --r-white:#FFFFFF;
  --r-accent:#C46A2A;

  --nav-h:72px;
  --footer-h:40px;
  min-height: calc(100vh - var(--nav-h) - var(--footer-h));
  background: var(--r-offwhite);

  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir,
    system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* HERO */
.hero{
  padding: 48px 0;
  border-bottom: 1px solid rgba(15,18,16,0.08);
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: var(--r-white);
}
.eyebrow{
  letter-spacing:.16em;
  text-transform:uppercase;
  color: rgba(255,255,255,0.82);
  font-weight: 800;
}
.hero :deep(.lead){
  color: rgba(255,255,255,0.76) !important;
}

/* hero panel = subtle “system” feel (not game UI) */
.hero-art{
  width: 420px;
  height: 220px;
  border-radius: 18px;
  position: relative;
  overflow:hidden;

  background:
    radial-gradient(700px 260px at 30% 20%, rgba(255,255,255,0.14), rgba(255,255,255,0) 60%),
    radial-gradient(800px 320px at 80% 80%, rgba(15,18,16,0.35), rgba(15,18,16,0) 60%),
    linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03));
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: 0 26px 70px rgba(15,18,16,0.34);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.hero-panel{
  position:absolute;
  inset: 16px;
  border-radius: 16px;
  padding: 14px 14px 12px;
  background: rgba(15,18,16,0.16);
  border: 1px solid rgba(255,255,255,0.14);
}
.panel-kicker{
  font-weight: 900;
  letter-spacing: .18em;
  font-size: .74rem;
  color: rgba(255,255,255,0.86);
  margin-bottom: 10px;
}
.panel-row{
  display:flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}
.panel-pill{
  display:inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.16);
  color: rgba(255,255,255,0.88);
  font-weight: 800;
  font-size: .78rem;
}
.panel-sub{
  color: rgba(255,255,255,0.74);
  font-weight: 700;
}

/* FILTERS */
.filters{ background:#fff; padding: 16px 0; }
.input-group-text{
  background: rgba(245,246,243,0.9);
  border-color: rgba(15,18,16,0.12);
}
.form-control, .form-select{
  border-color: rgba(15,18,16,0.12);
  border-radius: 12px;
}
.form-control:focus, .form-select:focus{
  border-color: rgba(196,106,42,0.65);
  box-shadow: 0 0 0 .2rem rgba(196,106,42,0.18);
}

/* Chips */
.btn-chip{
  border: 1px solid rgba(15,18,16,0.12);
  background: rgba(255,255,255,0.85);
  border-radius: 999px;
  padding: .28rem .85rem;
  font-weight: 800;
  font-size: .9rem;
}
.btn-chip.active{
  border-color: rgba(196,106,42,0.30);
  background: rgba(196,106,42,0.14);
  color: var(--r-black);
}

/* RESULTS */
.results{ padding: 28px 0 60px; }

/* Cards */
.race-card{
  border: 1px solid rgba(15,18,16,0.10);
  border-radius: 16px;
  overflow:hidden;
  background:#fff;
  box-shadow: 0 12px 30px rgba(15,18,16,0.06);
  transition: transform .12s ease, box-shadow .12s ease;
}
.race-card:hover{
  transform: translateY(-2px);
  box-shadow: 0 18px 46px rgba(15,18,16,0.10);
}
.race-img{
  position:relative;
  height: 180px;
  background:#ddd center/cover no-repeat;
}
.badge{
  border-radius: 999px;
  padding: .4rem .65rem;
  font-size: .78rem;
  font-weight: 900;
  letter-spacing: .02em;
}
.date-badge{
  position:absolute;
  left:12px;
  top:12px;
  background: rgba(255,255,255,0.92);
  color: var(--r-black);
  border: 1px solid rgba(15,18,16,0.10);
}
.dist-badge{
  position:absolute;
  right:12px;
  top:12px;
  background: rgba(196,106,42,0.98);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.12);
}
.card-body{ padding: 16px; }

/* Buttons */
.btn-primary{
  --bs-btn-bg: var(--r-accent);
  --bs-btn-border-color: rgba(255,255,255,0.12);
  --bs-btn-hover-bg: #a85722;
  --bs-btn-hover-border-color: rgba(255,255,255,0.12);
}
.btn-outline-secondary{
  border-color: rgba(15,18,16,0.12);
}
.btn-outline-secondary:hover{
  background: rgba(15,18,16,0.04);
}

@media (max-width: 992px){
  .hero{ padding: 32px 0; }
  .hero-art{ display:none; }
}
</style>
