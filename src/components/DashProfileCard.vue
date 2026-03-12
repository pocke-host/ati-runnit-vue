<!-- src/components/DashProfileCard.vue -->
<!-- Profile sidebar card extracted from AccountDashboard -->
<template>
  <aside class="profile-card">
    <div class="profile-header">
      <div class="avatar-large">{{ userInitial }}</div>
      <div class="profile-info">
        <div class="profile-name">{{ user?.displayName || 'User' }}</div>
        <div class="profile-email">{{ user?.email }}</div>
      </div>
    </div>

    <div class="profile-stats-mini">
      <div class="stat-mini">
        <div class="stat-mini-value">{{ friendsCount }}</div>
        <div class="stat-mini-label">Friends</div>
      </div>
      <div class="stat-mini">
        <div class="stat-mini-value">{{ followersCount }}</div>
        <div class="stat-mini-label">Followers</div>
      </div>
      <div class="stat-mini">
        <div class="stat-mini-value">{{ activities?.length || 0 }}</div>
        <div class="stat-mini-label">Activities</div>
      </div>
    </div>

    <div class="profile-badges">
      <template v-if="latestEarned.length">
        <div v-for="badge in latestEarned" :key="badge.id" class="badge-item">
          <div class="badge-icon">{{ badge.icon }}</div>
          <div class="badge-text">{{ badge.name }}</div>
        </div>
      </template>
      <div v-else class="badge-item">
        <div class="badge-icon">⭐</div>
        <div class="badge-text">Early Adopter</div>
      </div>
    </div>

    <!-- PR Widget -->
    <div class="profile-prs">
      <div class="prs-row-header">
        <span class="prs-label">⚡ Personal Records</span>
        <router-link to="/stats" class="prs-all-link">View all →</router-link>
      </div>
      <div v-if="!topPRs.length" class="prs-empty">Log activities to set PRs!</div>
      <div v-else class="prs-list">
        <div v-for="pr in topPRs" :key="pr.id" class="pr-mini">
          <div class="pr-mini-label">{{ pr.label }}</div>
          <div class="pr-mini-val">{{ formatPRValue(pr) }}</div>
        </div>
      </div>
    </div>

    <!-- Training Insights Widget -->
    <div v-if="dashInsights" class="dash-insights">
      <div class="dash-insights-label">TRAINING INSIGHTS</div>
      <div class="dash-insights-row">
        <div class="dash-insight-item">
          <span class="dash-insight-key">Fitness</span>
          <span class="dash-insight-val">{{ dashInsights.fitnessScore }}</span>
        </div>
        <div class="dash-insight-item">
          <span class="dash-insight-key">Form</span>
          <span class="dash-insight-val" :style="{ color: dashInsights.formScore > 5 ? '#22c55e' : dashInsights.formScore > -5 ? '#f97316' : '#ef4444' }">
            {{ dashInsights.formScore > 0 ? '+' : '' }}{{ dashInsights.formScore }}
          </span>
        </div>
        <div class="dash-insight-item" v-if="dashInsights.acwr !== null">
          <span class="dash-insight-key">ACWR</span>
          <span class="dash-insight-val" :style="{ color: dashInsights.acwr < 1.3 ? '#22c55e' : dashInsights.acwr < 1.5 ? '#f97316' : '#ef4444' }">
            {{ dashInsights.acwr }}
          </span>
        </div>
      </div>
      <router-link to="/stats" class="dash-insights-link">Full analysis →</router-link>
    </div>

    <div class="profile-actions">
      <button class="action-btn" @click="$emit('log-activity')">
        <i class="bi bi-plus-circle me-2"></i>Log Activity
      </button>
      <button class="action-btn" @click="$emit('find-friends')">
        <i class="bi bi-people me-2"></i>Find Friends
      </button>
      <button class="action-btn" @click="$emit('share-moment')">
        <i class="bi bi-camera me-2"></i>Share Moment
      </button>
      <button class="action-btn" @click="goToFeed">
        <i class="bi bi-collection me-2"></i>View Feed
      </button>
      <button class="action-btn action-btn-danger" @click="handleLogout">
        <i class="bi bi-box-arrow-right me-2"></i>Logout
      </button>
    </div>

    <!-- Coach Widget -->
    <div v-if="myCoach" class="coach-widget">
      <div class="coach-widget-label">YOUR COACH</div>
      <div class="coach-widget-row">
        <div class="coach-avatar-sm">{{ (myCoach.displayName || '?')[0].toUpperCase() }}</div>
        <div class="coach-name">{{ myCoach.displayName }}</div>
      </div>
    </div>

    <!-- Subscription CTA -->
    <div v-if="subscriptionTier === 'free'" class="upgrade-banner">
      <div class="upgrade-label">UPGRADE TO PREMIUM</div>
      <p class="upgrade-desc">Route planning, goal tracking, and pace insights.</p>
      <router-link to="/subscribe" class="upgrade-btn">See Plans →</router-link>
    </div>
    <div v-else class="manage-sub-link">
      <router-link to="/billing">
        <i class="bi bi-credit-card me-2"></i>Manage Subscription →
      </router-link>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useActivityStore } from '@/stores/activity'
import { useAchievementStore } from '@/stores/achievement'
import { usePRStore } from '@/stores/pr'
import { useAthleteStore } from '@/stores/athlete'
import { storeToRefs } from 'pinia'
import { useUnits } from '@/composables/useUnits'

defineProps({
  friendsCount: { type: Number, default: 0 },
  followersCount: { type: Number, default: 0 },
})
defineEmits(['log-activity', 'find-friends', 'share-moment'])

const router = useRouter()
const { user, subscriptionTier } = storeToRefs(useAuthStore())
const authStore = useAuthStore()
const { activities } = storeToRefs(useActivityStore())
const { latestEarned } = storeToRefs(useAchievementStore())
const { topPRs } = storeToRefs(usePRStore())
const { myCoach } = storeToRefs(useAthleteStore())
const { formatDurationClock, formatPace, formatElevation, formatDistance } = useUnits()

const userInitial = computed(() => user.value?.displayName?.charAt(0).toUpperCase() || 'U')

const dashInsights = computed(() => {
  const acts = activities.value || []
  if (acts.length < 3) return null
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const dayMs = 86400000
  const DAYS = 90
  const dailyLoad = new Array(DAYS).fill(0)
  for (const a of acts) {
    const daysAgo = Math.floor((today - new Date(a.createdAt)) / dayMs)
    if (daysAgo >= 0 && daysAgo < DAYS) dailyLoad[DAYS - 1 - daysAgo] += (a.distanceMeters || 0) / 1000
  }
  let ctl = 0, atl = 0
  const ctlK = 1 / 42, atlK = 1 / 7
  for (let i = 0; i < DAYS; i++) {
    ctl = ctl * (1 - ctlK) + dailyLoad[i] * ctlK
    atl = atl * (1 - atlK) + dailyLoad[i] * atlK
  }
  const fitnessScore = Math.min(100, Math.round(ctl * 10))
  const fatigueScore = Math.min(100, Math.round(atl * 10))
  const formScore = Math.round(fitnessScore - fatigueScore)
  const acwr = ctl > 0 ? Math.round((atl / ctl) * 100) / 100 : null
  return { fitnessScore, fatigueScore, formScore, acwr }
})

const formatPRValue = (pr) => {
  if (!pr.data) return '—'
  const { id, data: d } = pr
  if (['best_5k', 'best_10k', 'best_half', 'best_marathon'].includes(id)) return formatDurationClock(d.estTime)
  if (id === 'fastest_pace') return formatPace(d.pace / 60)
  if (id === 'most_elevation') return formatElevation(d.elevationMeters)
  return formatDistance(d.distanceMeters)
}

const goToFeed = () => router.push('/feed')
const handleLogout = () => {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-card { background: #fff; border: 1px solid #E5E5E5; padding: 24px; }
.profile-header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(15,18,16,0.08); }
.avatar-large { width: 64px; height: 64px; background: #5A6B4E; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 1.7rem; color: white; flex-shrink: 0; }
.profile-info { flex: 1; }
.profile-name { font-weight: 900; font-size: 1.15rem; margin-bottom: 4px; }
.profile-email { font-size: 0.85rem; color: rgba(15,18,16,0.60); }
.profile-stats-mini { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(15,18,16,0.08); }
.stat-mini { text-align: center; padding: 10px; background: #f9f9f9; border: 1px solid #E5E5E5; }
.stat-mini-value { font-weight: 900; font-size: 1.3rem; color: rgba(15,18,16,0.90); }
.stat-mini-label { font-size: 0.75rem; font-weight: 700; color: rgba(15,18,16,0.60); text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }
.profile-badges { display: flex; gap: 10px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(15,18,16,0.08); }
.badge-item { flex: 1; padding: 12px; background: #f9f9f9; text-align: center; border: 1px solid #E5E5E5; }
.badge-icon { font-size: 1.5rem; margin-bottom: 4px; }
.badge-text { font-size: 0.75rem; font-weight: 700; color: rgba(15,18,16,0.70); }
.profile-prs { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(15,18,16,0.08); }
.prs-row-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.prs-label { font-weight: 900; font-size: 0.85rem; color: rgba(15,18,16,0.80); }
.prs-all-link { font-size: 0.8rem; color: #767676; font-weight: 700; text-decoration: none; }
.prs-all-link:hover { color: #000; }
.prs-empty { font-size: 0.85rem; color: rgba(15,18,16,0.50); text-align: center; padding: 8px; }
.prs-list { display: flex; flex-direction: column; gap: 8px; }
.pr-mini { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #f9f9f9; border: 1px solid #E5E5E5; }
.pr-mini-label { font-size: 0.8rem; color: rgba(15,18,16,0.60); font-weight: 700; }
.pr-mini-val { font-size: 0.9rem; color: #000; font-weight: 900; }
.profile-actions { display: flex; flex-direction: column; gap: 10px; }
.action-btn { padding: 14px; border: 1px solid rgba(15,18,16,0.12); background: rgba(255,255,255,0.70); font-weight: 700; font-size: 0.9rem; text-align: left; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; }
.action-btn:hover { background: rgba(255,255,255,0.95); }
.action-btn-danger { color: #dc3545; border-color: rgba(220,53,69,0.20); }
.action-btn-danger:hover { background: rgba(220,53,69,0.05); }
.coach-widget { margin-top: 16px; padding: 16px; border: 1px solid #E5E5E5; }
.coach-widget-label { font-size: 0.70rem; font-weight: 700; letter-spacing: 0.14em; color: #767676; text-transform: uppercase; margin-bottom: 10px; }
.coach-widget-row { display: flex; align-items: center; gap: 10px; }
.coach-avatar-sm { width: 34px; height: 34px; background: #5A6B4E; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0; }
.coach-name { font-weight: 700; font-size: 0.88rem; }
.upgrade-banner { margin-top: 16px; padding: 20px; background: #000; }
.upgrade-label { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.14em; color: rgba(255,255,255,0.55); margin-bottom: 8px; }
.upgrade-desc { font-size: 0.82rem; color: rgba(255,255,255,0.70); margin: 0 0 16px; line-height: 1.5; }
.upgrade-btn { display: inline-block; background: #000; color: #fff; font-weight: 700; font-size: 0.75rem; letter-spacing: 0.10em; text-transform: uppercase; text-decoration: none; padding: 10px 20px; transition: background 0.15s; }
.upgrade-btn:hover { background: #A3581F; }
.manage-sub-link { margin-top: 16px; padding: 12px 0; }
.manage-sub-link a { font-size: 0.82rem; color: #767676; text-decoration: none; display: flex; align-items: center; transition: color 0.15s; }
.manage-sub-link a:hover { color: #000; }
.dash-insights { margin-top: 16px; padding: 16px; border: 1px solid #E5E5E5; background: #fff; }
.dash-insights-label { font-size: 0.65rem; font-weight: 900; letter-spacing: 0.12em; color: rgba(15,18,16,0.40); text-transform: uppercase; margin-bottom: 10px; }
.dash-insights-row { display: flex; gap: 16px; margin-bottom: 8px; }
.dash-insight-item { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.dash-insight-key { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(15,18,16,0.45); }
.dash-insight-val { font-size: 1.15rem; font-weight: 900; color: #000; line-height: 1; }
.dash-insights-link { font-size: 0.72rem; font-weight: 700; color: #767676; text-decoration: none; letter-spacing: 0.04em; }
.dash-insights-link:hover { color: #000; }
.me-2 { margin-right: 8px; }
</style>
