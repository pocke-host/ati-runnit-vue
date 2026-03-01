<!-- src/views/UserProfile.vue -->
<template>
  <div class="profile-page">
    <!-- Loading -->
    <div v-if="pageLoading" class="page-loading">
      <div class="spinner-border" role="status"></div>
      <p>Loading profile…</p>
    </div>

    <!-- Not found -->
    <div v-else-if="notFound" class="page-error">
      <i class="bi bi-person-x"></i>
      <h2>Athlete not found</h2>
      <p>This profile doesn't exist or may have been removed.</p>
      <router-link to="/feed" class="btn btn-primary">Back to Feed</router-link>
    </div>

    <!-- Generic error -->
    <div v-else-if="pageError" class="page-error">
      <i class="bi bi-exclamation-circle"></i>
      <h2>Couldn't load profile</h2>
      <p>{{ pageError }}</p>
      <button class="btn btn-primary" @click="init">Try again</button>
    </div>

    <template v-else>
      <!-- HERO -->
      <section class="profile-hero">
        <div class="hero-inner">
          <div class="avatar-wrap">
            <div class="avatar-xl">{{ userInitial }}</div>
            <div v-if="isOwnProfile" class="avatar-badge" title="Your profile">
              <i class="bi bi-star-fill"></i>
            </div>
          </div>

          <div class="hero-info">
            <h1 class="hero-name">{{ profile.displayName || 'Athlete' }}</h1>
            <div class="hero-meta">
              <span v-if="profile.location" class="meta-chip">
                <i class="bi bi-geo-alt me-1"></i>{{ profile.location }}
              </span>
              <span v-if="profile.sport" class="meta-chip meta-chip-sport">
                {{ sportEmoji(profile.sport) }} {{ profile.sport }}
              </span>
              <span class="meta-chip meta-chip-date">
                <i class="bi bi-calendar3 me-1"></i>Joined {{ joinedDate }}
              </span>
            </div>

            <div class="hero-stats">
              <div class="hstat">
                <div class="hstat-val">{{ activitiesCount }}</div>
                <div class="hstat-label">Activities</div>
              </div>
              <div class="hstat-divider"></div>
              <div class="hstat">
                <div class="hstat-val">{{ formatDistance(totalDistanceMeters) }}</div>
                <div class="hstat-label">Total</div>
              </div>
              <div class="hstat-divider"></div>
              <div class="hstat">
                <div class="hstat-val">{{ profile.followingCount ?? '—' }}</div>
                <div class="hstat-label">Following</div>
              </div>
              <div class="hstat-divider"></div>
              <div class="hstat">
                <div class="hstat-val">{{ profile.followerCount ?? '—' }}</div>
                <div class="hstat-label">Followers</div>
              </div>
            </div>

            <div class="hero-actions">
              <template v-if="isOwnProfile">
                <router-link to="/settings" class="btn btn-outline">
                  <i class="bi bi-pencil me-2"></i>Edit Profile
                </router-link>
                <router-link to="/dashboard" class="btn btn-primary">
                  <i class="bi bi-grid-3x3-gap me-2"></i>Dashboard
                </router-link>
              </template>
              <template v-else>
                <button
                  v-if="!following"
                  class="btn btn-primary"
                  @click="toggleFollow"
                  :disabled="followLoading"
                >
                  <span v-if="followLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-person-plus me-2"></i>Follow
                </button>
                <button
                  v-else
                  class="btn btn-following"
                  @click="toggleFollow"
                  :disabled="followLoading"
                >
                  <i class="bi bi-check me-2"></i>Following
                </button>
                <router-link to="/feed" class="btn btn-outline">
                  <i class="bi bi-collection me-2"></i>Feed
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- CONTENT TABS -->
      <div class="content-tabs-bar">
        <div class="content-tabs">
          <button :class="['ctab', { active: tab === 'activities' }]" @click="tab = 'activities'">
            <i class="bi bi-activity me-2"></i>Activities
            <span class="ctab-count">{{ activitiesCount }}</span>
          </button>
          <button :class="['ctab', { active: tab === 'moments' }]" @click="tab = 'moments'">
            <i class="bi bi-camera me-2"></i>Moments
            <span class="ctab-count">{{ moments.length }}</span>
          </button>
          <button :class="['ctab', { active: tab === 'badges' }]" @click="tab = 'badges'">
            <i class="bi bi-trophy me-2"></i>Badges
            <span class="ctab-count">{{ profileBadges.filter(b => b.earned).length }}</span>
          </button>
        </div>
      </div>

      <!-- CONTENT AREA -->
      <div class="content-area">

        <!-- ── ACTIVITIES TAB ── -->
        <div v-if="tab === 'activities'">
          <div v-if="activitiesLoading" class="tab-loading">
            <div class="spinner-border spinner-border-sm"></div>
            <span>Loading activities…</span>
          </div>

          <div v-else-if="profileActivities.length === 0" class="tab-empty">
            <i class="bi bi-activity"></i>
            <p>No activities logged yet.</p>
          </div>

          <div v-else class="activities-grid">
            <router-link
              v-for="act in profileActivities"
              :key="act.id"
              :to="`/activities/${act.id}`"
              class="act-card-link"
            >
            <div class="act-card">
              <div class="act-sport-banner">
                <span class="act-sport-icon">{{ sportEmoji(act.sportType) }}</span>
                <span class="act-type-label">{{ act.sportType }}</span>
                <span class="act-time">{{ formatTime(act.createdAt) }}</span>
              </div>
              <div class="act-stats">
                <div class="act-stat">
                  <div class="act-stat-label">Distance</div>
                  <div class="act-stat-val">{{ formatDistance(act.distanceMeters) }}</div>
                </div>
                <div class="act-stat">
                  <div class="act-stat-label">Duration</div>
                  <div class="act-stat-val">{{ formatDuration(act.durationSeconds) }}</div>
                </div>
                <div v-if="act.elevationGain" class="act-stat">
                  <div class="act-stat-label">Elevation</div>
                  <div class="act-stat-val">{{ formatElevation(act.elevationGain) }}</div>
                </div>
              </div>
            </div>
            </router-link>
          </div>

          <!-- Load more -->
          <div v-if="hasMoreActivities" class="load-more-row">
            <button class="btn btn-outline" @click="loadMoreActivities" :disabled="activitiesLoading">
              Load more
            </button>
          </div>
        </div>

        <!-- ── MOMENTS TAB ── -->
        <div v-if="tab === 'moments'">
          <div v-if="momentsLoading" class="tab-loading">
            <div class="spinner-border spinner-border-sm"></div>
            <span>Loading moments…</span>
          </div>

          <div v-else-if="moments.length === 0" class="tab-empty">
            <i class="bi bi-camera"></i>
            <p>No moments shared yet.</p>
          </div>

          <div v-else class="moments-grid">
            <div
              v-for="m in moments"
              :key="m.id"
              class="moment-thumb"
              @click="openMoment(m)"
            >
              <img :src="m.photoUrl" :alt="`${profile.displayName}'s moment`" />
              <div class="moment-thumb-overlay">
                <span><i class="bi bi-heart-fill me-1"></i>{{ getTotalReactions(m) }}</span>
                <span><i class="bi bi-chat-fill me-1"></i>{{ m.commentCount || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- ── BADGES TAB ── -->
        <div v-if="tab === 'badges'">
          <div v-if="badgesLoading" class="tab-loading">
            <div class="spinner-border spinner-border-sm"></div>
            <span>Loading badges…</span>
          </div>

          <div v-else-if="profileBadges.filter(b => b.earned).length === 0 && !isOwnProfile" class="tab-empty">
            <i class="bi bi-trophy"></i>
            <p>No badges earned yet.</p>
          </div>

          <div v-else class="badges-grid">
            <div
              v-for="badge in (isOwnProfile ? profileBadges : profileBadges.filter(b => b.earned))"
              :key="badge.id"
              :class="['pbadge-card', { earned: badge.earned, locked: !badge.earned }, `tier-${badge.tier}`]"
            >
              <div class="pbadge-icon-wrap">
                <span class="pbadge-icon">{{ badge.icon }}</span>
              </div>
              <div class="pbadge-name">{{ badge.name }}</div>
              <div class="pbadge-tier-pill" :class="`ptier-pill-${badge.tier}`">{{ badge.tier }}</div>
              <template v-if="badge.earned">
                <div class="pbadge-status-earned">Earned</div>
              </template>
              <template v-else>
                <div class="pbadge-status-locked">🔒 Locked</div>
                <div class="pbadge-desc">{{ badge.description }}</div>
              </template>
            </div>
          </div>
        </div>

      </div>
    </template>

    <!-- Moment detail modal (reuse Feed pattern) -->
    <div v-if="selectedMoment" class="moment-modal-overlay" @click.self="selectedMoment = null">
      <div class="moment-modal">
        <button class="modal-close-btn" @click="selectedMoment = null">
          <i class="bi bi-x-lg"></i>
        </button>
        <div class="moment-modal-inner">
          <div class="moment-modal-img">
            <img :src="selectedMoment.photoUrl" />
          </div>
          <div class="moment-modal-side">
            <div class="moment-modal-user">
              <div class="m-avatar">{{ userInitial }}</div>
              <div>
                <div class="m-name">{{ profile.displayName }}</div>
                <div class="m-time">{{ formatTimeFull(selectedMoment.createdAt) }}</div>
              </div>
            </div>
            <div class="moment-song">
              <span class="song-icon">🎵</span>
              <div>
                <div class="song-title">{{ selectedMoment.songTitle }}</div>
                <div class="song-artist">{{ selectedMoment.songArtist }}</div>
                <a v-if="selectedMoment.songLink" :href="selectedMoment.songLink" target="_blank" class="song-link">
                  <i class="bi bi-spotify me-1"></i>Listen
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import { useAchievementStore, BADGE_CATALOG, computeEarnedBadges } from '@/stores/achievement'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const achievementStore = useAchievementStore()
const { user } = storeToRefs(authStore)

const { formatDistance, formatDuration, formatElevation } = useUnits()

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// State
const pageLoading = ref(true)
const notFound = ref(false)
const pageError = ref('')
const profile = ref({})
const profileActivities = ref([])
const moments = ref([])
const activitiesLoading = ref(false)
const momentsLoading = ref(false)
const following = ref(false)
const followLoading = ref(false)
const tab = ref('activities')
const selectedMoment = ref(null)
const activitiesPage = ref(0)
const hasMoreActivities = ref(false)

// Badges tab
const profileBadges = ref([])
const badgesLoading = ref(false)
const badgesLoaded = ref(false)

const profileId = computed(() => route.params.id)
const isOwnProfile = computed(() => user.value?.id && String(user.value.id) === String(profileId.value))
const userInitial = computed(() => profile.value.displayName?.charAt(0).toUpperCase() || '?')
const activitiesCount = computed(() => profile.value.activityCount ?? profileActivities.value.length)
const totalDistanceMeters = computed(() => profileActivities.value.reduce((s, a) => s + (a.distanceMeters || 0), 0))

const joinedDate = computed(() => {
  if (!profile.value.createdAt) return ''
  return new Date(profile.value.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
})

const sportEmoji = (sport) => {
  const map = { RUN: '🏃', Running: '🏃', BIKE: '🚴', Cycling: '🚴', SWIM: '🏊', Swimming: '🏊', HIKE: '🥾', Hiking: '🥾', WALK: '🚶', Walking: '🚶', Triathlon: '🏊' }
  return map[sport] || '🏋️'
}

const formatTime = (d) => {
  const diff = Date.now() - new Date(d)
  const days = Math.floor(diff / 86400000)
  if (days < 1) return 'Today'
  if (days < 7) return `${days}d ago`
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatTimeFull = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

const getTotalReactions = (m) => m.reactions ? Object.values(m.reactions).reduce((s, c) => s + c, 0) : 0

const openMoment = (m) => { selectedMoment.value = m }

// API
const loadProfile = async () => {
  pageLoading.value = true
  notFound.value = false
  pageError.value = ''
  if (!profileId.value) {
    notFound.value = true
    pageLoading.value = false
    return
  }
  try {
    const { data } = await axios.get(`${API_URL}/users/${profileId.value}`, { headers: getAuthHeaders() })
    profile.value = data
  } catch (err) {
    const status = err.response?.status
    console.error('Profile load error:', status, err.message)
    if (status === 404) {
      notFound.value = true
    } else {
      pageError.value = `Unable to load profile (${status ?? 'network error'}). The backend may not have this endpoint yet.`
    }
  } finally {
    pageLoading.value = false
  }
}

const loadActivities = async (reset = true) => {
  if (reset) {
    activitiesPage.value = 0
    profileActivities.value = []
  }
  activitiesLoading.value = true
  try {
    const { data } = await axios.get(
      `${API_URL}/activities?userId=${profileId.value}&page=${activitiesPage.value}&size=12`,
      { headers: getAuthHeaders() }
    )
    const items = data.content || data || []
    profileActivities.value = reset ? items : [...profileActivities.value, ...items]
    hasMoreActivities.value = data.totalPages ? activitiesPage.value < data.totalPages - 1 : items.length === 12
  } catch {
    profileActivities.value = []
  } finally {
    activitiesLoading.value = false
  }
}

const loadMoreActivities = async () => {
  activitiesPage.value++
  await loadActivities(false)
}

const loadMoments = async () => {
  momentsLoading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/users/${profileId.value}/moments`, { headers: getAuthHeaders() })
    moments.value = data.content || data || []
  } catch {
    moments.value = []
  } finally {
    momentsLoading.value = false
  }
}

const loadFollowStatus = async () => {
  if (isOwnProfile.value) return
  try {
    const { data } = await axios.get(`${API_URL}/follow/${profileId.value}/is-following`, { headers: getAuthHeaders() })
    following.value = data === true || data?.following === true
  } catch {
    // fall back to checking full list
    try {
      const { data } = await axios.get(`${API_URL}/follow/following`, { headers: getAuthHeaders() })
      following.value = (Array.isArray(data) ? data : []).some(u => String(u.id) === String(profileId.value))
    } catch { /* silent */ }
  }
}

const toggleFollow = async () => {
  followLoading.value = true
  try {
    if (following.value) {
      await axios.delete(`${API_URL}/follow/${profileId.value}`, { headers: getAuthHeaders() })
      following.value = false
      if (profile.value.followerCount != null) profile.value.followerCount--
    } else {
      await axios.post(`${API_URL}/follow/${profileId.value}`, {}, { headers: getAuthHeaders() })
      following.value = true
      if (profile.value.followerCount != null) profile.value.followerCount++
    }
  } catch { /* silent */ } finally {
    followLoading.value = false
  }
}

const loadBadges = async () => {
  badgesLoading.value = true
  try {
    const earnedList = await achievementStore.fetchAchievementsForUser(profileId.value, profileActivities.value)
    const earnedSet = new Set(earnedList.map(e => e.badgeId))
    profileBadges.value = BADGE_CATALOG.map(b => {
      const found = earnedList.find(e => e.badgeId === b.id)
      return { ...b, earned: earnedSet.has(b.id), earnedAt: found?.earnedAt || null }
    })
    badgesLoaded.value = true
  } catch {
    // fallback: compute from local activities
    const earnedSet = computeEarnedBadges(profileActivities.value)
    profileBadges.value = BADGE_CATALOG.map(b => ({ ...b, earned: earnedSet.has(b.id), earnedAt: null }))
    badgesLoaded.value = true
  } finally {
    badgesLoading.value = false
  }
}

// Lazy-load tabs on first switch
watch(tab, (val) => {
  if (val === 'moments' && moments.value.length === 0 && !momentsLoading.value) {
    loadMoments()
  }
  if (val === 'badges' && !badgesLoaded.value) {
    loadBadges()
  }
})

// Re-load when navigating between profiles
watch(profileId, () => {
  init()
})

const init = async () => {
  pageError.value = ''
  profileBadges.value = []
  badgesLoaded.value = false
  await loadProfile()
  if (!notFound.value && !pageError.value) {
    await Promise.all([loadActivities(), loadFollowStatus()])
  }
}

onMounted(init)
</script>

<style scoped>
.profile-page {
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
.page-loading, .page-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: rgba(15,18,16,0.60);
  text-align: center;
}
.page-error i { font-size: 5rem; color: rgba(15,18,16,0.20); }
.page-error h2 { font-weight: 900; font-size: 1.8rem; color: rgba(15,18,16,0.80); margin: 0; }

/* HERO */
.profile-hero {
  background:
    radial-gradient(900px 420px at 18% 18%, rgba(255,255,255,0.10), rgba(255,255,255,0) 60%),
    radial-gradient(900px 420px at 85% 30%, rgba(196,106,42,0.10), rgba(196,106,42,0) 60%),
    linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  color: white;
  padding: 48px 0 40px;
}
.hero-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 36px;
  align-items: flex-start;
}

/* Avatar */
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-xl {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  border: 4px solid rgba(255,255,255,0.60);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 3rem;
  color: white;
  box-shadow: 0 8px 32px rgba(0,0,0,0.20);
}
.avatar-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--r-accent);
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: white;
}

/* Hero info */
.hero-info { flex: 1; }
.hero-name {
  font-weight: 900;
  font-size: 2.4rem;
  margin: 0 0 12px;
  color: white;
  line-height: 1.1;
}
.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}
.meta-chip {
  padding: 5px 14px;
  border-radius: 999px;
  background: rgba(255,255,255,0.15);
  font-size: 0.82rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.meta-chip-sport { background: rgba(196,106,42,0.55); }
.meta-chip-date { background: rgba(255,255,255,0.10); }

.hero-stats {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 24px;
  background: rgba(255,255,255,0.10);
  border-radius: 16px;
  padding: 16px 24px;
  width: fit-content;
}
.hstat { text-align: center; padding: 0 20px; }
.hstat-val { font-weight: 900; font-size: 1.6rem; color: white; line-height: 1; }
.hstat-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.70); margin-top: 4px; }
.hstat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.20); }

.hero-actions { display: flex; gap: 12px; }

/* Buttons */
.btn {
  border: 1px solid rgba(255,255,255,0.30);
  background: rgba(255,255,255,0.15);
  color: white;
  border-radius: 14px;
  height: 44px;
  padding: 0 20px;
  font-weight: 900;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.btn:hover { background: rgba(255,255,255,0.25); }
.btn-primary {
  background: var(--r-accent);
  border-color: var(--r-accent);
  color: white;
}
.btn-primary:hover:not(:disabled) { background: #a85722; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-following {
  background: rgba(16,185,129,0.20);
  border-color: rgba(255,255,255,0.30);
  color: white;
}
.btn-following:hover { background: rgba(239,68,68,0.25); }
.btn-following:hover::after { content: 'Unfollow'; }
.btn-outline { background: transparent; border-color: rgba(255,255,255,0.35); color: rgba(255,255,255,0.90); }
.btn-outline:hover { background: rgba(255,255,255,0.12); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.85rem; }

/* Content tabs */
.content-tabs-bar {
  background: white;
  border-bottom: 1px solid rgba(15,18,16,0.10);
  position: sticky;
  top: 72px;
  z-index: 50;
}
.content-tabs {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
}
.ctab {
  padding: 16px 24px;
  border: none;
  background: transparent;
  font-weight: 900;
  font-size: 0.9rem;
  color: rgba(15,18,16,0.55);
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ctab:hover { color: rgba(15,18,16,0.80); }
.ctab.active { color: var(--r-accent); border-bottom-color: var(--r-accent); }
.ctab-count {
  background: rgba(15,18,16,0.08);
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.75rem;
}
.ctab.active .ctab-count { background: rgba(196,106,42,0.15); color: var(--r-accent); }

/* Content area */
.content-area {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px 64px;
}

/* Loading / Empty */
.tab-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 60px;
  color: rgba(15,18,16,0.55);
}
.tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: rgba(15,18,16,0.45);
  text-align: center;
}
.tab-empty i { font-size: 4rem; margin-bottom: 16px; }
.tab-empty p { font-weight: 700; margin: 0; }

/* Activity card link wrapper */
.act-card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

/* Activities grid */
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.act-card {
  background: white;
  border: 1px solid rgba(15,18,16,0.09);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15,18,16,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.act-card:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(15,18,16,0.12); }
.act-sport-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: linear-gradient(135deg, rgba(90,107,78,0.12), rgba(90,107,78,0.05));
  border-bottom: 1px solid rgba(15,18,16,0.07);
}
.act-sport-icon { font-size: 1.8rem; line-height: 1; }
.act-type-label { font-weight: 900; font-size: 0.9rem; color: rgba(15,18,16,0.80); flex: 1; }
.act-time { font-size: 0.75rem; color: rgba(15,18,16,0.50); }
.act-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: rgba(15,18,16,0.07);
}
.act-stat {
  background: white;
  text-align: center;
  padding: 14px 8px;
}
.act-stat-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(15,18,16,0.50); margin-bottom: 4px; }
.act-stat-val { font-weight: 900; font-size: 1rem; color: rgba(15,18,16,0.90); }

.load-more-row {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}
.load-more-row .btn {
  border-color: rgba(15,18,16,0.15);
  color: rgba(15,18,16,0.70);
  background: white;
}
.load-more-row .btn:hover { background: rgba(15,18,16,0.04); }

/* Moments grid */
.moments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.moment-thumb {
  position: relative;
  aspect-ratio: 3/4;
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(15,18,16,0.08);
}
.moment-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.moment-thumb:hover img { transform: scale(1.04); }
.moment-thumb-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.70), transparent 50%);
  display: flex;
  align-items: flex-end;
  gap: 14px;
  padding: 14px;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
  font-weight: 700;
  font-size: 0.88rem;
}
.moment-thumb:hover .moment-thumb-overlay { opacity: 1; }

/* Moment modal */
.moment-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15,18,16,0.92);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.moment-modal {
  background: white;
  border-radius: 24px;
  max-width: 700px;
  width: 100%;
  overflow: hidden;
  position: relative;
}
.modal-close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: 1px solid rgba(15,18,16,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
}
.modal-close-btn:hover { transform: rotate(90deg); }
.moment-modal-inner { display: grid; grid-template-columns: 1fr 260px; }
.moment-modal-img { background: rgba(15,18,16,0.05); max-height: 520px; overflow: hidden; }
.moment-modal-img img { width: 100%; height: 100%; object-fit: cover; }
.moment-modal-side {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-left: 1px solid rgba(15,18,16,0.10);
}
.moment-modal-user { display: flex; align-items: center; gap: 12px; }
.m-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; color: white; font-size: 1.1rem; flex-shrink: 0;
}
.m-name { font-weight: 900; font-size: 0.95rem; }
.m-time { font-size: 0.78rem; color: rgba(15,18,16,0.55); }
.moment-song {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: rgba(196,106,42,0.07);
  border-radius: 12px;
  padding: 14px;
}
.song-icon { font-size: 1.8rem; line-height: 1; }
.song-title { font-weight: 900; font-size: 0.9rem; margin-bottom: 2px; }
.song-artist { font-size: 0.8rem; color: rgba(15,18,16,0.60); margin-bottom: 6px; }
.song-link {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--r-accent);
  text-decoration: none;
}
.song-link:hover { opacity: 0.8; }

.me-1 { margin-right: 4px; }
.me-2 { margin-right: 8px; }

/* Badges tab */
.badges-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
}
.pbadge-card {
  background: white;
  border-radius: 18px;
  border: 1.5px solid rgba(15,18,16,0.09);
  padding: 22px 14px 18px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 7px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.pbadge-card.locked { filter: grayscale(0.85); opacity: 0.70; }
.pbadge-card.earned.tier-bronze { box-shadow: 0 0 0 2px #CD7F32, 0 4px 16px rgba(205,127,50,0.20); }
.pbadge-card.earned.tier-silver { box-shadow: 0 0 0 2px #A8A9AD, 0 4px 16px rgba(168,169,173,0.24); }
.pbadge-card.earned.tier-gold { box-shadow: 0 0 0 2px #FFD700, 0 4px 16px rgba(255,215,0,0.24); }
.pbadge-card.earned.tier-special { box-shadow: 0 0 0 2px #7C3AED, 0 4px 16px rgba(124,58,237,0.20); }
.pbadge-card:hover:not(.locked) { transform: translateY(-2px); }
.pbadge-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(15,18,16,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}
.pbadge-icon { font-size: 1.8rem; line-height: 1; }
.pbadge-name { font-weight: 900; font-size: 0.88rem; color: rgba(15,18,16,0.90); line-height: 1.2; }
.pbadge-desc { font-size: 0.70rem; color: rgba(15,18,16,0.50); font-weight: 600; }
.pbadge-tier-pill {
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ptier-pill-bronze { background: rgba(205,127,50,0.14); color: #CD7F32; }
.ptier-pill-silver { background: rgba(168,169,173,0.18); color: #808285; }
.ptier-pill-gold { background: rgba(255,215,0,0.16); color: #b8930a; }
.ptier-pill-special { background: rgba(124,58,237,0.12); color: #7C3AED; }
.pbadge-status-earned { font-size: 0.72rem; font-weight: 700; color: #16a34a; }
.pbadge-status-locked { font-size: 0.72rem; font-weight: 700; color: rgba(15,18,16,0.40); }

@media (max-width: 900px) {
  .badges-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .hero-inner { flex-direction: column; align-items: center; text-align: center; }
  .hero-meta { justify-content: center; }
  .hero-stats { flex-wrap: wrap; }
  .hero-actions { justify-content: center; }
  .avatar-xl { width: 90px; height: 90px; font-size: 2.2rem; }
  .hero-name { font-size: 1.8rem; }
  .moments-grid { grid-template-columns: repeat(2, 1fr); }
  .moment-modal-inner { grid-template-columns: 1fr; }
  .moment-modal-img { max-height: 300px; }
  .badges-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
}
</style>
