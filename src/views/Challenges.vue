<template>
  <main class="challenges-page">
    <!-- HERO -->
    <section class="hero">
      <div class="container-xxl">
        <h1 class="display-5 fw-bold mb-3">Challenges</h1>
        <p class="lead mb-0">
          Join monthly challenges, track your progress, and stay motivated with the community.
        </p>
      </div>
    </section>

    <!-- TAB BAR -->
    <section class="tab-section">
      <div class="container-xxl">
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'all' }"
            @click="activeTab = 'all'"
          >
            <i class="bi bi-trophy"></i>
            All Challenges
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'my' }"
            @click="activeTab = 'my'"
          >
            <i class="bi bi-person-check"></i>
            My Challenges
            <span v-if="myChallenges.length" class="tab-count">{{ myChallenges.length }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FILTERS (All tab only) -->
    <section v-if="activeTab === 'all'" class="filters">
      <div class="container-xxl">
        <div class="filter-bar">
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

        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-olive" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="loading-text">Loading challenges...</p>
        </div>

        <template v-else>
          <div class="row g-4">
            <div
              class="col-12 col-md-6 col-lg-4"
              v-for="c in displayedChallenges"
              :key="c.id"
            >
              <article class="challenge-card" :class="{ entered: isEntered(c.id) }">
                <!-- Challenge Image -->
                <div
                  class="challenge-image"
                  :style="c.imageUrl ? { backgroundImage: `url(${c.imageUrl})` } : {}"
                >
                  <div v-if="!c.imageUrl" class="image-placeholder">
                    <i class="bi bi-trophy-fill"></i>
                  </div>
                  <span v-if="c.sport" class="status-badge ongoing">{{ c.sport }}</span>
                  <span v-if="isEntered(c.id)" class="entered-badge">
                    <i class="bi bi-check-circle-fill"></i> Entered
                  </span>
                </div>

                <!-- Challenge Content -->
                <div class="challenge-content">
                  <div class="challenge-header">
                    <span class="sport-tag">{{ c.sport || 'General' }}</span>
                    <span class="participants">
                      <i class="bi bi-people-fill"></i>
                      {{ formatK(c.participantCount || 0) }}
                    </span>
                  </div>

                  <h3 class="challenge-title">{{ c.name }}</h3>
                  <p class="challenge-subtitle">{{ c.description }}</p>

                  <div class="challenge-meta">
                    <span v-if="c.endDate" class="meta-item">
                      <i class="bi bi-calendar3"></i>
                      Ends {{ formatDate(c.endDate) }}
                    </span>
                    <span v-if="c.prize" class="meta-item prize-item">
                      <i class="bi bi-gift-fill"></i>
                      {{ c.prize }}
                    </span>
                  </div>

                  <!-- Action buttons row -->
                  <div class="card-actions">
                    <button
                      v-if="!isEntered(c.id)"
                      class="btn-join"
                      :disabled="enteringId === c.id"
                      @click="enterChallenge(c.id)"
                    >
                      <span v-if="enteringId === c.id">
                        <span class="spinner-border spinner-border-sm me-1" role="status"></span>
                        Joining...
                      </span>
                      <span v-else>Join Challenge</span>
                    </button>

                    <template v-else>
                      <button class="btn-lb" @click="openLeaderboard(c)">
                        <i class="bi bi-bar-chart-line-fill"></i>
                        Leaderboard
                      </button>
                      <button
                        class="btn-leave"
                        :disabled="enteringId === c.id"
                        @click="leaveChallenge(c.id)"
                      >
                        <span v-if="enteringId === c.id">
                          <span class="spinner-border spinner-border-sm" role="status"></span>
                        </span>
                        <span v-else>Leave</span>
                      </button>
                    </template>
                  </div>
                </div>
              </article>
            </div>

            <!-- Empty state -->
            <div class="col-12" v-if="displayedChallenges.length === 0">
              <div class="empty-state">
                <div class="empty-icon">
                  <i class="bi bi-trophy"></i>
                </div>
                <h3 class="empty-title">
                  {{ activeTab === 'my' ? 'No challenges entered yet' : 'No challenges found' }}
                </h3>
                <p class="empty-text">
                  {{
                    activeTab === 'my'
                      ? 'Browse All Challenges and join one to get started.'
                      : 'Try adjusting your filters or check back later for new challenges.'
                  }}
                </p>
                <button
                  v-if="activeTab === 'my'"
                  class="btn-join mt-2"
                  style="width: auto; padding: 0 28px;"
                  @click="activeTab = 'all'"
                >
                  Browse Challenges
                </button>
              </div>
            </div>
          </div>

          <!-- Pagination (All tab only) -->
          <div class="pagination" v-if="activeTab === 'all' && filtered.length > pageSize">
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
        </template>
      </div>
    </section>

    <!-- LEADERBOARD OVERLAY -->
    <Transition name="lb-fade">
      <div v-if="lbOpen" class="lb-overlay" @click="lbOpen = false"></div>
    </Transition>

    <!-- LEADERBOARD DRAWER -->
    <Transition name="lb-slide">
      <div v-if="lbOpen" class="lb-drawer">
        <div class="lb-header">
          <div>
            <div class="lb-label">Leaderboard</div>
            <h2 class="lb-title">{{ lbChallenge?.name }}</h2>
          </div>
          <button class="lb-close" @click="lbOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="lbLoading" class="lb-loading">
          <div class="spinner-border text-olive" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3 mb-0" style="color:#6B7280; font-size:14px;">Fetching leaderboard...</p>
        </div>

        <!-- Empty leaderboard -->
        <div v-else-if="leaderboard.length === 0" class="lb-empty">
          <i class="bi bi-bar-chart-line" style="font-size:48px; color:#D1D5DB;"></i>
          <p class="mt-3 mb-0" style="color:#6B7280;">No entries yet. Be the first!</p>
        </div>

        <!-- Ranked list -->
        <ul v-else class="lb-list">
          <li
            v-for="entry in leaderboard"
            :key="entry.userId"
            class="lb-row"
            :class="{ 'lb-row-top': entry.rank <= 3 }"
          >
            <span class="lb-rank" :class="rankClass(entry.rank)">
              {{ entry.rank <= 3 ? rankEmoji(entry.rank) : entry.rank }}
            </span>
            <div class="lb-avatar">
              {{ getInitial(entry.displayName) }}
            </div>
            <router-link
              :to="`/profile/${entry.userId}`"
              class="lb-name"
              @click="lbOpen = false"
            >
              {{ entry.displayName }}
            </router-link>
            <span class="lb-value">{{ entry.value }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const getAuthHeaders = () => ({ Authorization: 'Bearer ' + localStorage.getItem('token') })

// ── Tab state ────────────────────────────────────────────────
const activeTab = ref('all')  // 'all' | 'my'

// ── Data ─────────────────────────────────────────────────────
const allChallenges = ref([])
const myChallenges  = ref([])
const loading       = ref(false)
const enteringId    = ref(null)

// ── Leaderboard drawer ───────────────────────────────────────
const lbOpen       = ref(false)
const lbChallenge  = ref(null)
const leaderboard  = ref([])
const lbLoading    = ref(false)

// ── Filter / sort / pagination (All tab) ─────────────────────
const sports   = ['All', 'Running', 'Cycling', 'Swimming', 'Hiking', 'Walking', 'Triathlon']
const sport    = ref('All')
const q        = ref('')
const sortBy   = ref('popular')
const page     = ref(1)
const pageSize = 9

// ── API calls ─────────────────────────────────────────────────
async function fetchChallenges() {
  loading.value = true
  try {
    const res = await fetch(`${API_URL}/challenges`, {
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch challenges')
    allChallenges.value = await res.json()
  } catch (err) {
    console.error('fetchChallenges:', err)
    allChallenges.value = []
  } finally {
    loading.value = false
  }
}

async function fetchMyChallenges() {
  try {
    const res = await fetch(`${API_URL}/challenges/my`, {
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch my challenges')
    myChallenges.value = await res.json()
  } catch (err) {
    console.error('fetchMyChallenges:', err)
    myChallenges.value = []
  }
}

async function enterChallenge(id) {
  enteringId.value = id
  try {
    const res = await fetch(`${API_URL}/challenges/${id}/enter`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to enter challenge')
    await fetchMyChallenges()
  } catch (err) {
    console.error('enterChallenge:', err)
  } finally {
    enteringId.value = null
  }
}

async function leaveChallenge(id) {
  enteringId.value = id
  try {
    const res = await fetch(`${API_URL}/challenges/${id}/leave`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to leave challenge')
    await fetchMyChallenges()
    // If the leaderboard drawer is open for this challenge, close it
    if (lbChallenge.value?.id === id) lbOpen.value = false
  } catch (err) {
    console.error('leaveChallenge:', err)
  } finally {
    enteringId.value = null
  }
}

async function fetchLeaderboard(id) {
  lbLoading.value = true
  leaderboard.value = []
  try {
    const res = await fetch(`${API_URL}/challenges/${id}/leaderboard`, {
      headers: getAuthHeaders()
    })
    if (!res.ok) throw new Error('Failed to fetch leaderboard')
    leaderboard.value = await res.json()
  } catch (err) {
    console.error('fetchLeaderboard:', err)
    leaderboard.value = []
  } finally {
    lbLoading.value = false
  }
}

async function openLeaderboard(challenge) {
  lbChallenge.value = challenge
  lbOpen.value = true
  await fetchLeaderboard(challenge.id)
}

// ── Helpers ──────────────────────────────────────────────────
function isEntered(id) {
  return myChallenges.value.some(c => c.id === id)
}

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatK(n) {
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + 'k'
  return String(n)
}

function getInitial(name) {
  return (name || '?').charAt(0).toUpperCase()
}

function rankClass(rank) {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return ''
}

function rankEmoji(rank) {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return rank
}

// ── Derived lists ─────────────────────────────────────────────
const filtered = computed(() => {
  let list = allChallenges.value.slice()

  if (sport.value !== 'All') {
    list = list.filter(c => (c.sport || '').toLowerCase() === sport.value.toLowerCase())
  }

  if (q.value) {
    const term = q.value.toLowerCase()
    list = list.filter(c =>
      (c.name || '').toLowerCase().includes(term) ||
      (c.description || '').toLowerCase().includes(term)
    )
  }

  if (sortBy.value === 'popular') {
    list.sort((a, b) => (b.participantCount || 0) - (a.participantCount || 0))
  } else if (sortBy.value === 'ending') {
    list.sort((a, b) => new Date(a.endDate || 0) - new Date(b.endDate || 0))
  }

  return list
})

const pageEnd = computed(() => page.value * pageSize)
const paged   = computed(() =>
  filtered.value.slice((page.value - 1) * pageSize, pageEnd.value)
)

const displayedChallenges = computed(() =>
  activeTab.value === 'all' ? paged.value : myChallenges.value
)

onMounted(() => {
  fetchChallenges()
  fetchMyChallenges()
})
</script>

<style scoped>
/* ===== Design Tokens ===== */
.challenges-page {
  --r-olive:      #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent:     #C46A2A;
  --r-offwhite:   #F5F6F3;
  --r-white:      #FFFFFF;

  font-family: Futura, 'Avenir Next', 'Avenir', system-ui, -apple-system, sans-serif;
  background: var(--r-offwhite);
  min-height: 100vh;
  padding-top: 72px;
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
  background: linear-gradient(to right, rgba(15,18,16,0.82) 0%, rgba(15,18,16,0.45) 100%);
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
  color: rgba(255,255,255,0.88);
  font-size: 18px;
  font-weight: 400;
  max-width: 600px;
}

/* ===== TAB BAR ===== */
.tab-section {
  background: white;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 72px;
  z-index: 90;
}

.tab-bar {
  display: flex;
  gap: 4px;
  padding: 12px 0 0;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 22px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  font-size: 15px;
  font-weight: 600;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.tab-btn i {
  font-size: 15px;
}

.tab-btn:hover {
  color: var(--r-olive);
}

.tab-btn.active {
  color: var(--r-olive-deep);
  border-bottom-color: var(--r-accent);
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: var(--r-accent);
  color: white;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
}

/* ===== FILTERS ===== */
.filters {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: calc(72px + 49px);
  z-index: 80;
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sport-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.sport-pill {
  padding: 7px 18px;
  border: 1px solid #E5E7EB;
  border-radius: 24px;
  background: white;
  color: #374151;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
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
  font-size: 15px;
}

.search-box .form-control {
  height: 42px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding-left: 40px;
  font-size: 14px;
  font-family: inherit;
}

.search-box .form-control:focus {
  outline: none;
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196,106,42,0.1);
}

.sort-select {
  width: auto;
  min-width: 160px;
  height: 42px;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
}

.sort-select:focus {
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196,106,42,0.1);
}

/* ===== CHALLENGES GRID ===== */
.challenges-grid {
  padding: 40px 0 60px;
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
}

.text-olive { color: var(--r-olive) !important; }

.loading-text {
  color: #6B7280;
  font-size: 15px;
  margin: 0;
}

/* Cards */
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
  box-shadow: 0 12px 28px rgba(0,0,0,0.12);
  border-color: #D1D5DB;
}

.challenge-card.entered {
  border-color: var(--r-olive);
  border-width: 2px;
}

/* Challenge Image */
.challenge-image {
  position: relative;
  height: 200px;
  background-size: cover;
  background-position: center;
  background-color: #E5E7EB;
}

.image-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  font-size: 56px;
  color: rgba(255,255,255,0.3);
}

.status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  backdrop-filter: blur(10px);
}

.status-badge.ongoing {
  background: rgba(34,197,94,0.9);
  color: white;
}

.entered-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(90,107,78,0.92);
  color: white;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  gap: 5px;
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
  margin-bottom: 10px;
}

.sport-tag {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
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
  font-size: 19px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 6px;
  line-height: 1.3;
}

.challenge-subtitle {
  font-size: 14px;
  color: #6B7280;
  margin-bottom: 14px;
  line-height: 1.5;
  flex: 1;
}

.challenge-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F3F4F6;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #6B7280;
  font-weight: 500;
}

.prize-item {
  color: var(--r-accent);
  font-weight: 600;
}

/* Card action buttons */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn-join {
  flex: 1;
  height: 42px;
  border: none;
  border-radius: 10px;
  background: var(--r-accent);
  color: white;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-join:hover:not(:disabled) {
  background: #a85722;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196,106,42,0.3);
}

.btn-join:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-lb {
  flex: 1;
  height: 42px;
  border: 1.5px solid var(--r-olive);
  border-radius: 10px;
  background: white;
  color: var(--r-olive-deep);
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
}

.btn-lb:hover {
  background: var(--r-olive);
  color: white;
}

.btn-leave {
  height: 42px;
  padding: 0 14px;
  border: 1.5px solid #E5E7EB;
  border-radius: 10px;
  background: white;
  color: #9CA3AF;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: nowrap;
}

.btn-leave:hover:not(:disabled) {
  border-color: #EF4444;
  color: #EF4444;
  background: #FEF2F2;
}

.btn-leave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #D1D5DB;
  margin-bottom: 20px;
  line-height: 1;
}

.empty-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
}

.empty-text {
  font-size: 15px;
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
  font-family: inherit;
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

/* ===== LEADERBOARD OVERLAY ===== */
.lb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 1090;
  backdrop-filter: blur(2px);
}

/* ===== LEADERBOARD DRAWER ===== */
.lb-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: white;
  z-index: 1100;
  box-shadow: -8px 0 32px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.lb-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 28px 24px 20px;
  border-bottom: 1px solid #F3F4F6;
  background: white;
  flex-shrink: 0;
}

.lb-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--r-accent);
  margin-bottom: 4px;
}

.lb-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--r-olive-deep);
  margin: 0;
  line-height: 1.3;
}

.lb-close {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: #F3F4F6;
  color: #374151;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-left: 12px;
}

.lb-close:hover {
  background: #E5E7EB;
}

/* Loading / empty inside drawer */
.lb-loading,
.lb-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
}

/* Ranked list */
.lb-list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 12px 0;
}

.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  transition: background 0.15s ease;
}

.lb-row:hover {
  background: #F9FAFB;
}

.lb-row-top {
  background: #FAFDF8;
}

.lb-row-top:hover {
  background: #F4F9F0;
}

.lb-rank {
  width: 32px;
  text-align: center;
  font-size: 15px;
  font-weight: 800;
  color: #9CA3AF;
  flex-shrink: 0;
}

.rank-gold   { color: #F59E0B; font-size: 20px; }
.rank-silver { color: #9CA3AF; font-size: 20px; }
.rank-bronze { color: #B45309; font-size: 20px; }

.lb-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.lb-name {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lb-name:hover {
  color: var(--r-accent);
}

.lb-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--r-olive);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ===== TRANSITIONS ===== */
.lb-fade-enter-active,
.lb-fade-leave-active { transition: opacity 0.25s ease; }
.lb-fade-enter-from,
.lb-fade-leave-to   { opacity: 0; }

.lb-slide-enter-active,
.lb-slide-leave-active { transition: transform 0.3s cubic-bezier(0.32,0,0.15,1); }
.lb-slide-enter-from,
.lb-slide-leave-to   { transform: translateX(100%); }

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
    -webkit-overflow-scrolling: touch;
  }

  .challenge-image {
    height: 180px;
  }

  .lb-drawer {
    width: 100%;
  }
}
</style>
