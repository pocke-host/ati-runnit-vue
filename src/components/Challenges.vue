<!-- src/pages/Challenges.vue -->
<template>
    <main class="challenges-page">
      <!-- HERO -->
      <section class="hero">
        <div class="container-xxl">
          <h1 class="display-6 fw-bold mb-2">Challenges</h1>
          <p class="lead text-muted m-0">
            Pick a goal, stay consistent, and earn badges with the KINETAI community.
          </p>
        </div>
      </section>
  
      <!-- CONTROLS -->
      <section class="controls">
        <div class="container-xxl">
          <div class="row g-2 align-items-center">
            <div class="col-12 col-md-auto">
              <div class="btn-group sport-tabs" role="tablist">
                <button
                  v-for="s in sports"
                  :key="s"
                  class="btn btn-outline-secondary"
                  :class="{ active: sport === s }"
                  @click="sport = s"
                >
                  {{ s }}
                </button>
              </div>
            </div>
  
            <div class="col-12 col-md">
              <input v-model.trim="q" class="form-control" placeholder="Search challenges…" />
            </div>
  
            <div class="col-6 col-md-auto">
              <select v-model="month" class="form-select">
                <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
              </select>
            </div>
  
            <div class="col-6 col-md-auto">
              <select v-model="sortBy" class="form-select">
                <option value="popular">Most popular</option>
                <option value="new">Newest</option>
                <option value="ending">Ending soon</option>
              </select>
            </div>
          </div>
        </div>
      </section>
  
      <!-- GRID -->
      <section class="list">
        <div class="container-xxl">
          <div class="row g-4">
            <div
              class="col-12 col-sm-6 col-lg-4"
              v-for="c in paged"
              :key="c.id"
            >
              <article class="challenge-card h-100">
                <div class="thumb" :style="{ backgroundImage: `url(${c.image})` }">
                  <span class="badge sport-badge" :class="c.sport.toLowerCase()">{{ c.sport }}</span>
                  <span class="badge status" :class="c.status">{{ c.statusLabel }}</span>
                </div>
  
                <div class="body">
                  <h5 class="title mb-1">{{ c.title }}</h5>
                  <p class="text-muted small mb-2">{{ c.subtitle }}</p>
  
                  <ul class="meta small text-muted">
                    <li><i class="bi bi-calendar2-week me-1"></i>{{ c.window }}</li>
                    <li><i class="bi bi-people me-1"></i>{{ formatK(c.participants) }} joined</li>
                  </ul>
  
                  <div v-if="c.progress" class="progress-wrap">
                    <div class="d-flex justify-content-between small mb-1">
                      <span>{{ c.progress.current }} / {{ c.progress.target }} {{ c.progress.unit }}</span>
                      <span>{{ pct(c.progress) }}%</span>
                    </div>
                    <div class="progress" role="progressbar" :aria-valuenow="pct(c.progress)" aria-valuemin="0" aria-valuemax="100">
                      <div class="progress-bar" :style="{ width: pct(c.progress) + '%' }"></div>
                    </div>
                  </div>
  
                  <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-primary w-50">Join</button>
                    <button class="btn btn-outline-dark w-50">View</button>
                  </div>
                </div>
              </article>
            </div>
  
            <!-- Empty state -->
            <div class="col-12" v-if="paged.length === 0">
              <div class="empty">
                <h5 class="mb-1">No challenges found</h5>
                <p class="text-muted m-0">Try a different sport, month, or search.</p>
              </div>
            </div>
          </div>
  
          <!-- Pagination-ish (UI only) -->
          <div class="d-flex justify-content-center mt-4" v-if="filtered.length > pageSize">
            <button class="btn btn-outline-dark me-2" :disabled="page === 1" @click="page--">Previous</button>
            <button class="btn btn-outline-dark" :disabled="pageEnd >= filtered.length" @click="page++">Next</button>
          </div>
        </div>
      </section>
  
      <!-- CTA BAND -->
      <section class="cta">
        <div class="container-xxl text-center">
          <h2 class="fw-bold mb-2">Ready to start your next streak?</h2>
          <p class="text-muted mb-3">Pick a challenge and we’ll cheer you on.</p>
          <router-link to="/signup" class="btn btn-primary btn-lg">Create free account</router-link>
        </div>
      </section>
    </main>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  
  // Mock data
  const challenges = ref([
    {
      id: 1,
      title: 'Run 50 Miles in September',
      subtitle: 'Stack consistent miles all month',
      sport: 'Running',
      image: 'https://images.unsplash.com/photo-1540481391483-826de3c13485?q=80&w=1200&auto=format&fit=crop',
      window: 'Sep 1 – Sep 30',
      participants: 124500,
      status: 'ongoing',
      statusLabel: 'Ongoing',
      progress: { current: 42, target: 100, unit: 'km' }
    },
    {
      id: 2,
      title: 'Ride 100K',
      subtitle: 'Build aerobic base on two wheels',
      sport: 'Cycling',
      image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?q=80&w=1200&auto=format&fit=crop',
      window: 'Sep 1 – Sep 30',
      participants: 98000,
      status: 'new',
      statusLabel: 'New',
      progress: null
    },
    {
      id: 3,
      title: '5K a Day',
      subtitle: 'Run 5 kilometers every day',
      sport: 'Running',
      image: 'https://images.unsplash.com/photo-1518310952931-b1de897abd79?q=80&w=1200&auto=format&fit=crop',
      window: 'Oct 1 – Oct 31',
      participants: 45210,
      status: 'upcoming',
      statusLabel: 'Opens soon',
      progress: null
    },
    {
      id: 4,
      title: 'Swim the Distance',
      subtitle: 'Accumulate 10K in the pool or open water',
      sport: 'Swimming',
      image: 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop',
      window: 'Sep 1 – Sep 30',
      participants: 11200,
      status: 'ongoing',
      statusLabel: 'Ongoing',
      progress: { current: 6, target: 10, unit: 'km' }
    },
    {
      id: 5,
      title: 'Climb High',
      subtitle: 'Climb 3,000 m of elevation gain',
      sport: 'Hiking',
      image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
      window: 'Sep 1 – Sep 30',
      participants: 22050,
      status: 'ongoing',
      statusLabel: 'Ongoing',
      progress: { current: 1875, target: 3000, unit: 'm' }
    },
    {
      id: 6,
      title: 'Walk 200K Steps',
      subtitle: 'Just keep moving — anywhere counts',
      sport: 'Walking',
      image: 'https://images.unsplash.com/photo-1425136738262-212551713a58?q=80&w=1200&auto=format&fit=crop',
      window: 'Sep 1 – Sep 30',
      participants: 67500,
      status: 'new',
      statusLabel: 'New',
      progress: null
    }
  ])
  
  // UI state
  const sports = ['All', 'Running', 'Cycling', 'Swimming', 'Hiking', 'Walking']
  const sport = ref('All')
  const q = ref('')
  const sortBy = ref('popular')
  const month = ref('sep')
  const page = ref(1)
  const pageSize = 9
  
  const months = [
    { value: 'sep', label: 'September' },
    { value: 'oct', label: 'October' },
    { value: 'nov', label: 'November' },
    { value: 'dec', label: 'December' }
  ]
  
  // Derived lists
  const filtered = computed(() => {
    let list = challenges.value.slice()
  
    if (sport.value !== 'All') {
      list = list.filter(c => c.sport === sport.value)
    }
    if (q.value) {
      const t = q.value.toLowerCase()
      list = list.filter(c =>
        c.title.toLowerCase().includes(t) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(t))
      )
    }
    // Basic “month” filter demo: keep September if sep, etc. (mock)
    if (month.value === 'sep') {
      list = list.filter(c => c.window.toLowerCase().includes('sep'))
    }
  
    // Sort
    if (sortBy.value === 'popular') {
      list.sort((a, b) => (b.participants || 0) - (a.participants || 0))
    } else if (sortBy.value === 'new') {
      list.sort((a, b) => (b.status === 'new') - (a.status === 'new'))
    } else if (sortBy.value === 'ending') {
      list.sort((a, b) => (a.status === 'ongoing') - (b.status === 'ongoing')) // placeholder
    }
  
    return list
  })
  
  const pageEnd = computed(() => page.value * pageSize)
  const paged = computed(() => filtered.value.slice((page.value - 1) * pageSize, pageEnd.value))
  
  // Helpers
  function pct(p) {
    if (!p) return 0
    return Math.min(100, Math.round((p.current / p.target) * 100))
  }
  function formatK(n) {
    if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
    return '' + n
  }
  </script>
  
  <style scoped>
  /* Page frame */
  .challenges-page{
    --nav-h:72px;   
    padding-top: var(--nav-h);   /* TopNav height */
    --footer-h:40px;   /* Footer height */
    min-height: calc(100vh - var(--nav-h) - var(--footer-h));
    background:#fff;
    display:flex; flex-direction:column;
  }
  
  /* Sections */
  .hero{ padding: 40px 0 20px; background:#f7f5f2; border-bottom:1px solid #eee; }
  .controls{ padding:16px 0; border-bottom:1px solid #f0f0f0; background:#fff; }
  .list{ padding: 28px 0 36px; }
  .cta{ padding: 56px 0 72px; background:#f7f5f2; border-top:1px solid #eee; }
  
  /* Tabs */
  .sport-tabs .btn{ border-color:#ddd; }
  .sport-tabs .btn.active{
    background:#AA0505; color:#fff; border-color:#AA0505;
  }
  
  /* Cards */
  .challenge-card{
    border:1px solid #eee; border-radius:16px; overflow:hidden; background:#fff;
    display:flex; flex-direction:column;
  }
  .challenge-card .thumb{
    position:relative; height:160px; background:#e9ecef center/cover no-repeat;
  }
  .badge{
    position:absolute; top:12px; left:12px;
    background:rgba(0,0,0,.65); color:#fff; border-radius:999px; padding:.35rem .6rem;
    font-size:.75rem; backdrop-filter:saturate(140%) blur(2px);
  }
  .badge.status{ left:auto; right:12px; }
  .badge.status.new{ background:#1f2937; }
  .badge.status.ongoing{ background:#16a34a; }
  .badge.status.upcoming{ background:#6b7280; }
  
  .sport-badge.running{ background:#fc4c02; } /* Strava-ish orange for running */
  .sport-badge.cycling{ background:#2563eb; }
  .sport-badge.swimming{ background:#0891b2; }
  .sport-badge.hiking{ background:#166534; }
  .sport-badge.walking{ background:#7c3aed; }
  
  .challenge-card .body{ padding:14px 14px 16px; }
  .title{ line-height:1.25; }
  
  /* Meta */
  .meta{ list-style:none; padding:0; margin:0 0 .25rem 0; display:flex; gap:10px; flex-wrap:wrap; }
  .meta li{ display:flex; align-items:center; }
  
  /* Progress */
  .progress-wrap{ margin-top:.25rem; }
  .progress{ height:8px; background:#eee; border-radius:999px; overflow:hidden; }
  .progress-bar{ height:100%; background:#AA0505; } /* KINETAI purple */
  
  /* Empty */
  .empty{
    text-align:center; padding:48px; border:1px dashed #e5e7eb; border-radius:16px; background:#fafafa;
  }
  
  /* Buttons in KINETAI purple */
  .btn-primary{
    --bs-btn-bg:#AA0505; --bs-btn-border-color:#AA0505;
    --bs-btn-hover-bg:#6a006a; --bs-btn-hover-border-color:#6a006a;
  }
  
  /* Responsive */
  @media (max-width: 768px){
    .challenge-card .thumb{ height:150px; }
  }
  </style>
  