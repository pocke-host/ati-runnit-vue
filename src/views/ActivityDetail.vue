<!-- src/views/ActivityDetail.vue -->
<template>
  <div class="detail-page">

    <!-- Loading -->
    <div v-if="pageLoading" class="page-center">
      <div class="spinner-border" role="status"></div>
      <p>Loading activity…</p>
    </div>

    <!-- Error -->
    <div v-else-if="pageError" class="page-center page-error">
      <i class="bi bi-exclamation-circle"></i>
      <h2>Couldn't load activity</h2>
      <p>{{ pageError }}</p>
      <button class="btn btn-primary" @click="init">Try again</button>
    </div>

    <template v-else-if="activity">

      <!-- TOP BAR -->
      <div class="top-bar">
        <button class="back-btn" @click="router.back()">
          <i class="bi bi-arrow-left me-1"></i>Back
        </button>
        <div class="top-bar-meta">
          <span class="sport-chip">{{ getSportIcon(activity.sportType) }} {{ activity.sportType }}</span>
          <span class="top-date">{{ formatDate(activity.createdAt) }}</span>
        </div>
        <div class="top-bar-spacer"></div>
      </div>

      <!-- USER ROW -->
      <div class="user-row-wrap">
        <div class="user-row">
          <router-link :to="`/profile/${activity.userId}`" class="avatar-link">
            <div class="det-avatar">{{ getInitial(activity.userDisplayName) }}</div>
          </router-link>
          <div class="user-info">
            <router-link :to="`/profile/${activity.userId}`" class="user-name-link">
              {{ activity.userDisplayName || 'Athlete' }}
            </router-link>
            <div class="user-sub">{{ formatDate(activity.createdAt) }}</div>
          </div>
          <template v-if="!isOwn && activity.userId">
            <button
              v-if="!following"
              class="btn btn-follow"
              @click="toggleFollow"
              :disabled="followLoading"
            >
              <span v-if="followLoading" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-person-plus me-1"></i>Follow
            </button>
            <button v-else class="btn btn-following-sm" @click="toggleFollow" :disabled="followLoading">
              <i class="bi bi-check me-1"></i>Following
            </button>
          </template>
        </div>
      </div>

      <!-- MAIN LAYOUT -->
      <div class="detail-layout">

        <!-- LEFT COL: Stats, Map, Reactions, Delete -->
        <div class="detail-left">

          <!-- Stats -->
          <div class="det-card">
            <h3 class="det-section-title">Stats</h3>
            <div class="stats-grid">
              <div class="stat-box">
                <div class="stat-label">Distance</div>
                <div class="stat-val">{{ formatDistance(activity.distanceMeters) }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Duration</div>
                <div class="stat-val">{{ formatDuration(activity.durationSeconds) }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Pace</div>
                <div class="stat-val">{{ computedPace }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Elevation</div>
                <div class="stat-val">{{ elevationDisplay }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Avg HR</div>
                <div class="stat-val">{{ activity.avgHeartRate ? activity.avgHeartRate + ' bpm' : '—' }}</div>
              </div>
              <div class="stat-box">
                <div class="stat-label">Calories</div>
                <div class="stat-val">{{ activity.calories ? activity.calories + ' kcal' : '—' }}</div>
              </div>
            </div>
          </div>

          <!-- PR Banner -->
          <div v-if="activityPRs.length > 0" class="det-card pr-banner">
            <div class="pr-banner-header">🎉 Personal Record{{ activityPRs.length > 1 ? 's' : '' }}!</div>
            <div class="pr-pills">
              <span v-for="prId in activityPRs" :key="prId" class="pr-pill">
                <i class="bi bi-trophy-fill me-1"></i>{{ getPRLabel(prId) }}
              </span>
            </div>
          </div>

          <!-- Route map -->
          <div v-if="hasCoords" class="det-card map-card">
            <h3 class="det-section-title">Route</h3>
            <div class="map-wrap">
              <RouteViewer :activity="activity" />
            </div>
          </div>

          <!-- Reactions -->
          <div class="det-card">
            <h3 class="det-section-title">Reactions</h3>
            <div class="reactions-row">
              <button
                :class="['reaction-btn', { active: userReaction === 'LIKE' }]"
                @click="toggleReaction('LIKE')"
                :disabled="reactionLoading"
              >
                ❤️ <span class="reaction-count">{{ reactionCounts.LIKE || 0 }}</span>
              </button>
              <button
                :class="['reaction-btn', { active: userReaction === 'FIRE' }]"
                @click="toggleReaction('FIRE')"
                :disabled="reactionLoading"
              >
                🔥 <span class="reaction-count">{{ reactionCounts.FIRE || 0 }}</span>
              </button>
              <button
                :class="['reaction-btn', { active: userReaction === 'CLAP' }]"
                @click="toggleReaction('CLAP')"
                :disabled="reactionLoading"
              >
                👏 <span class="reaction-count">{{ reactionCounts.CLAP || 0 }}</span>
              </button>
            </div>
          </div>

          <!-- Delete (own only) -->
          <div v-if="isOwn" class="delete-row">
            <button class="btn btn-delete" @click="handleDelete" :disabled="deleteLoading">
              <span v-if="deleteLoading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-trash me-2"></i>Delete Activity
            </button>
          </div>
        </div>

        <!-- RIGHT COL: Comments -->
        <div class="detail-right">
          <div class="det-card comments-card">
            <div class="comments-header">
              <h3 class="det-section-title">Comments</h3>
              <span class="comment-count-badge">{{ comments.length }}</span>
            </div>

            <div class="comments-list">
              <div v-if="commentsLoading" class="comments-loading">
                <div class="spinner-border spinner-border-sm"></div>
              </div>

              <div v-else-if="comments.length === 0" class="comments-empty">
                <i class="bi bi-chat"></i>
                <p>No comments yet. Be the first!</p>
              </div>

              <div v-else class="comments">
                <div v-for="c in comments" :key="c.id" class="comment">
                  <div class="comment-avatar">{{ getInitial(c.user) }}</div>
                  <div class="comment-body">
                    <div class="comment-meta">
                      <span class="comment-author">{{ c.user?.displayName || c.user }}</span>
                      <span class="comment-time">{{ formatTime(c.createdAt) }}</span>
                    </div>
                    <p class="comment-text">{{ c.text }}</p>
                  </div>
                </div>
              </div>
            </div>

            <form @submit.prevent="submitComment" class="comment-form">
              <input
                v-model="newComment"
                type="text"
                class="comment-input"
                placeholder="Add a comment…"
                :disabled="commentLoading"
              />
              <button
                type="submit"
                class="comment-submit"
                :disabled="!newComment.trim() || commentLoading"
              >
                <i class="bi bi-send-fill"></i>
              </button>
            </form>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import RouteViewer from '@/components/RouteViewer.vue'
import { useActivityStore } from '@/stores/activity'
import { computePRs, getActivityPRs, PR_CATALOG } from '@/stores/pr'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const activityStore = useActivityStore()

const { formatDistance, formatDuration, formatPace, formatElevation } = useUnits()

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// State
const pageLoading = ref(true)
const pageError = ref('')
const activity = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const newComment = ref('')
const commentLoading = ref(false)
const reactionLoading = ref(false)
const userReaction = ref(null)
const reactionCounts = ref({})
const following = ref(false)
const followLoading = ref(false)
const deleteLoading = ref(false)

const activityId = computed(() => route.params.id)
const activityPRs = ref([])

const isOwn = computed(() =>
  activity.value?.userId && user.value?.id &&
  String(activity.value.userId) === String(user.value.id)
)

const hasCoords = computed(() => {
  const a = activity.value
  return a && (
    (Array.isArray(a.coords) && a.coords.length > 0) ||
    (Array.isArray(a.gpsCoords) && a.gpsCoords.length > 0) ||
    (Array.isArray(a.route) && a.route.length > 0)
  )
})

const computedPace = computed(() => {
  if (!activity.value?.distanceMeters || !activity.value?.durationSeconds) return '—'
  const minPerKm = (activity.value.durationSeconds / 60) / (activity.value.distanceMeters / 1000)
  return formatPace(minPerKm)
})

const elevationDisplay = computed(() => {
  const a = activity.value
  if (!a) return '—'
  const elev = a.elevationMeters ?? a.elevationGain ?? null
  return elev != null ? formatElevation(elev) : '—'
})

// Helpers
const getSportIcon = (sport) => {
  const icons = {
    RUN: '🏃', Running: '🏃',
    BIKE: '🚴', Cycling: '🚴',
    SWIM: '🏊', Swimming: '🏊',
    HIKE: '🥾', Hiking: '🥾',
    WALK: '🚶', Walking: '🚶',
    OTHER: '🏋️'
  }
  return icons[sport] || '🏋️'
}

const getInitial = (val) => {
  if (!val) return '?'
  if (typeof val === 'string') return val.charAt(0).toUpperCase()
  return ((val.displayName || val.name || '?').charAt(0).toUpperCase())
}

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

const formatTime = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Data loading
const init = async () => {
  pageLoading.value = true
  pageError.value = ''
  activity.value = null
  comments.value = []
  userReaction.value = null
  reactionCounts.value = {}

  try {
    const [actData, commData] = await Promise.all([
      activityStore.fetchActivity(activityId.value),
      activityStore.fetchComments(activityId.value).catch(() => [])
    ])
    activity.value = actData
    comments.value = Array.isArray(commData) ? commData : []
    reactionCounts.value = actData.reactions || {}
    userReaction.value = actData.currentUserReaction || null

    if (isOwn.value) {
      if (!activityStore.activities.length) await activityStore.fetchActivities()
      const prs = computePRs(activityStore.activities)
      activityPRs.value = getActivityPRs(route.params.id, prs)
    }

    if (!isOwn.value && activity.value?.userId) {
      loadFollowStatus()
    }
  } catch (err) {
    pageError.value = err.response?.data?.error || 'Failed to load activity'
  } finally {
    pageLoading.value = false
  }
}

const loadFollowStatus = async () => {
  try {
    const { data } = await axios.get(
      `${API_URL}/follow/${activity.value.userId}/is-following`,
      { headers: getAuthHeaders() }
    )
    following.value = data === true || data?.following === true
  } catch {
    try {
      const { data } = await axios.get(`${API_URL}/follow/following`, { headers: getAuthHeaders() })
      following.value = (Array.isArray(data) ? data : []).some(
        u => String(u.id) === String(activity.value.userId)
      )
    } catch { /* silent */ }
  }
}

const toggleFollow = async () => {
  followLoading.value = true
  try {
    if (following.value) {
      await axios.delete(`${API_URL}/follow/${activity.value.userId}`, { headers: getAuthHeaders() })
      following.value = false
    } else {
      await axios.post(`${API_URL}/follow/${activity.value.userId}`, {}, { headers: getAuthHeaders() })
      following.value = true
    }
  } catch { /* silent */ } finally {
    followLoading.value = false
  }
}

const toggleReaction = async (type) => {
  if (reactionLoading.value) return
  reactionLoading.value = true
  try {
    if (userReaction.value === type) {
      await activityStore.removeReaction(activityId.value)
      reactionCounts.value[type] = Math.max(0, (reactionCounts.value[type] || 1) - 1)
      userReaction.value = null
    } else {
      if (userReaction.value) {
        reactionCounts.value[userReaction.value] = Math.max(0, (reactionCounts.value[userReaction.value] || 1) - 1)
      }
      await activityStore.reactToActivity(activityId.value, type)
      reactionCounts.value[type] = (reactionCounts.value[type] || 0) + 1
      userReaction.value = type
    }
  } catch { /* silent */ } finally {
    reactionLoading.value = false
  }
}

const submitComment = async () => {
  if (!newComment.value.trim() || commentLoading.value) return
  commentLoading.value = true
  try {
    const data = await activityStore.addComment(activityId.value, newComment.value.trim())
    comments.value.push(data)
    newComment.value = ''
  } catch { /* silent */ } finally {
    commentLoading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Delete this activity? This cannot be undone.')) return
  deleteLoading.value = true
  try {
    await activityStore.deleteActivity(activityId.value)
    router.push('/feed')
  } catch {
    alert('Failed to delete activity')
  } finally {
    deleteLoading.value = false
  }
}

const getPRLabel = (prId) => PR_CATALOG.find(p => p.id === prId)?.label || prId

watch(activityId, () => init())
onMounted(init)
</script>

<style scoped>
.detail-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  min-height: 100vh;
  padding-top: 72px;
  background: var(--r-offwhite);
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

/* Loading / Error */
.page-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: rgba(15,18,16,0.55);
  text-align: center;
}
.page-error i { font-size: 4rem; color: rgba(15,18,16,0.20); }
.page-error h2 { font-weight: 900; font-size: 1.8rem; color: rgba(15,18,16,0.80); margin: 0; }

/* TOP BAR */
.top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 32px;
  background: linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: white;
}
.back-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.25);
  color: white;
  border-radius: 10px;
  padding: 8px 16px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background 0.2s;
  white-space: nowrap;
}
.back-btn:hover { background: rgba(255,255,255,0.25); }
.top-bar-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.sport-chip {
  background: rgba(255,255,255,0.18);
  border-radius: 999px;
  padding: 6px 16px;
  font-weight: 900;
  font-size: 0.9rem;
}
.top-date {
  font-size: 0.85rem;
  color: rgba(255,255,255,0.70);
  font-weight: 700;
}
.top-bar-spacer { width: 80px; }

/* USER ROW */
.user-row-wrap {
  background: white;
  border-bottom: 1px solid rgba(15,18,16,0.08);
  padding: 0 32px;
}
.user-row {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 0;
}
.avatar-link { text-decoration: none; flex-shrink: 0; }
.det-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  font-size: 1.2rem;
}
.user-info { flex: 1; }
.user-name-link {
  font-weight: 900;
  font-size: 1rem;
  color: rgba(15,18,16,0.90);
  text-decoration: none;
}
.user-name-link:hover { color: var(--r-accent); }
.user-sub {
  font-size: 0.78rem;
  color: rgba(15,18,16,0.50);
  margin-top: 2px;
}

/* Buttons */
.btn {
  border: none;
  border-radius: 12px;
  height: 40px;
  padding: 0 18px;
  font-weight: 900;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.btn-primary {
  background: var(--r-accent);
  color: white;
}
.btn-primary:hover:not(:disabled) { background: #a85722; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-follow {
  background: var(--r-accent);
  color: white;
  flex-shrink: 0;
}
.btn-follow:hover:not(:disabled) { background: #a85722; }
.btn-follow:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-following-sm {
  background: rgba(16,185,129,0.15);
  color: rgba(15,18,16,0.80);
  border: 1px solid rgba(16,185,129,0.30);
  flex-shrink: 0;
}
.btn-following-sm:hover:not(:disabled) { background: rgba(239,68,68,0.12); border-color: rgba(239,68,68,0.30); }
.btn-delete {
  background: rgba(239,68,68,0.10);
  color: #dc2626;
  border: 1px solid rgba(239,68,68,0.20);
}
.btn-delete:hover:not(:disabled) { background: rgba(239,68,68,0.18); }
.btn-delete:disabled { opacity: 0.6; cursor: not-allowed; }

/* MAIN LAYOUT */
.detail-layout {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 64px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

/* Cards */
.det-card {
  background: white;
  border: 1px solid rgba(15,18,16,0.09);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(15,18,16,0.06);
  margin-bottom: 20px;
}
.det-section-title {
  font-weight: 900;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.10em;
  color: rgba(15,18,16,0.45);
  margin: 0 0 18px;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(15,18,16,0.08);
  border-radius: 12px;
  overflow: hidden;
}
.stat-box {
  background: white;
  text-align: center;
  padding: 18px 12px;
}
.stat-label {
  font-size: 0.70rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: rgba(15,18,16,0.45);
  margin-bottom: 6px;
}
.stat-val {
  font-weight: 900;
  font-size: 1.15rem;
  color: rgba(15,18,16,0.90);
}

/* Map */
.map-card { padding-bottom: 20px; }
.map-wrap {
  height: 300px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(15,18,16,0.05);
}

/* Reactions */
.reactions-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.reaction-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(15,18,16,0.05);
  border: 2px solid transparent;
  border-radius: 999px;
  padding: 10px 20px;
  font-size: 1.1rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(15,18,16,0.70);
  font-family: inherit;
}
.reaction-btn:hover:not(:disabled) {
  background: rgba(15,18,16,0.09);
  transform: scale(1.05);
}
.reaction-btn.active {
  background: rgba(196,106,42,0.12);
  border-color: var(--r-accent);
  color: var(--r-accent);
}
.reaction-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.reaction-count { font-size: 0.88rem; }

/* Delete row */
.delete-row {
  display: flex;
  justify-content: flex-end;
}

/* Comments */
.detail-right { position: sticky; top: calc(72px + 24px); }
.comments-card {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 72px - 48px - 80px);
  overflow: hidden;
}
.comments-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}
.comment-count-badge {
  background: rgba(15,18,16,0.08);
  border-radius: 999px;
  padding: 2px 10px;
  font-size: 0.75rem;
  font-weight: 900;
  color: rgba(15,18,16,0.60);
}
.comments-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  margin-bottom: 16px;
}
.comments-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: rgba(15,18,16,0.40);
}
.comments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(15,18,16,0.40);
  text-align: center;
  gap: 10px;
}
.comments-empty i { font-size: 2.5rem; }
.comments-empty p { font-weight: 700; margin: 0; font-size: 0.88rem; }
.comment {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}
.comment-body { flex: 1; }
.comment-meta {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.comment-author { font-weight: 900; font-size: 0.85rem; color: rgba(15,18,16,0.85); }
.comment-time { font-size: 0.72rem; color: rgba(15,18,16,0.45); }
.comment-text { margin: 0; font-size: 0.88rem; color: rgba(15,18,16,0.75); line-height: 1.5; }

/* Comment form */
.comment-form {
  display: flex;
  gap: 8px;
  border-top: 1px solid rgba(15,18,16,0.08);
  padding-top: 14px;
}
.comment-input {
  flex: 1;
  border: 1.5px solid rgba(15,18,16,0.12);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 0.9rem;
  font-family: inherit;
  background: rgba(15,18,16,0.02);
  outline: none;
  transition: border-color 0.2s;
}
.comment-input:focus { border-color: var(--r-accent); }
.comment-input:disabled { opacity: 0.5; }
.comment-submit {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: var(--r-accent);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
  flex-shrink: 0;
}
.comment-submit:hover:not(:disabled) { background: #a85722; }
.comment-submit:disabled { opacity: 0.4; cursor: not-allowed; }

/* PR Banner */
.pr-banner {
  background: rgba(22,163,74,0.06);
  border-color: rgba(22,163,74,0.30) !important;
}
.pr-banner-header {
  font-weight: 900;
  font-size: 1.05rem;
  color: #15803d;
  margin-bottom: 12px;
}
.pr-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.pr-pill {
  display: inline-flex;
  align-items: center;
  background: rgba(22,163,74,0.12);
  border: 1px solid rgba(22,163,74,0.25);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.82rem;
  font-weight: 900;
  color: #15803d;
}

/* Utilities */
.me-1 { margin-right: 4px; }
.me-2 { margin-right: 8px; }
.spinner-border { width: 2rem; height: 2rem; border: 3px solid rgba(15,18,16,0.15); border-top-color: var(--r-accent); border-radius: 50%; animation: spin 0.75s linear infinite; }
.spinner-border-sm { width: 1rem; height: 1rem; border-width: 2px; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
  .detail-right {
    position: static;
  }
  .comments-card {
    max-height: none;
  }
}

@media (max-width: 600px) {
  .top-bar { padding: 16px 20px; }
  .top-bar-spacer { display: none; }
  .user-row-wrap { padding: 0 20px; }
  .detail-layout { padding: 20px 16px 48px; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .top-date { display: none; }
}
</style>
