<!-- src/views/Achievements.vue -->
<template>
  <div class="achievements-page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <div class="hero-eyebrow">Achievements</div>
        <h1 class="hero-title">Chase every badge.</h1>
        <p class="hero-sub">
          <template v-if="achievementStore.loading">Loading…</template>
          <template v-else>
            <span class="earned-count">{{ achievementStore.earnedCount }}</span>
            <span class="earned-denom"> / {{ total }} Earned</span>
          </template>
        </p>
        <div class="hero-progress-bar">
          <div class="hero-progress-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>
    </section>

    <!-- CATEGORY TABS -->
    <div class="tabs-bar">
      <div class="tabs-inner">
        <button
          v-for="cat in categories"
          :key="cat.key"
          :class="['tab-btn', { active: activeCategory === cat.key }]"
          @click="activeCategory = cat.key"
        >
          {{ cat.label }}
          <span class="tab-count">{{ getCategoryCount(cat.key) }}</span>
        </button>
      </div>
    </div>

    <!-- BADGE GRID -->
    <div class="grid-section">
      <div v-if="achievementStore.loading" class="loading-state">
        <div class="gr-spinner" role="status"></div>
        <p class="loading-text">Loading achievements…</p>
      </div>

      <div v-else class="badge-grid">
        <div
          v-for="badge in filteredBadges"
          :key="badge.id"
          :class="['badge-card', { earned: badge.earned, locked: !badge.earned }, `tier-${badge.tier}`]"
        >
          <div class="badge-icon-wrap">
            <span class="badge-icon">{{ badge.icon }}</span>
          </div>
          <div class="badge-name">{{ badge.name }}</div>
          <div class="badge-tier-chip" :class="`tier-chip-${badge.tier}`">{{ badge.tier }}</div>

          <template v-if="badge.earned">
            <div class="badge-status earned-label">✓ Earned</div>
            <div v-if="badge.earnedAt" class="badge-date">{{ formatDate(badge.earnedAt) }}</div>
          </template>

          <template v-else>
            <div class="badge-status locked-label">Locked</div>
            <div class="badge-desc">{{ badge.description }}</div>
            <template v-if="getProgress(badge.id)">
              <div class="badge-progress-bar">
                <div
                  class="badge-progress-fill"
                  :style="{ width: Math.min((getProgress(badge.id).val / getProgress(badge.id).max) * 100, 100) + '%' }"
                ></div>
              </div>
              <div class="badge-progress-text">
                {{ formatProgressVal(badge.id, getProgress(badge.id).val) }} / {{ formatProgressVal(badge.id, getProgress(badge.id).max) }}
              </div>
            </template>
          </template>
        </div>
      </div>

      <div v-if="!achievementStore.loading && filteredBadges.length === 0" class="empty-state">
        <div class="empty-icon">—</div>
        <p class="empty-text">No badges in this category yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore, BADGE_CATALOG } from '@/stores/achievement'
import { useActivityStore } from '@/stores/activity'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'

const achievementStore = useAchievementStore()
const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)
const { formatDistance } = useUnits()

const activeCategory = ref('all')
const total = BADGE_CATALOG.length

const categories = [
  { key: 'all', label: 'All' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'streaks', label: 'Streaks' },
  { key: 'sport', label: 'Sport' },
  { key: 'social', label: 'Social' },
]

const filteredBadges = computed(() => {
  const badges = achievementStore.allBadges
  if (activeCategory.value === 'all') return badges
  return badges.filter(b => b.category === activeCategory.value)
})

const progressPct = computed(() => {
  if (!total) return 0
  return Math.round((achievementStore.earnedCount / total) * 100)
})

function getCategoryCount(key) {
  if (key === 'all') return achievementStore.earnedCount
  return achievementStore.allBadges.filter(b => b.category === key && b.earned).length
}

function getProgress(badgeId) {
  return achievementStore.getBadgeProgress(badgeId)
}

// Distance badges respect unit system; count badges show count
function formatProgressVal(badgeId, val) {
  const distanceBadges = ['first_km', '5k_club', '10k_club', 'half_marathon', 'marathon', 'total_100km', 'total_500km']
  if (distanceBadges.includes(badgeId)) return formatDistance(val * 1000)
  const strideBadges = ['streak_3', 'streak_7', 'streak_30']
  if (strideBadges.includes(badgeId)) return `${val} days`
  return val
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  try {
    if (!activities.value.length) {
      await activityStore.fetchActivities()
    }
    await achievementStore.fetchAchievements(activities.value)
  } catch {
    // achievements are computed client-side; silently degrade rather than crash the page
  }
})
</script>

<style scoped>
@keyframes spin { to { transform: rotate(360deg) } }

.achievements-page {
  min-height: 100vh;
  padding-top: var(--nav-h, 66px);
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}

/* HERO */
.hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 52px 32px 44px;
  border-bottom: 2px solid #16130F;
}
.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.hero-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #2A55F5;
  margin-bottom: 12px;
}
.hero-title {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.8rem, 7vw, 4.8rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0 0 20px;
  color: #FBF6EC;
}
.hero-sub {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.6);
  margin: 0 0 20px;
}
.earned-count {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.8rem;
  font-weight: 900;
  color: #FFC53D;
  line-height: 1;
  vertical-align: middle;
}
.earned-denom { color: rgba(251,246,236,0.6); }
.hero-progress-bar {
  height: 6px;
  background: rgba(251,246,236,0.12);
  border: 1px solid rgba(251,246,236,0.2);
  max-width: 400px;
  overflow: hidden;
}
.hero-progress-fill {
  height: 100%;
  background: #2A55F5;
  transition: width 0.5s ease;
}

/* TABS */
.tabs-bar {
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
  position: sticky;
  top: var(--nav-h, 66px);
  z-index: 50;
}
.tabs-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.tabs-inner::-webkit-scrollbar { display: none; }
.tab-btn {
  padding: 14px 20px;
  border: none;
  background: transparent;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5A5348;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.15s;
}
.tab-btn:hover { color: #16130F; }
.tab-btn.active { color: #16130F; border-bottom-color: #2A55F5; }
.tab-count {
  background: #E7DFCE;
  border: 1px solid #16130F;
  padding: 2px 7px;
  font-size: 0.58rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.tab-btn.active .tab-count { background: #16130F; color: #FBF6EC; }

/* GRID */
.grid-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 32px 64px;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 80px 20px;
}
.gr-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(22,19,15,0.15);
  border-top-color: #2A55F5;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.loading-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.63rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5A5348;
}
.badge-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  text-align: center;
}
.empty-icon {
  width: 52px;
  height: 52px;
  background: #FBF6EC;
  border: 2px solid #16130F;
  box-shadow: 3px 3px 0 #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.4rem;
  font-weight: 900;
  color: #16130F;
}
.empty-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
}

/* BADGE CARD */
.badge-card {
  background: #fff;
  border: 2px solid #16130F;
  padding: 24px 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  position: relative;
}
.badge-card.locked {
  opacity: 0.55;
  background: #F5F0E8;
}
.badge-card.earned {
  box-shadow: 4px 4px 0 #16130F;
}
.badge-card.earned.tier-special { box-shadow: 4px 4px 0 #2A55F5; border-color: #2A55F5; }

.badge-icon-wrap {
  width: 56px;
  height: 56px;
  border: 2px solid #16130F;
  background: #FBF6EC;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.badge-card.earned .badge-icon-wrap { background: #16130F; }
.badge-card.earned.tier-gold .badge-icon-wrap { background: #FFC53D; }
.badge-card.earned.tier-special .badge-icon-wrap { background: #2A55F5; border-color: #2A55F5; }
.badge-icon { font-size: 1.6rem; line-height: 1; }

.badge-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.95rem;
  text-transform: uppercase;
  line-height: 1;
  color: #16130F;
}
.badge-desc {
  font-size: 0.73rem;
  color: #5A5348;
  font-weight: 500;
  line-height: 1.4;
}

/* Tier chip */
.badge-tier-chip {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  padding: 3px 8px;
  border: 1px solid #16130F;
}
.tier-chip-bronze { background: rgba(205,127,50,0.12); color: #7D4A10; }
.tier-chip-silver { background: #F1EADC; color: #5A5348; }
.tier-chip-gold { background: #FFC53D; color: #16130F; }
.tier-chip-special { background: #2A55F5; color: #fff; border-color: #2A55F5; }

/* Status labels */
.badge-status {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.60rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.earned-label { color: #2A55F5; }
.locked-label { color: #5A5348; }
.badge-date {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  color: #8A8A8A;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Progress */
.badge-progress-bar {
  width: 100%;
  height: 4px;
  background: #E7DFCE;
  border: 1px solid rgba(22,19,15,0.2);
  overflow: hidden;
  margin-top: 4px;
}
.badge-progress-fill {
  height: 100%;
  background: #2A55F5;
  transition: width 0.4s ease;
}
.badge-progress-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  color: #5A5348;
  font-weight: 700;
  letter-spacing: 0.06em;
  font-variant-numeric: tabular-nums;
}

/* Responsive */
@media (max-width: 900px) {
  .badge-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 640px) {
  .hero { padding: 36px 20px 32px; }
  .tabs-bar { top: 56px; }
  .tabs-inner { padding: 0 20px; }
  .grid-section { padding: 24px 20px 48px; }
  .badge-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .badge-card { padding: 16px 12px 14px; }
  .badge-icon { font-size: 1.4rem; }
}
@media (max-width: 400px) {
  .badge-grid { grid-template-columns: 1fr; }
}
</style>
