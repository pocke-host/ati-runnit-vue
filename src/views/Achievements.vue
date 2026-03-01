<!-- src/views/Achievements.vue -->
<template>
  <div class="achievements-page">
    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <h1 class="hero-title">🏆 Achievements</h1>
        <p class="hero-sub">
          <template v-if="achievementStore.loading">Loading badges…</template>
          <template v-else>
            <span class="earned-count">{{ achievementStore.earnedCount }}</span> of {{ total }} badges earned
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
        <div class="spinner-border" role="status"></div>
        <p>Loading achievements…</p>
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
          <div class="badge-tier-pill" :class="`tier-pill-${badge.tier}`">{{ badge.tier }}</div>

          <template v-if="badge.earned">
            <div class="badge-status earned-label">Earned</div>
            <div v-if="badge.earnedAt" class="badge-date">{{ formatDate(badge.earnedAt) }}</div>
          </template>

          <template v-else>
            <div class="badge-status locked-label">🔒 Locked</div>
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
        <span style="font-size: 3rem;">🔍</span>
        <p>No badges in this category yet.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAchievementStore, BADGE_CATALOG } from '@/stores/achievement'
import { useActivityStore } from '@/stores/activity'
import { storeToRefs } from 'pinia'

const achievementStore = useAchievementStore()
const activityStore = useActivityStore()
const { activities } = storeToRefs(activityStore)

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

// Distance badges show "km", count badges show count
function formatProgressVal(badgeId, val) {
  const distanceBadges = ['first_km', '5k_club', '10k_club', 'half_marathon', 'marathon', 'total_100km', 'total_500km']
  if (distanceBadges.includes(badgeId)) return `${val} km`
  const strideBadges = ['streak_3', 'streak_7', 'streak_30']
  if (strideBadges.includes(badgeId)) return `${val} days`
  return val
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

onMounted(async () => {
  if (!activities.value.length) {
    await activityStore.fetchActivities()
  }
  await achievementStore.fetchAchievements(activities.value)
})
</script>

<style scoped>
.achievements-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  --bronze: #CD7F32;
  --silver: #A8A9AD;
  --gold: #FFD700;
  --special: #7C3AED;
  min-height: 100vh;
  padding-top: 72px;
  background: var(--r-offwhite);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* HERO */
.hero {
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: white;
  padding: 56px 24px 48px;
}
.hero-inner {
  max-width: 860px;
  margin: 0 auto;
  text-align: center;
}
.hero-title {
  font-size: 2.8rem;
  font-weight: 900;
  margin: 0 0 12px;
  line-height: 1.1;
}
.hero-sub {
  font-size: 1.1rem;
  color: rgba(255,255,255,0.80);
  margin: 0 0 24px;
  font-weight: 700;
}
.earned-count {
  font-size: 1.4rem;
  font-weight: 900;
  color: var(--gold);
}
.hero-progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.20);
  border-radius: 999px;
  max-width: 400px;
  margin: 0 auto;
  overflow: hidden;
}
.hero-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--r-accent), #e8953a);
  border-radius: 999px;
  transition: width 0.5s ease;
}

/* TABS */
.tabs-bar {
  background: white;
  border-bottom: 1px solid rgba(15,18,16,0.10);
  position: sticky;
  top: 72px;
  z-index: 50;
}
.tabs-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  overflow-x: auto;
}
.tab-btn {
  padding: 16px 22px;
  border: none;
  background: transparent;
  font-weight: 900;
  font-size: 0.9rem;
  color: rgba(15,18,16,0.55);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 7px;
}
.tab-btn:hover { color: rgba(15,18,16,0.80); }
.tab-btn.active { color: var(--r-accent); border-bottom-color: var(--r-accent); }
.tab-count {
  background: rgba(15,18,16,0.08);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.75rem;
}
.tab-btn.active .tab-count { background: rgba(196,106,42,0.15); color: var(--r-accent); }

/* GRID */
.grid-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 24px 64px;
}
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 80px 20px;
  color: rgba(15,18,16,0.55);
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
  gap: 12px;
  padding: 80px 20px;
  color: rgba(15,18,16,0.45);
  font-weight: 700;
}

/* BADGE CARD */
.badge-card {
  background: white;
  border-radius: 20px;
  border: 1.5px solid rgba(15,18,16,0.09);
  padding: 24px 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}
.badge-card.locked {
  filter: grayscale(0.85);
  opacity: 0.75;
}
.badge-card.earned {
  box-shadow: 0 6px 24px rgba(0,0,0,0.10);
}
.badge-card.earned.tier-bronze { box-shadow: 0 0 0 2px var(--bronze), 0 6px 24px rgba(205,127,50,0.22); }
.badge-card.earned.tier-silver { box-shadow: 0 0 0 2px var(--silver), 0 6px 24px rgba(168,169,173,0.28); }
.badge-card.earned.tier-gold { box-shadow: 0 0 0 2px var(--gold), 0 6px 24px rgba(255,215,0,0.28); }
.badge-card.earned.tier-special { box-shadow: 0 0 0 2px var(--special), 0 6px 24px rgba(124,58,237,0.22); }
.badge-card:hover { transform: translateY(-3px); }
.badge-card.locked:hover { transform: none; }

.badge-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(15,18,16,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.badge-icon { font-size: 2rem; line-height: 1; }
.badge-name { font-weight: 900; font-size: 0.95rem; color: rgba(15,18,16,0.90); line-height: 1.2; }
.badge-desc { font-size: 0.75rem; color: rgba(15,18,16,0.55); font-weight: 600; }

/* Tier pill */
.badge-tier-pill {
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.tier-pill-bronze { background: rgba(205,127,50,0.15); color: var(--bronze); }
.tier-pill-silver { background: rgba(168,169,173,0.18); color: #808285; }
.tier-pill-gold { background: rgba(255,215,0,0.18); color: #b8930a; }
.tier-pill-special { background: rgba(124,58,237,0.13); color: var(--special); }

/* Status labels */
.badge-status { font-size: 0.78rem; font-weight: 700; }
.earned-label { color: #16a34a; }
.locked-label { color: rgba(15,18,16,0.45); }
.badge-date { font-size: 0.72rem; color: rgba(15,18,16,0.50); }

/* Progress */
.badge-progress-bar {
  width: 100%;
  height: 5px;
  background: rgba(15,18,16,0.10);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 4px;
}
.badge-progress-fill {
  height: 100%;
  background: var(--r-accent);
  border-radius: 999px;
  transition: width 0.4s ease;
}
.badge-progress-text {
  font-size: 0.70rem;
  color: rgba(15,18,16,0.50);
  font-weight: 700;
}

/* Responsive */
@media (max-width: 900px) {
  .badge-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 600px) {
  .hero-title { font-size: 2rem; }
  .badge-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .badge-card { padding: 18px 12px 16px; }
  .badge-icon { font-size: 1.7rem; }
  .badge-name { font-size: 0.85rem; }
}
</style>
