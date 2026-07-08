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
      <!-- HERO — Good Record ink section -->
      <section class="profile-hero">
        <div class="hero-inner">
          <!-- Avatar slot -->
          <div class="gr-avatar-wrap">
            <UserAvatar :src="profile.avatarUrl" :name="profile.displayName || ''" :size="88" class="gr-avatar-img" />
          </div>

          <div class="hero-info">
            <div class="hero-top-row">
              <div>
                <h1 class="gr-hero-name">{{ profile.displayName || 'Athlete' }}</h1>
                <div class="gr-hero-handle">@{{ profile.handle || (profile.displayName||'').toLowerCase().replace(/\s+/g,'') }} · No. {{ String(profile.id || 0).padStart(4, '0') }}</div>
              </div>
              <template v-if="isOwnProfile">
                <router-link to="/settings" class="gr-btn-pill">Edit Profile</router-link>
              </template>
              <template v-else>
                <button v-if="!following" class="gr-btn-pill" @click="toggleFollow" :disabled="followLoading">
                  <span v-if="followLoading" class="spinner-border spinner-border-sm me-1"></span>
                  <span v-else>Follow</span>
                </button>
                <button v-else class="gr-btn-pill gr-btn-pill--following" @click="toggleFollow" :disabled="followLoading">
                  Following
                </button>
              </template>
            </div>

            <p v-if="profile.bio" class="gr-hero-bio">{{ profile.bio }}</p>

            <!-- Archetype badge (Road Warrior style) -->
            <span v-if="archetypeData?.label" class="gr-archetype-badge">{{ archetypeData.label }}</span>

            <!-- 3-cell stat block -->
            <div class="gr-stat-block">
              <div class="gr-stat-cell">
                <div class="gr-stat-cell-lbl">Runs</div>
                <div class="gr-stat-cell-val">{{ activitiesCount }}</div>
              </div>
              <div class="gr-stat-cell gr-stat-cell--sep">
                <div class="gr-stat-cell-lbl">Distance</div>
                <div class="gr-stat-cell-val">{{ formatDistance(totalDistanceMeters) }}</div>
              </div>
              <div class="gr-stat-cell gr-stat-cell--sep">
                <div class="gr-stat-cell-lbl">PRs</div>
                <div class="gr-stat-cell-val gr-stat-cell-val--yellow">{{ personalRecords ? Object.values(personalRecords).filter(Boolean).length : '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ARCHETYPE CARD -->
      <section class="archetype-section" v-if="profileActivities.length > 0">
        <div class="arch-inner">
          <div class="arch-left">
            <div class="arch-eyebrow">ATHLETE ARCHETYPE</div>
            <div class="arch-name" :style="{ color: archetypeData.color }">
              <i :class="['bi', archetypeData.icon, 'me-2']"></i>{{ archetypeData.label }}
            </div>
            <div class="arch-tagline">{{ archetypeData.tagline }}</div>
          </div>
          <div class="arch-right">
            <span v-for="t in archetypeData.traits" :key="t" class="arch-trait-pill">{{ t }}</span>
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
          <button :class="['ctab', { active: tab === 'journey' }]" @click="tab = 'journey'">
            <i class="bi bi-map me-2"></i>Journey
            <span class="ctab-count">{{ growthTimeline.length }}</span>
          </button>
          <button :class="['ctab', { active: tab === 'events' }]" @click="switchToEvents">
            <i class="bi bi-collection me-2"></i>Events
            <span class="ctab-count">{{ profileEvents.length }}</span>
          </button>
          <button :class="['ctab', { active: tab === 'records' }]" @click="switchToRecords">
            <i class="bi bi-trophy-fill me-2"></i>PRs
          </button>
        </div>
      </div>

      <!-- CONTENT AREA -->
      <div class="content-area">

        <!-- ── ACTIVITIES TAB ── -->
        <div v-if="tab === 'activities'">
          <div v-if="activitiesLoading" class="sk-activity-list">
            <SkeletonCard v-for="n in 5" :key="n" variant="activity-row" />
          </div>

          <div v-else-if="activitiesError" class="tab-empty">
            <i class="bi bi-wifi-off"></i>
            <p>Couldn't load activities.</p>
            <button class="btn btn-outline btn-sm mt-2" @click="loadActivities()">Retry</button>
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
          <div v-if="momentsLoading" class="moments-grid">
            <SkeletonCard v-for="n in 9" :key="n" variant="moment-tile" />
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
              <img :src="m.photoUrl" :alt="`${profile.displayName}'s moment`" loading="lazy" />
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

        <!-- ── EVENTS TAB ── -->
        <!-- ── JOURNEY TAB ── -->
        <div v-if="tab === 'journey'">
          <div v-if="growthTimeline.length === 0" class="tab-empty">
            <i class="bi bi-map"></i>
            <p>Log activities to build your journey timeline.</p>
          </div>
          <div v-else class="journey-list">
            <div v-for="(m, i) in growthTimeline" :key="i" class="journey-row">
              <div class="journey-row-icon">{{ m.icon }}</div>
              <div class="journey-row-body">
                <div class="journey-row-label">{{ m.label }}</div>
                <div class="journey-row-sub">{{ m.sub }}</div>
              </div>
              <div class="journey-row-date">{{ m.date }}</div>
            </div>
          </div>
        </div>

        <div v-if="tab === 'events'">
          <div v-if="eventsLoading" class="tab-loading">
            <div class="spinner-border spinner-border-sm"></div>
            <span>Loading events…</span>
          </div>

          <div v-else-if="profileEvents.length === 0" class="tab-empty">
            <i class="bi bi-collection"></i>
            <p>No multisport events yet.</p>
            <router-link v-if="isOwnProfile" to="/feed" class="btn btn-primary mt-2" style="font-size:.78rem">
              Create Event
            </router-link>
          </div>

          <div v-else class="events-list">
            <router-link
              v-for="ev in profileEvents"
              :key="ev.id"
              :to="`/multisport-events/${ev.id}`"
              class="event-row"
            >
              <div class="event-row-left">
                <div class="event-type-badge">{{ eventTypeLabel(ev.eventType) }}</div>
                <div class="event-row-name">{{ ev.name }}</div>
                <div class="event-row-meta">
                  {{ ev.eventDate || 'No date' }} · {{ ev.segmentCount }} segments
                </div>
              </div>
              <div class="event-row-right">
                <div class="event-row-dist">{{ formatDistance(ev.totalDistanceMeters) }}</div>
                <i class="bi bi-chevron-right event-row-arrow"></i>
              </div>
            </router-link>
          </div>
        </div>

        <!-- ── RECORDS TAB ── -->
        <div v-if="tab === 'records'">
          <div v-if="recordsLoading" class="tab-loading">
            <div class="spinner-border spinner-border-sm"></div>
            <span>Loading records…</span>
          </div>
          <div v-else-if="!personalRecords || !hasAnyRecord" class="tab-empty">
            <i class="bi bi-trophy"></i>
            <p>No personal records yet. Log races or time trials to set PRs.</p>
          </div>
          <div v-else class="records-grid">
            <div class="pr-card" v-if="personalRecords.best_5k">
              <div class="pr-distance">5K</div>
              <div class="pr-time">{{ formatSecondsToTime(personalRecords.best_5k) }}</div>
              <div class="pr-label">Personal Best</div>
            </div>
            <div class="pr-card" v-if="personalRecords.best_10k">
              <div class="pr-distance">10K</div>
              <div class="pr-time">{{ formatSecondsToTime(personalRecords.best_10k) }}</div>
              <div class="pr-label">Personal Best</div>
            </div>
            <div class="pr-card" v-if="personalRecords.best_half">
              <div class="pr-distance">Half Marathon</div>
              <div class="pr-time">{{ formatSecondsToTime(personalRecords.best_half) }}</div>
              <div class="pr-label">Personal Best</div>
            </div>
            <div class="pr-card" v-if="personalRecords.best_marathon">
              <div class="pr-distance">Marathon</div>
              <div class="pr-time">{{ formatSecondsToTime(personalRecords.best_marathon) }}</div>
              <div class="pr-label">Personal Best</div>
            </div>
            <div class="pr-card pr-card-distance" v-if="personalRecords.longest_run">
              <div class="pr-distance">Longest Run</div>
              <div class="pr-time">{{ formatDistance(personalRecords.longest_run) }}</div>
              <div class="pr-label">All Time</div>
            </div>
            <div class="pr-card pr-card-distance" v-if="personalRecords.fastest_pace">
              <div class="pr-distance">Fastest Pace</div>
              <div class="pr-time">{{ formatPace(personalRecords.fastest_pace) }}</div>
              <div class="pr-label">Per mile/km</div>
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
            <img :src="selectedMoment.photoUrl" loading="lazy" />
          </div>
          <div class="moment-modal-side">
            <div class="moment-modal-user">
              <UserAvatar :src="profile.avatarUrl" :name="profile.displayName || ''" :size="36" />
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
import { useToast } from '@/composables/useToast'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import { useDisciplineScore } from '@/composables/useDisciplineScore'
import { useArchetype } from '@/composables/useArchetype'
import { useGrowthTimeline } from '@/composables/useGrowthTimeline'
import { useAchievementStore, BADGE_CATALOG, computeEarnedBadges } from '@/stores/achievement'
import { useNotificationStore } from '@/stores/notification'
import SkeletonCard from '@/components/SkeletonCard.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const achievementStore = useAchievementStore()
const notificationStore = useNotificationStore()
const { user } = storeToRefs(authStore)
const { showToast } = useToast()

const { formatDistance, formatDuration, formatElevation, formatPace } = useUnits()

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
const activitiesError = ref(false)
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

// Events tab
const profileEvents = ref([])
const eventsLoading = ref(false)
const eventsLoaded = ref(false)

const profileId = computed(() => route.params.id)
const isOwnProfile = computed(() => user.value?.id && String(user.value.id) === String(profileId.value))
const userInitial = computed(() => profile.value.displayName?.charAt(0).toUpperCase() || '?')
const activitiesCount = computed(() => profile.value.activityCount ?? profileActivities.value.length)
const totalDistanceMeters = computed(() => profileActivities.value.reduce((s, a) => s + (a.distanceMeters || 0), 0))
const disciplineData  = computed(() => useDisciplineScore(profileActivities.value))
const archetypeData   = computed(() => useArchetype(profileActivities.value))
const serverArchetype = ref(null)
const growthTimeline  = computed(() => useGrowthTimeline(profileActivities.value))

// Streak
const currentStreak = computed(() => {
  const acts = profileActivities.value || []
  if (!acts.length) return 0
  const uniqueDays = [...new Set(
    acts.map(a => { const d = new Date(a.createdAt); d.setHours(0,0,0,0); return d.getTime() })
  )].sort((a, b) => b - a)
  let streak = 0
  let cursor = new Date(); cursor.setHours(0,0,0,0)
  for (const ts of uniqueDays) {
    const diff = Math.round((cursor.getTime() - ts) / 86400000)
    if (diff <= 1) { streak++; cursor = new Date(ts) } else break
  }
  return streak
})

// Personal Records
const personalRecords = ref(null)
const recordsLoading = ref(false)
const recordsLoaded = ref(false)
const hasAnyRecord = computed(() => personalRecords.value && Object.values(personalRecords.value).some(v => v))

const formatSecondsToTime = (s) => {
  if (!s) return '—'
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${m}:${String(sec).padStart(2,'0')}`
}

const loadPersonalRecords = async () => {
  if (recordsLoaded.value) return
  recordsLoading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/personal-records`, { headers: getAuthHeaders() })
    personalRecords.value = data
    recordsLoaded.value = true
  } catch {
    personalRecords.value = null
  } finally {
    recordsLoading.value = false
  }
}

const switchToRecords = () => {
  tab.value = 'records'
  loadPersonalRecords()
}

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
  if (!profileId.value || profileId.value === 'undefined' || profileId.value === 'null') {
    notFound.value = true
    pageLoading.value = false
    return
  }
  try {
    const { data } = await axios.get(`${API_URL}/users/${profileId.value}`, { headers: getAuthHeaders() })
    profile.value = data
  } catch (err) {
    const status = err.response?.status
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
    activitiesError.value = false
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
    activitiesError.value = false
  } catch {
    activitiesError.value = true
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
  } catch (err) {
    showToast(err.response?.data?.error || 'Failed to load moments.', 'error')
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
    } catch {
      showToast('Could not load follow status.', 'error')
    }
  }
}

const toggleFollow = async () => {
  followLoading.value = true
  try {
    if (following.value) {
      await axios.delete(`${API_URL}/follow/${profileId.value}`, { headers: getAuthHeaders() })
      following.value = false
      profile.value.followerCount = (profile.value.followerCount ?? 0) - 1
    } else {
      await axios.post(`${API_URL}/follow/${profileId.value}`, {}, { headers: getAuthHeaders() })
      following.value = true
      profile.value.followerCount = (profile.value.followerCount ?? 0) + 1
      notificationStore.createNotification({
        type: 'NEW_FOLLOWER',
        targetUserId: profileId.value,
        actorId: user.value?.id,
        actorName: user.value?.displayName
      })
    }
  } catch (err) {
    showToast(err.response?.data?.error || 'Failed to update follow. Try again.', 'error')
  } finally {
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

const loadEvents = async () => {
  eventsLoading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/multisport-events`, { headers: getAuthHeaders() })
    profileEvents.value = Array.isArray(data) ? data : []
    eventsLoaded.value = true
  } catch {
    profileEvents.value = []
  } finally {
    eventsLoading.value = false
  }
}

function switchToEvents() {
  tab.value = 'events'
  if (!eventsLoaded.value) loadEvents()
}

function eventTypeLabel(type) {
  const map = { TRIATHLON: 'Triathlon', DUATHLON: 'Duathlon', AQUABIKE: 'Aquabike', BRICK: 'Brick', STAGE_RACE: 'Stage Race', TRIP: 'Trip', MULTISPORT: 'Multisport', OTHER: 'Event' }
  return map[type] || type
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
  profileEvents.value = []
  eventsLoaded.value = false
  await loadProfile()
  if (!notFound.value && !pageError.value) {
    await Promise.all([loadActivities(), loadFollowStatus()])
    if (isOwnProfile.value) {
      try {
        const { data } = await axios.get(`${API_URL}/users/me/archetype`, { headers: getAuthHeaders() })
        serverArchetype.value = data
      } catch { /* non-critical */ }
    }
  }
}

onMounted(init)
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding-top: var(--page-top);
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}

/* Loading / Error */
.page-loading, .page-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
  color: #5A5348;
  text-align: center;
}
.page-error i { font-size: 5rem; color: #E7DFCE; }
.page-error h2 { font-weight: 900; font-size: 1.8rem; color: #16130F; margin: 0; }

/* ── HERO — Good Record ink ── */
.profile-hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 44px 0 40px;
  border-bottom: 2px solid #16130F;
}
.hero-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* Avatar */
.gr-avatar-wrap {
  width: 88px;
  height: 88px;
  border-radius: 999px;
  border: 2px solid #FBF6EC;
  overflow: hidden;
  flex-shrink: 0;
  background: #EDE5D5;
}
.gr-avatar-img { width: 100%; height: 100%; }

/* Hero info */
.hero-info { flex: 1; min-width: 0; }

.hero-top-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.gr-hero-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 0.9;
  text-transform: uppercase;
  margin: 0;
  animation: rkRise 0.6s ease-out both;
  color: #FBF6EC;
}
.gr-hero-handle {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.76rem;
  font-weight: 500;
  color: rgba(251,246,236,0.6);
  margin-top: 6px;
}
.gr-hero-bio {
  color: rgba(251,246,236,0.75);
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0 0 16px;
  max-width: 460px;
}

/* Archetype badge */
.gr-archetype-badge {
  display: inline-block;
  background: #FFC53D;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 13px;
  transform: rotate(-2deg);
  margin-bottom: 20px;
}

/* 3-cell stat block */
.gr-stat-block {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 2px solid rgba(251,246,236,0.3);
  margin-top: 24px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  animation: rkRise 0.6s ease-out 0.15s both;
}
.gr-stat-cell {
  padding: 20px 24px;
}
.gr-stat-cell--sep { border-left: 2px solid rgba(251,246,236,0.3); }
.gr-stat-cell-lbl {
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(251,246,236,0.55);
  margin-bottom: 8px;
}
.gr-stat-cell-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 800;
  line-height: 0.9;
  color: #FBF6EC;
}
.gr-stat-cell-val--yellow { color: #FFC53D; }

/* Action buttons */
.gr-btn-pill {
  background: #2A55F5;
  color: #fff;
  border: 2px solid #FBF6EC;
  border-radius: 999px;
  padding: 9px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background 0.15s;
}
.gr-btn-pill:hover { background: #1E42D6; text-decoration: none; color: #fff; }
.gr-btn-pill--following { background: rgba(255,255,255,0.15); }
.gr-btn-pill--following:hover { background: rgba(239,68,68,0.3); }
.gr-btn-pill:disabled { opacity: 0.6; cursor: not-allowed; }

/* Legacy btn kept for error/notfound states inside tabs */
.btn {
  border: 2px solid #16130F;
  background: #FBF6EC;
  color: #16130F;
  border-radius: 999px;
  height: 44px;
  padding: 0 20px;
  font-weight: 700;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s;
  text-decoration: none;
}
.btn:hover { background: #E7DFCE; }
.btn-primary { background: #2A55F5; border-color: #2A55F5; color: white; }
.btn-primary:hover:not(:disabled) { background: #1E42D6; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-outline { background: transparent; border-color: #E7DFCE; color: #5A5348; }
.btn-outline:hover { background: rgba(22,19,15,0.05); }
.btn-sm { height: 36px; padding: 0 14px; font-size: 0.85rem; }

/* Content tabs */
.content-tabs-bar {
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
  position: sticky;
  top: var(--nav-h, 64px);
  z-index: 50;
}
.content-tabs {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
}
.ctab {
  padding: 14px 20px;
  border: none;
  background: transparent;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ctab:hover { color: #16130F; }
.ctab.active { color: #2A55F5; border-bottom-color: #2A55F5; }
.ctab-count {
  background: #E7DFCE;
  border: 1px solid #16130F;
  border-radius: 0;
  padding: 1px 7px;
  font-size: 0.6rem;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.ctab.active .ctab-count { background: #2A55F5; color: #fff; border-color: #2A55F5; }

/* Content area */
.content-area {
  max-width: 1000px;
  margin: 0 auto;
  padding: 32px 40px 64px;
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
  border: 2px solid #E7DFCE;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  transition: border-color 0.15s;
}
.act-card:hover { border-color: #16130F; }
.act-sport-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #f9f9f9;
  border-bottom: 1px solid rgba(15,18,16,0.07);
}
.act-sport-icon { font-size: 1.8rem; line-height: 1; }
.act-type-label { font-weight: 900; font-size: 0.88rem; color: #16130F; flex: 1; letter-spacing: -0.01em; }
.act-time {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: #8A8A8A;
}
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
.act-stat-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #8A8A8A;
  margin-bottom: 4px;
}
.act-stat-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-variant-numeric: tabular-nums;
  font-weight: 900;
  font-size: 1rem;
  color: #16130F;
}

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
  border-radius: 0;
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
  border-radius: 0;
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
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: 2px solid #E7DFCE;
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
  width: 40px; height: 40px; border-radius: 999px;
  background: #16130F;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; color: #FBF6EC; font-size: 1rem; flex-shrink: 0;
}
.m-name { font-weight: 800; font-size: 0.92rem; letter-spacing: -0.01em; color: #16130F; }
.m-time {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 500;
  color: #8A8A8A;
}
.moment-song {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  background: #f9f9f9;
  border-radius: 0;
  padding: 14px;
}
.song-icon { font-size: 1.8rem; line-height: 1; }
.song-title { font-weight: 900; font-size: 0.9rem; margin-bottom: 2px; }
.song-artist { font-size: 0.8rem; color: rgba(15,18,16,0.60); margin-bottom: 6px; }
.song-link {
  font-size: 0.78rem;
  font-weight: 700;
  color: #2A55F5;
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
  border-radius: 0;
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
.pbadge-card.earned.tier-bronze { box-shadow: 2px 2px 0 #16130F; border: 2px solid #16130F; }
.pbadge-card.earned.tier-silver { box-shadow: 2px 2px 0 #16130F; border: 2px solid #16130F; }
.pbadge-card.earned.tier-gold { box-shadow: 2px 2px 0 #16130F; border: 2px solid #16130F; }
.pbadge-card.earned.tier-special { box-shadow: 2px 2px 0 #2A55F5; border: 2px solid #2A55F5; }
.pbadge-card:hover:not(.locked) { transform: none; }
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
.pbadge-desc { font-size: 0.75rem; color: rgba(15,18,16,0.50); font-weight: 600; }
.pbadge-tier-pill {
  padding: 2px 9px;
  border-radius: 0;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.ptier-pill-bronze { background: rgba(205,127,50,0.14); color: #CD7F32; }
.ptier-pill-silver { background: rgba(168,169,173,0.18); color: #808285; }
.ptier-pill-gold { background: rgba(255,215,0,0.16); color: #b8930a; }
.ptier-pill-special { background: rgba(124,58,237,0.12); color: #7C3AED; }
.pbadge-status-earned { font-size: 0.72rem; font-weight: 700; color: #2A55F5; }
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

@media (max-width: 768px) {
  /* Horizontally scrollable tabs — no squishing or wrapping */
  .content-tabs {
    padding: 0 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    flex-wrap: nowrap;
  }
  .content-tabs::-webkit-scrollbar { display: none; }
  .ctab {
    flex-shrink: 0;
    padding: 14px 16px;
    font-size: 0.78rem;
    white-space: nowrap;
    gap: 6px;
  }
  /* Hide icons inside tabs — keep text + count only */
  .ctab i { display: none; }
}

@media (max-width: 480px) {
  .gr-avatar-wrap { width: 64px; height: 64px; }
  .gr-hero-name { font-size: 1.8rem; }
  .hero-top-row { flex-direction: column; gap: 12px; }
  .gr-stat-block { grid-template-columns: repeat(3, 1fr); }
  .activities-grid { grid-template-columns: 1fr; }
  .badges-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
}

/* Events tab */
.events-list { display: flex; flex-direction: column; }
.event-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 0; border-bottom: 2px solid #E7DFCE;
  text-decoration: none; color: inherit; gap: 12px;
}
.event-row:hover .event-row-name { color: #2A55F5; }
.event-type-badge {
  display: inline-block; padding: 2px 8px;
  background: #16130F; color: #FBF6EC;
  font-family: 'Spline Sans Mono', ui-monospace, monospace; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  margin-bottom: 4px;
}
.event-row-name { font-size: 0.95rem; font-weight: 700; margin-bottom: 2px; color: #16130F; }
.event-row-meta { font-size: 0.75rem; color: #8A8A8A; }
.event-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.event-row-dist { font-size: 0.9rem; font-weight: 700; }
.event-row-arrow { color: #A0A0A0; font-size: 0.8rem; }

/* ── Archetype Section ── */
.archetype-section {
  background: #16130F;
  border-bottom: 2px solid rgba(251,246,236,0.08);
}
.arch-inner {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px 32px;
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}
.arch-left { flex: 1; min-width: 200px; }
.arch-eyebrow {
  font-size: 0.63rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.40);
  margin-bottom: 6px;
}
.arch-name {
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.arch-tagline {
  font-size: 0.78rem;
  color: rgba(255,255,255,0.55);
  font-style: italic;
}
.arch-right {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.arch-trait-pill {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1px solid rgba(255,255,255,0.20);
  color: rgba(255,255,255,0.75);
}

/* ── Journey Tab ── */
.journey-list {
  display: flex;
  flex-direction: column;
  gap: 0;
}
.journey-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 2px solid #E7DFCE;
}
.journey-row:last-child { border-bottom: none; }
.journey-row-icon {
  width: 44px;
  height: 44px;
  border: 2px solid #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.journey-row-body { flex: 1; }
.journey-row-label {
  font-size: 0.90rem;
  font-weight: 900;
  color: #16130F;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.journey-row-sub {
  font-size: 0.76rem;
  color: #8A8A8A;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
}
.journey-row-date {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  color: #8A8A8A;
  white-space: nowrap;
  flex-shrink: 0;
}

.hero-bio {
  font-size: 0.88rem;
  color: #555;
  margin: 8px 0 4px;
  max-width: 480px;
  line-height: 1.5;
}
.hero-archetype {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0 4px;
  flex-wrap: wrap;
}
.hero-archetype-badge {
  display: inline-block;
  background: #16130F;
  color: #FBF6EC;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 4px 10px;
}
.hero-archetype-tagline {
  font-size: 0.78rem;
  color: #5A5348;
  font-weight: 400;
}
.records-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  padding: 24px;
  max-width: 900px;
}
.pr-card {
  border: 2px solid #E7DFCE;
  background: #fff;
  padding: 20px 16px;
  text-align: center;
}
.pr-card:hover { border-color: #2A55F5; box-shadow: 3px 3px 0 #2A55F5; }
.pr-distance {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8A8A8A;
  margin-bottom: 8px;
}
.pr-time {
  font-size: 1.6rem;
  font-weight: 900;
  color: #2A55F5;
  letter-spacing: -0.02em;
  margin-bottom: 4px;
}
.pr-label {
  font-size: 0.68rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
</style>
