<!-- src/pages/Clubs.vue -->
<template>
  <main class="clubs-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Clubs</h1>
        <p class="lead mb-0">
          Connect with athletes who share your passions. Join a club and train together.
        </p>
      </div>
    </section>

    <!-- SEARCH + FILTERS -->
    <section class="controls">
      <div class="container-xxl">
        <div class="filter-bar">
          <!-- Sport Pills -->
          <div class="sport-pills">
            <button
              v-for="s in ['All', ...sports]"
              :key="s"
              class="sport-pill"
              :class="{ active: sport === s }"
              @click="sport = s"
            >
              {{ s }}
            </button>
          </div>

          <!-- Search & Sort -->
          <div class="search-sort">
            <div class="search-box">
              <i class="bi bi-search"></i>
              <input v-model.trim="q" class="form-control" placeholder="Search clubs…" />
            </div>
            <select v-model="sortBy" class="form-select sort-select">
              <option value="popular">Most popular</option>
              <option value="new">Newest</option>
              <option value="nearby">Nearby</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- CLUB GRID -->
    <section class="list">
      <div class="container-xxl">
        <div class="row g-4">
          <div
            class="col-12 col-sm-6 col-lg-4"
            v-for="club in filtered"
            :key="club.id"
          >
            <article class="club-card h-100">
              <div class="thumb" :style="{ backgroundImage: `url(${club.image})` }"></div>
              <div class="body">
                <h5 class="title mb-1">{{ club.name }}</h5>
                <p class="text-muted small mb-2">{{ club.sport }} • {{ club.location }}</p>
                <p class="small mb-3">{{ club.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="members-count"><i class="bi bi-people-fill"></i> {{ formatK(club.members) }} members</span>
                  <button class="btn-join">Join</button>
                </div>
              </div>
            </article>
          </div>

          <!-- Empty -->
          <div class="col-12" v-if="filtered.length === 0">
            <div class="empty">
              <h5 class="mb-1">No clubs found</h5>
              <p class="text-muted m-0">Try another sport or search term.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta">
      <div class="container-xxl">
        <div class="cta-content">
          <h2 class="cta-title">Start your own club</h2>
          <p class="cta-text">Bring athletes together, create events, and build community.</p>
          <button class="btn-cta">Create a Club</button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'

// Mock data
const clubs = ref([
  {
    id: 1,
    name: 'Purple Runners LA',
    sport: 'Running',
    location: 'Los Angeles, CA',
    description: 'Weekly runs on the beach and downtown routes.',
    members: 1234,
    image: 'https://images.unsplash.com/photo-1599058917212-d750089bc07c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 2,
    name: 'Cycling Crew SF',
    sport: 'Cycling',
    location: 'San Francisco, CA',
    description: 'Climbs, coffee rides, and weekend epics.',
    members: 2840,
    image: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 3,
    name: 'Swim Strong OC',
    sport: 'Swimming',
    location: 'Orange County, CA',
    description: 'Pool and open water training with friendly vibes.',
    members: 640,
    image: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?q=80&w=1200&auto=format&fit=crop'
  }
])

const sports = ['Running', 'Cycling', 'Swimming', 'Hiking', 'Walking']
const q = ref('')
const sport = ref('All')
const sortBy = ref('popular')

const filtered = computed(() => {
  let list = clubs.value.slice()
  if (sport.value !== 'All') {
    list = list.filter(c => c.sport === sport.value)
  }
  if (q.value) {
    const t = q.value.toLowerCase()
    list = list.filter(c =>
      c.name.toLowerCase().includes(t) ||
      c.description.toLowerCase().includes(t)
    )
  }
  if (sortBy.value === 'popular') {
    list.sort((a, b) => b.members - a.members)
  } else if (sortBy.value === 'new') {
    list.reverse()
  }
  return list
})

function formatK(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
  return '' + n
}
</script>

<style scoped>
/* ===== Design Tokens ===== */
.clubs-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  --r-white: #FFFFFF;

  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background: var(--r-offwhite);
  min-height: 100vh;
  padding-top: 57px;
}

/* ===== HERO ===== */
.hero {
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
  padding: 80px 0 60px;
}

.hero h1 {
  color: white;
  letter-spacing: -0.02em;
}

.hero .lead {
  color: rgba(255, 255, 255, 0.9);
  font-size: 18px;
  font-weight: 400;
  max-width: 700px;
}

/* ===== CONTROLS ===== */
.controls {
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 73px;
  z-index: 100;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Sport Pills */
.sport-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sport-pill {
  padding: 8px 20px;
  border: 1px solid #E5E7EB;
  border-radius: 24px;
  background: white;
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sport-pill:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.sport-pill.active {
  background: var(--r-accent);
  border-color: var(--r-accent);
  color: white;
}

/* Search & Sort */
.search-sort {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 16px;
}

.search-box .form-control {
  height: 44px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding-left: 40px;
  font-size: 15px;
}

.search-box .form-control:focus {
  outline: none;
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196, 106, 42, 0.1);
}

.sort-select {
  width: auto;
  min-width: 160px;
  height: 44px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
}

.sort-select:focus {
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196, 106, 42, 0.1);
}

/* ===== CLUB CARDS ===== */
.list {
  padding: 40px 0 60px;
}

.club-card {
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.club-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  border-color: #D1D5DB;
}

.club-card .thumb {
  height: 180px;
  background: #e9ecef center/cover no-repeat;
}

.club-card .body {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.club-card .title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.members-count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
}

/* Join Button */
.btn-join {
  padding: 8px 18px;
  border: none;
  border-radius: 10px;
  background: var(--r-accent);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-join:hover {
  background: #a85722;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 106, 42, 0.3);
}

/* Empty */
.empty {
  text-align: center;
  padding: 80px 24px;
  border: 2px dashed rgba(15, 18, 16, 0.15);
  border-radius: 20px;
  background: rgba(245, 246, 243, 0.4);
}

/* ===== CTA SECTION ===== */
.cta {
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  padding: 80px 0;
}

.cta-content {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.cta-text {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 32px;
  line-height: 1.6;
}

.btn-cta {
  display: inline-block;
  padding: 14px 40px;
  background: var(--r-accent);
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cta:hover {
  background: #a85722;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .hero {
    padding: 60px 0 40px;
  }

  .hero h1 {
    font-size: 32px;
  }

  .controls {
    position: static;
  }

  .search-sort {
    flex-direction: column;
  }

  .search-box {
    max-width: 100%;
  }

  .sort-select {
    width: 100%;
  }

  .sport-pills {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .cta-title {
    font-size: 28px;
  }
}
</style>