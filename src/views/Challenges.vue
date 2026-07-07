<template>
  <main class="challenges-page">
    <!-- HERO -->
    <section class="ch-hero">
      <div class="ch-inner">
        <span class="ch-eyebrow">Compete</span>
        <h1 class="ch-hero-headline">Challenges.</h1>
        <p class="ch-hero-sub">Monthly challenges, community competition, milestones that stick.</p>
      </div>
    </section>

    <!-- TAB BAR -->
    <section class="ch-tabs-bar">
      <div class="ch-inner">
        <div class="ch-tabs">
          <button class="ch-tab" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
            All Challenges
          </button>
          <button class="ch-tab" :class="{ active: activeTab === 'my' }" @click="activeTab = 'my'">
            My Challenges
            <span v-if="myChallenges.length" class="ch-tab-count">{{ myChallenges.length }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- FILTERS (All tab only) -->
    <section v-if="activeTab === 'all'" class="ch-filters">
      <div class="ch-inner">
        <div class="ch-filter-bar">
          <div class="ch-sport-pills">
            <button
              v-for="s in sports"
              :key="s"
              class="ch-sport-pill"
              :class="{ active: sport === s }"
              @click="sport = s"
            >{{ s }}</button>
          </div>
          <div class="ch-search-sort">
            <div class="ch-search-wrap">
              <svg class="ch-search-icon" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
              <input v-model.trim="q" class="ch-search-input" placeholder="Search challenges…" />
            </div>
            <select v-model="sortBy" class="ch-sort-select">
              <option value="popular">Most Popular</option>
              <option value="new">Newest</option>
              <option value="ending">Ending Soon</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- CHALLENGES GRID -->
    <section class="ch-grid-section">
      <div class="ch-inner">

        <!-- Loading state -->
        <div v-if="loading" class="ch-grid">
          <SkeletonCard v-for="n in 6" :key="n" variant="challenge" />
        </div>

        <template v-else>
          <div class="ch-grid">
            <article
              v-for="c in displayedChallenges"
              :key="c.id"
              class="challenge-card"
              :class="{ entered: isEntered(c.id) }"
            >
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

                  <!-- Progress bar for entered challenges -->
                  <div v-if="isEntered(c.id) && getMyProgress(c)" class="challenge-progress">
                    <div class="cp-row">
                      <span class="cp-label">Your progress</span>
                      <span class="cp-val">{{ getMyProgress(c).current }} / {{ getMyProgress(c).goal }} {{ getMyProgress(c).unit }}</span>
                    </div>
                    <div class="cp-bar">
                      <div class="cp-fill" :style="{ width: Math.min(getMyProgress(c).pct, 100) + '%' }"></div>
                    </div>
                    <div v-if="getMyProgress(c).pct >= 100" class="cp-complete">
                      <i class="bi bi-trophy-fill me-1"></i>Goal achieved!
                    </div>
                  </div>

                  <!-- Action buttons row -->
                  <div class="card-actions">
                    <button
                      v-if="!isEntered(c.id)"
                      class="btn-join"
                      :disabled="enteringId === c.id"
                      @click="enterChallenge(c.id)"
                    >
                      <span v-if="enteringId === c.id" class="ch-spinner" role="status"></span>
                      <span v-else>Join Challenge</span>
                    </button>

                    <template v-else>
                      <button class="btn-lb" @click="openLeaderboard(c)">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
                        Leaderboard
                      </button>
                      <button
                        class="btn-leave"
                        :disabled="enteringId === c.id"
                        @click="leaveChallenge(c.id)"
                      >
                        <span v-if="enteringId === c.id" class="ch-spinner" role="status"></span>
                        <span v-else>Leave</span>
                      </button>
                    </template>
                  </div>
                </div>
            </article>

            <!-- Empty state -->
            <div class="ch-empty-wrap" v-if="displayedChallenges.length === 0">
              <div class="empty-state">
                <div class="empty-icon">
                  <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#16130F" stroke-width="2"><path d="M6 4h12v3a6 6 0 0 1-12 0V4Z"/><path d="M6 6H3v2a3 3 0 0 0 3 3M18 6h3v2a3 3 0 0 1-3 3"/><path d="M9 18h6M12 14v4M8 22h8"/></svg>
                </div>
                <h3 class="empty-title">
                  {{ activeTab === 'my' ? 'No challenges yet.' : 'No challenges found.' }}
                </h3>
                <p class="empty-text">
                  {{
                    activeTab === 'my'
                      ? 'Nothing live right now — check back soon, or start one and drag your crew in.'
                      : 'Try adjusting your filters or check back later for new challenges.'
                  }}
                </p>
                <button
                  v-if="activeTab === 'my'"
                  class="btn-join"
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
      <div v-if="lbOpen" class="lb-drawer" role="dialog" aria-modal="true" aria-label="Leaderboard">
        <div class="lb-header">
          <div>
            <div class="lb-label">Leaderboard</div>
            <h2 class="lb-title">{{ lbChallenge?.name }}</h2>
          </div>
          <button class="lb-close" @click="lbOpen = false" aria-label="Close leaderboard">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="lbLoading" class="lb-loading">
          <span class="ch-spinner ch-spinner--lg"></span>
          <p class="lb-loading-text">Fetching leaderboard…</p>
        </div>

        <!-- Empty leaderboard -->
        <div v-else-if="leaderboard.length === 0" class="lb-empty">
          <div class="lb-empty-icon">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#5A5348" stroke-width="2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
          </div>
          <p class="lb-empty-text">No entries yet. Be the first!</p>
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
import { useToast } from '@/composables/useToast'
import SkeletonCard from '@/components/SkeletonCard.vue'

const { showToast } = useToast()

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
    showToast('Failed to load challenges.', 'error')
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
    showToast('Failed to load your challenges.', 'error')
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
    showToast('Failed to join challenge. Try again.', 'error')
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
    showToast('Failed to leave challenge. Try again.', 'error')
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
    showToast('Failed to load leaderboard.', 'error')
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

function getMyProgress(challenge) {
  const entry = myChallenges.value.find(mc => mc.id === challenge.id || mc.challengeId === challenge.id)
  if (!entry) return null
  // Support both flat fields and nested progressData
  const current = entry.currentProgress ?? entry.progressData?.current ?? 0
  const goal = entry.goalValue ?? challenge.goalValue ?? entry.progressData?.goal ?? 0
  if (!goal) return null
  const unit = entry.unit ?? challenge.unit ?? 'km'
  const pct = Math.round((current / goal) * 100)
  return { current: Math.round(current * 10) / 10, goal, unit, pct }
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
/* ── Base ────────────────────────────────────────── */
.challenges-page {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  background: #FBF6EC;
  min-height: 100vh;
  padding-top: var(--page-top);
  color: #16130F;
}
.ch-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Spinner ─────────────────────────────────────── */
.ch-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: ch-spin 0.7s linear infinite;
  vertical-align: middle;
}
.ch-spinner--lg {
  width: 28px;
  height: 28px;
  border-color: rgba(22,19,15,0.15);
  border-top-color: #2A55F5;
}
@keyframes ch-spin { to { transform: rotate(360deg); } }

/* ── HERO ────────────────────────────────────────── */
.ch-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 72px 0 52px;
  border-bottom: 2px solid #16130F;
}
.ch-eyebrow {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 12px;
  transform: rotate(-2deg);
  margin-bottom: 20px;
}
.ch-hero-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(3.5rem, 9vw, 7rem);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 0 0 20px;
  color: #FBF6EC;
}
.ch-hero-sub {
  font-size: 1.02rem;
  color: rgba(251,246,236,0.65);
  line-height: 1.55;
  margin: 0;
  max-width: 480px;
}

/* ── TAB BAR ─────────────────────────────────────── */
.ch-tabs-bar {
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
  position: sticky;
  top: var(--nav-h);
  z-index: 90;
}
.ch-tabs {
  display: flex;
  gap: 0;
  padding: 0;
}
.ch-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 22px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: #5A5348;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  white-space: nowrap;
}
.ch-tab:hover { color: #16130F; }
.ch-tab.active { color: #2A55F5; border-bottom-color: #2A55F5; }
.ch-tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #2A55F5;
  color: #fff;
  font-size: 0.60rem;
  font-weight: 700;
}

/* ── FILTERS ─────────────────────────────────────── */
.ch-filters {
  background: #FBF6EC;
  padding: 16px 0;
  border-bottom: 2px solid #E7DFCE;
  position: sticky;
  top: calc(var(--nav-h) + 47px);
  z-index: 80;
}
.ch-filter-bar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.ch-sport-pills {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  overflow-x: auto;
  scrollbar-width: none;
}
.ch-sport-pills::-webkit-scrollbar { display: none; }
.ch-sport-pill {
  padding: 7px 16px;
  border: 2px solid #E7DFCE;
  background: #FBF6EC;
  color: #5A5348;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}
.ch-sport-pill:hover { background: #F1EADC; border-color: #16130F; color: #16130F; }
.ch-sport-pill.active { background: #16130F; border-color: #16130F; color: #FBF6EC; }

.ch-search-sort {
  display: flex;
  gap: 12px;
  align-items: center;
}
.ch-search-wrap {
  position: relative;
  flex: 1;
  max-width: 400px;
}
.ch-search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #5A5348;
  pointer-events: none;
}
.ch-search-input {
  display: block;
  width: 100%;
  height: 42px;
  border: 2px solid #E7DFCE;
  background: #fff;
  padding: 0 14px 0 40px;
  font-size: 0.88rem;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
  outline: none;
  border-radius: 0;
  transition: border-color 0.15s;
}
.ch-search-input::placeholder { color: #8a8a8a; }
.ch-search-input:focus { border-color: #2A55F5; }
.ch-sort-select {
  height: 42px;
  border: 2px solid #E7DFCE;
  background: #fff;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0 12px;
  outline: none;
  border-radius: 0;
  min-width: 150px;
  cursor: pointer;
}
.ch-sort-select:focus { border-color: #2A55F5; }

/* ── GRID ────────────────────────────────────────── */
.ch-grid-section { padding: 40px 0 80px; }
.ch-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
.ch-empty-wrap { grid-column: 1 / -1; }

/* ── CARDS ───────────────────────────────────────── */
.challenge-card {
  background: #fff;
  border: 2px solid #16130F;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.challenge-card:hover { box-shadow: 4px 4px 0 #16130F; }
.challenge-card.entered { border-color: #2A55F5; }

/* Challenge Image */
.challenge-image {
  position: relative;
  height: 180px;
  background-size: cover;
  background-position: center;
  background-color: #16130F;
}
.image-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #16130F;
  color: rgba(251,246,236,0.2);
}
.status-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.60rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
}
.status-badge.ongoing { background: #2A55F5; color: #fff; }
.entered-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 10px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.60rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  background: #FBF6EC;
  color: #16130F;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Challenge Content */
.challenge-content {
  padding: 18px 20px 20px;
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
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.60rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #2A55F5;
}
.participants {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  color: #5A5348;
}
.challenge-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.35rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.9;
  color: #16130F;
  margin-bottom: 8px;
}
.challenge-subtitle {
  font-size: 0.84rem;
  color: #5A5348;
  margin-bottom: 14px;
  line-height: 1.55;
  flex: 1;
}
.challenge-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 2px solid #E7DFCE;
}
.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.60rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #5A5348;
}
.prize-item { color: #2A55F5; }

/* ── Card actions ────────────────────────────────── */
.card-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}
.btn-join {
  flex: 1;
  height: 40px;
  border: 2px solid #16130F;
  border-radius: 999px;
  background: #2A55F5;
  color: #fff;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 3px 3px 0 #16130F;
}
.btn-join:hover:not(:disabled) { background: #1E42D6; }
.btn-join:disabled { opacity: 0.65; cursor: not-allowed; }

.btn-lb {
  flex: 1;
  height: 40px;
  border: 2px solid #16130F;
  border-radius: 0;
  background: #FBF6EC;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.btn-lb:hover { background: #16130F; color: #FBF6EC; }

.btn-leave {
  height: 40px;
  padding: 0 14px;
  border: 2px solid #E7DFCE;
  border-radius: 0;
  background: #FBF6EC;
  color: #5A5348;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.60rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-leave:hover:not(:disabled) { border-color: #dc2626; color: #dc2626; }
.btn-leave:disabled { opacity: 0.55; cursor: not-allowed; }

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  border: 2px solid #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.empty-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(2rem, 6vw, 2.8rem);
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.85;
  color: #16130F;
  margin-bottom: 12px;
}

.empty-text {
  font-size: 0.95rem;
  color: #5a5348;
  max-width: 360px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ── Pagination ──────────────────────────────────── */
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
  border: 2px solid #E7DFCE;
  background: #FBF6EC;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.66rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}
.btn-page:hover:not(:disabled) { border-color: #16130F; background: #F1EADC; }
.btn-page:disabled { opacity: 0.4; cursor: not-allowed; }
.page-info {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  color: #5A5348;
}

/* ── Leaderboard overlay ─────────────────────────── */
.lb-overlay {
  position: fixed;
  inset: 0;
  background: rgba(22,19,15,0.55);
  z-index: 1090;
}

/* ── Leaderboard drawer ──────────────────────────── */
.lb-drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: #FBF6EC;
  z-index: 1100;
  border-left: 3px solid #2A55F5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}
.lb-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 24px 24px 18px;
  border-bottom: 2px solid #E7DFCE;
  flex-shrink: 0;
}
.lb-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.60rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #2A55F5;
  margin-bottom: 6px;
}
.lb-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 900;
  text-transform: uppercase;
  line-height: 0.88;
  color: #16130F;
  margin: 0;
}
.lb-close {
  width: 34px;
  height: 34px;
  border: 2px solid #16130F;
  background: transparent;
  color: #16130F;
  font-size: 0.85rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  flex-shrink: 0;
  margin-left: 12px;
}
.lb-close:hover { background: rgba(22,19,15,0.06); }

.lb-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.lb-loading-text { font-size: 0.82rem; color: #5A5348; margin: 0; }
.lb-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.lb-empty-icon {
  width: 56px;
  height: 56px;
  border: 2px solid #E7DFCE;
  display: flex;
  align-items: center;
  justify-content: center;
}
.lb-empty-text { font-size: 0.85rem; color: #5A5348; margin: 0; }

.lb-list {
  flex: 1;
  overflow-y: auto;
  list-style: none;
  margin: 0;
  padding: 8px 0;
}
.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border-bottom: 1px solid #E7DFCE;
  transition: background 0.1s;
}
.lb-row:hover { background: #F1EADC; }
.lb-row-top { background: rgba(42,85,245,0.05); }
.lb-row-top:hover { background: rgba(42,85,245,0.1); }

.lb-rank {
  width: 28px;
  text-align: center;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #5A5348;
  flex-shrink: 0;
}
.rank-gold   { color: #D97706; font-size: 1.1rem; }
.rank-silver { color: #6B7280; font-size: 1.1rem; }
.rank-bronze { color: #92400E; font-size: 1.1rem; }

.lb-avatar {
  width: 34px;
  height: 34px;
  background: #16130F;
  color: #FBF6EC;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 0.9rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.lb-name {
  flex: 1;
  font-size: 0.88rem;
  font-weight: 700;
  color: #16130F;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lb-name:hover { color: #2A55F5; }
.lb-value {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #5A5348;
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

/* Challenge progress */
.challenge-progress { margin: 12px 0 0; }
.cp-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.cp-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.10em; color: #767676; }
.cp-val { font-size: 0.78rem; font-weight: 700; color: #000; }
.cp-bar { height: 4px; background: #E5E5E5; border-radius: 0; overflow: hidden; }
.cp-fill { height: 100%; background: #2A55F5; transition: width 0.5s; }
.cp-complete { margin-top: 6px; font-size: 0.78rem; font-weight: 700; color: #2A55F5; display: flex; align-items: center; }

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 900px) {
  .ch-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .ch-hero { padding: 56px 0 40px; }
  .ch-search-sort { flex-direction: column; }
  .ch-search-wrap { max-width: 100%; }
  .ch-sort-select { width: 100%; }
  .lb-drawer {
    width: 100%;
  }
}
@media (max-width: 560px) {
  .ch-grid { grid-template-columns: 1fr; }
  .ch-inner { padding: 0 18px; }
  .ch-hero-headline { font-size: clamp(2.8rem, 12vw, 5rem); }
}
</style>
