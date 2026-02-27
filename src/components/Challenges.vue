<template>
  <main class="challenges-page">
    <!-- HERO: Clean & Simple -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Challenges</h1>
        <p class="lead mb-0">
          Join monthly challenges, track your progress, and stay motivated with the community.
        </p>
      </div>
    </section>

    <!-- FILTERS: Simplified Controls -->
    <section class="filters">
      <div class="container-xxl">
        <div class="filter-bar">
          <!-- Sport Pills -->
          <div class="sport-pills">
            <button
              v-for="s in sports"
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
              <input
                v-model.trim="q"
                class="form-control"
                placeholder="Search challenges..."
              />
            </div>
            <select v-model="sortBy" class="form-select sort-select">
              <option value="popular">Most Popular</option>
              <option value="new">Newest</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- CHALLENGES GRID -->
    <section class="challenges-grid">
      <div class="container-xxl">
        <div class="row g-4">
          <div
            class="col-12 col-md-6 col-lg-4"
            v-for="c in paged"
            :key="c.id"
          >
            <article class="challenge-card">
              <!-- Challenge Image -->
              <div
                class="challenge-image"
                :style="{ backgroundImage: `url(${c.image})` }"
              >
                <span class="status-badge" :class="c.status">
                  {{ c.statusLabel }}
                </span>
              </div>

              <!-- Challenge Content -->
              <div class="challenge-content">
                <div class="challenge-header">
                  <span class="sport-tag">{{ c.sport }}</span>
                  <span class="participants">
                    <i class="bi bi-people-fill"></i>
                    {{ formatK(c.participants) }}
                  </span>
                </div>

                <h3 class="challenge-title">{{ c.title }}</h3>
                <p class="challenge-subtitle">{{ c.subtitle }}</p>

                <div class="challenge-meta">
                  <span class="meta-item">
                    <i class="bi bi-calendar3"></i>
                    {{ c.window }}
                  </span>
                </div>

                <!-- Progress Bar (if active) -->
                <div v-if="c.progress" class="progress-section">
                  <div class="progress-header">
                    <span class="progress-text">
                      {{ c.progress.current }} / {{ c.progress.target }} {{ c.progress.unit }}
                    </span>
                    <span class="progress-percent">{{ pct(c.progress) }}%</span>
                  </div>
                  <div class="progress-bar-container">
                    <div
                      class="progress-bar-fill"
                      :style="{ width: pct(c.progress) + '%' }"
                    ></div>
                  </div>
                </div>

                <!-- Action Button -->
                <button class="btn-join" :class="{ active: c.progress }">
                  {{ c.progress ? 'Continue' : 'Join Challenge' }}
                </button>
              </div>
            </article>
          </div>

          <!-- Empty State -->
          <div class="col-12" v-if="paged.length === 0">
            <div class="empty-state">
              <div class="empty-icon">🏃</div>
              <h3 class="empty-title">No challenges found</h3>
              <p class="empty-text">
                Try adjusting your filters or check back later for new challenges.
              </p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="filtered.length > pageSize">
          <button
            class="btn-page"
            :disabled="page === 1"
            @click="page--"
          >
            <i class="bi bi-chevron-left"></i>
            Previous
          </button>
          <span class="page-info">
            Page {{ page }} of {{ Math.ceil(filtered.length / pageSize) }}
          </span>
          <button
            class="btn-page"
            :disabled="pageEnd >= filtered.length"
            @click="page++"
          >
            Next
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- CTA: Simple & Direct -->
    <section class="cta-section">
      <div class="container-xxl">
        <div class="cta-content">
          <h2 class="cta-title">Ready to challenge yourself?</h2>
          <p class="cta-text">
            Join thousands competing in monthly challenges. Track progress, stay motivated, achieve your goals.
          </p>
          <router-link to="/join-us" class="btn-cta">
            Get Started Free
          </router-link>
        </div>
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
    title: 'Run 100 Miles',
    subtitle: 'Complete 100 miles in 30 days',
    sport: 'Running',
    image: 'https://images.unsplash.com/photo-1540481391483-826de3c13485?q=80&w=1200&auto=format&fit=crop',
    window: 'Sep 1 – Sep 30',
    participants: 124500,
    status: 'ongoing',
    statusLabel: 'Active',
    progress: { current: 42, target: 100, unit: 'mi' }
  },
  {
    id: 2,
    title: 'Ride 500K',
    subtitle: 'Cycle 500 kilometers this month',
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
    title: '30 Day Streak',
    subtitle: 'Run every single day for 30 days',
    sport: 'Running',
    image: 'https://images.unsplash.com/photo-1518310952931-b1de897abd79?q=80&w=1200&auto=format&fit=crop',
    window: 'Oct 1 – Oct 31',
    participants: 45210,
    status: 'upcoming',
    statusLabel: 'Coming Soon',
    progress: null
  },
  {
    id: 4,
    title: 'Swim 25K',
    subtitle: 'Total 25 kilometers in the pool',
    sport: 'Swimming',
    image: 'https://images.unsplash.com/photo-1505764706515-aa95265c5abc?q=80&w=1200&auto=format&fit=crop',
    window: 'Sep 1 – Sep 30',
    participants: 11200,
    status: 'ongoing',
    statusLabel: 'Active',
    progress: { current: 15, target: 25, unit: 'km' }
  },
  {
    id: 5,
    title: 'Elevation Gain 10K',
    subtitle: 'Climb 10,000 feet total elevation',
    sport: 'Hiking',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop',
    window: 'Sep 1 – Sep 30',
    participants: 22050,
    status: 'ongoing',
    statusLabel: 'Active',
    progress: { current: 6250, target: 10000, unit: 'ft' }
  },
  {
    id: 6,
    title: 'Walk 200 Miles',
    subtitle: 'Hit 200 miles walking this month',
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
const page = ref(1)
const pageSize = 9

// Derived lists
const filtered = computed(() => {
  let list = challenges.value.slice()

  if (sport.value !== 'All') {
    list = list.filter(c => c.sport === sport.value)
  }
  
  if (q.value) {
    const term = q.value.toLowerCase()
    list = list.filter(c =>
      c.title.toLowerCase().includes(term) ||
      c.subtitle.toLowerCase().includes(term)
    )
  }

  // Sort
  if (sortBy.value === 'popular') {
    list.sort((a, b) => b.participants - a.participants)
  } else if (sortBy.value === 'new') {
    list.sort((a, b) => (b.status === 'new' ? 1 : 0) - (a.status === 'new' ? 1 : 0))
  } else if (sortBy.value === 'ending') {
    list.sort((a, b) => (a.status === 'ongoing' ? 1 : 0) - (b.status === 'ongoing' ? 1 : 0))
  }

  return list
})

const pageEnd = computed(() => page.value * pageSize)
const paged = computed(() => 
  filtered.value.slice((page.value - 1) * pageSize, pageEnd.value)
)

// Helpers
function pct(p) {
  if (!p) return 0
  return Math.min(100, Math.round((p.current / p.target) * 100))
}

function formatK(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
  return String(n)
}
</script>

<style scoped>
/* ===== Design Tokens ===== */
.challenges-page {
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
  position: relative;
  padding: 140px 0 120px;
  background-image: url('https://images.unsplash.com/photo-1571008887538-b36bb32f4571?q=80&w=2000&auto=format&fit=crop');
  background-size: cover;
  background-position: center 30%;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to right, rgba(15, 18, 16, 0.82) 0%, rgba(15, 18, 16, 0.45) 100%);
}

.hero .container-xxl {
  position: relative;
  z-index: 1;
}

.hero h1 {
  color: white;
  letter-spacing: -0.02em;
}

.hero .lead {
  color: rgba(255, 255, 255, 0.88);
  font-size: 18px;
  font-weight: 400;
  max-width: 600px;
}

/* ===== FILTERS ===== */
.filters {
  background: white;
  padding: 24px 0;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
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

/* ===== CHALLENGES GRID ===== */
.challenges-grid {
  padding: 40px 0 60px;
}

.challenge-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #E5E7EB;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.challenge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  border-color: #D1D5DB;
}

/* Challenge Image */
.challenge-image {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  backdrop-filter: blur(10px);
}

.status-badge.ongoing {
  background: rgba(34, 197, 94, 0.9);
  color: white;
}

.status-badge.new {
  background: rgba(59, 130, 246, 0.9);
  color: white;
}

.status-badge.upcoming {
  background: rgba(107, 114, 128, 0.9);
  color: white;
}

/* Challenge Content */
.challenge-content {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sport-tag {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--r-accent);
}

.participants {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
}

.challenge-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  line-height: 1.3;
}

.challenge-subtitle {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 16px;
  line-height: 1.5;
}

.challenge-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6B7280;
  font-weight: 500;
}

.meta-item i {
  font-size: 14px;
}

/* Progress Section */
.progress-section {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-text {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.progress-percent {
  font-size: 13px;
  font-weight: 700;
  color: var(--r-accent);
}

.progress-bar-container {
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--r-accent) 0%, #d97939 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Join Button */
.btn-join {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  background: var(--r-accent);
  color: white;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: auto;
}

.btn-join:hover {
  background: #a85722;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 106, 42, 0.3);
}

.btn-join.active {
  background: var(--r-olive);
}

.btn-join.active:hover {
  background: var(--r-olive-deep);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 16px;
  color: #6B7280;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
}

.btn-page {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-page:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
}

/* ===== CTA SECTION ===== */
.cta-section {
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
  border-radius: 10px;
  font-weight: 600;
  font-size: 16px;
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

  .filter-bar {
    gap: 12px;
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

  .challenge-image {
    height: 180px;
  }

  .cta-title {
    font-size: 28px;
  }
}
</style>