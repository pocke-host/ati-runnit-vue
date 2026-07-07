<template>
  <div class="feed-page">
    <!-- Pull-to-refresh indicator -->
    <div class="ptr-indicator" :style="{ height: feedPullY + 'px', opacity: feedPullY > 0 ? 1 : 0 }" aria-hidden="true">
      <div :class="['ptr-spinner', { spinning: feedRefreshing }]">
        <i class="bi bi-arrow-clockwise"></i>
      </div>
    </div>

    <!-- Editorial Header + Tabs -->
    <div class="feed-header-bar">
      <div class="feed-header-inner">
        <div class="feed-dateline">
          <span class="feed-brand">RUNNIT FEED</span>
          <span class="feed-date-text">{{ feedDateline }}</span>
        </div>
        <div class="feed-controls">
          <div class="feed-tabs">
            <button :class="['feed-tab', {active: activeTab === 'all'}]"      @click="activeTab = 'all'">All</button>
            <button :class="['feed-tab', {active: activeTab === 'following'}]" @click="activeTab = 'following'">Following</button>
            <button :class="['feed-tab', {active: activeTab === 'mine'}]"      @click="activeTab = 'mine'">Mine</button>
          </div>
          <div class="feed-actions">
            <button
              class="feed-action-btn"
              @click="showCreateEvent = true"
              title="Create multisport event"
            ><i class="bi bi-collection-play"></i></button>
            <button
              :class="['feed-action-btn', {active: sortOrder === 'newest'}]"
              @click="sortOrder = 'newest'"
              title="Newest"
            ><i class="bi bi-clock"></i></button>
            <button
              :class="['feed-action-btn', {active: sortOrder === 'popular'}]"
              @click="sortOrder = 'popular'"
              title="Popular"
            ><i class="bi bi-fire"></i></button>
          </div>
        </div>
        <div class="feed-period-bar">
          <button :class="['period-pill', {active: timePeriod === 'week'}]"  @click="timePeriod = 'week'">Past Week</button>
          <button :class="['period-pill', {active: timePeriod === 'month'}]" @click="timePeriod = 'month'">Past Month</button>
          <button :class="['period-pill', {active: timePeriod === 'year'}]"  @click="timePeriod = 'year'">Past Year</button>
          <button :class="['period-pill', {active: timePeriod === 'all'}]"   @click="timePeriod = 'all'">All Time</button>
        </div>
      </div>
    </div>

    <!-- Backend error banner -->
    <div v-if="fetchError" class="feed-error-banner">
      <i class="bi bi-exclamation-triangle me-2"></i>
      Couldn't load feed — the server may be waking up.
      <button class="feed-error-retry" @click="fetchFeed">Retry</button>
    </div>

    <!-- Feed Content -->
    <div class="feed-container">
      <div v-if="loading" class="feed-grid">
        <SkeletonCard v-for="n in 6" :key="n" variant="feed" />
      </div>

      <div v-else-if="sortedFeedItems.length" class="feed-grid">
        <!-- Activity Card -->
        <article
          v-for="(item, itemIndex) in sortedFeedItems"
          :key="item.id + '-' + item.type"
          :class="['feed-card', `feed-card-${item.type}`]"
        >
          <!-- MOMENT CARD -->
          <template v-if="item.type === 'moment'">
            <div class="moment-image" @click="openMoment(item)">
              <img
                :src="item.photoUrl"
                :alt="`${item.user.displayName}'s moment`"
                loading="lazy"
                @error="(e) => e.target.style.display='none'"
              />
              <div class="moment-overlay">
                <div class="moment-stats">
                  <span class="stat-item">
                    <i class="bi bi-heart-fill"></i>
                    {{ getTotalReactions(item) }}
                  </span>
                  <span class="stat-item">
                    <i class="bi bi-chat-fill"></i>
                    {{ item.commentCount || 0 }}
                  </span>
                </div>
              </div>
              <div v-if="item.user?.id === user?.id" class="item-badge">
                <i class="bi bi-person-fill me-1"></i>You
              </div>
              <div class="type-badge moment-badge-type">
                <i class="bi bi-camera-fill"></i>
              </div>
            </div>

            <div class="card-info">
              <div class="card-user">
                <router-link :to="`/profile/${item.user?.id}`" class="avatar-link">
                  <UserAvatar :src="item.user?.avatarUrl" :name="item.user?.displayName || ''" :size="32" />
                </router-link>
                <div class="user-details">
                  <router-link :to="`/profile/${item.user?.id}`" class="user-name-link">
                    <div class="user-name">
                      {{ item.user?.displayName }}
                      <span v-if="item.user?.id === user?.id" class="you-label">(You)</span>
                    </div>
                  </router-link>
                  <div class="card-time">{{ formatTime(item.createdAt) }}</div>
                </div>
              </div>

              <div v-if="item.caption" class="moment-caption">{{ item.caption }}</div>

              <div v-if="item.songTitle" class="moment-song-compact">
                <i class="bi bi-music-note-beamed me-2"></i>
                <div class="song-text">
                  <span class="song-title">{{ item.songTitle }}</span>
                  <span v-if="item.songArtist" class="song-artist">{{ item.songArtist }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- ACTIVITY CARD — Good Record style -->
          <template v-else-if="item.type === 'activity'">
            <router-link :to="`/activities/${item.id}`" class="act-card">

              <!-- User header -->
              <div class="gr-post-top">
                <div class="gr-post-header">
                  <div
                    class="gr-avatar"
                    :style="{
                      background: ['#2A55F5','#16130F','#FFC53D'][(item.user?.displayName?.charCodeAt(0)||65) % 3],
                      color: (item.user?.displayName?.charCodeAt(0)||65) % 3 === 2 ? '#16130F' : '#fff'
                    }"
                  >{{ (item.user?.displayName||'').split(' ').slice(0,2).map(w=>w[0]||'').join('').toUpperCase()||'?' }}</div>
                  <div class="gr-user-info">
                    <div class="gr-user-name">{{ item.user?.displayName }}</div>
                    <div class="gr-user-handle">@{{ item.user?.handle || (item.user?.displayName||'').toLowerCase().replace(/\s+/g,'') }}</div>
                  </div>
                  <div class="gr-timestamp">{{ formatTime(item.createdAt) }}</div>
                </div>

                <!-- Big Shoulders stat row -->
                <div class="gr-stat-row">
                  <div class="gr-stat-block">
                    <div class="gr-stat-num">{{ formatDistance(item.distanceMeters) || '—' }}</div>
                    <div class="gr-stat-lbl">{{ item.name || (item.sportType === 'RUN' ? 'Run' : item.sportType || 'Activity') }}</div>
                  </div>
                  <template v-if="item.durationSeconds && item.distanceMeters">
                    <div class="gr-stat-block gr-stat-block--div">
                      <div class="gr-stat-num">{{ ((s,d) => { const n=s/(d/1000); return `${Math.floor(n/60)}:${String(Math.round(n%60)).padStart(2,'0')}` })(item.durationSeconds, item.distanceMeters) }}</div>
                      <div class="gr-pace-lbl">/KM</div>
                    </div>
                    <div class="gr-stat-block gr-stat-block--div">
                      <div class="gr-stat-num">{{ formatDuration(item.durationSeconds) }}</div>
                      <div class="gr-pace-lbl">Time</div>
                    </div>
                  </template>
                </div>
              </div>

              <!-- Route map card -->
              <div class="gr-route-card">
                <svg viewBox="0 0 600 260" preserveAspectRatio="none" class="gr-route-svg">
                  <path
                    :d="['M40,200 C120,120 160,210 240,140 C320,70 360,160 440,90 C500,40 540,110 560,70','M60,130 C140,60 220,60 300,130 C380,200 460,200 540,130','M50,80 C130,150 200,40 280,120 C360,200 430,90 560,160'][itemIndex % 3]"
                    fill="none" stroke="#2A55F5" stroke-width="4"
                    stroke-dasharray="1000" stroke-dashoffset="1000"
                    class="gr-route-path"
                  ></path>
                  <circle :cx="[560,540,560][itemIndex%3]" :cy="[70,130,160][itemIndex%3]" r="6" fill="#2A55F5"></circle>
                </svg>
              </div>

              <!-- Reaction bar -->
              <div class="gr-reaction-bar" @click.stop>
                <button
                  v-for="rxn in [{type:'LIKE',label:'♥ Like'},{type:'FIRE',label:'Fire'},{type:'CLAP',label:'Clap'}]"
                  :key="rxn.type"
                  :class="['gr-rxn-btn', { 'gr-rxn-btn--active': getActivityReaction(item.id) === rxn.type }]"
                  @click.prevent.stop="toggleActivityReaction(item.id, rxn.type)"
                >{{ rxn.label }}<template v-if="getActivityReactionCount(item.id, rxn.type)"> {{ getActivityReactionCount(item.id, rxn.type) }}</template></button>
              </div>

            </router-link>
          </template>
        </article>
      </div>

      <EmptyState
        v-else-if="activeTab === 'following'"
        icon="bi-people"
        title="No one followed yet"
        message="Follow other athletes to see their workouts and moments here."
      />

      <EmptyState
        v-else-if="activeTab === 'mine'"
        icon="bi-collection"
        title="Nothing logged yet"
        message="Track a workout or share a moment to get started."
        actionLabel="Log Activity"
        actionTo="/track"
      />

      <EmptyState
        v-else
        icon="bi-globe2"
        title="Nothing here yet"
        message="Be the first to log an activity or share a moment!"
      />
    </div>

    <!-- Create Event Modal -->
    <div class="modal-backdrop" v-if="showCreateEvent" @click.self="showCreateEvent = false">
      <div class="modal-box">
        <h2 class="modal-title">Create Multisport Event</h2>
        <CreateEventForm
          @saved="onEventCreated"
          @cancel="showCreateEvent = false"
        />
      </div>
    </div>

    <!-- Full Moment Modal -->
    <div
      v-if="selectedMoment"
      class="moment-modal-overlay"
      role="presentation"
      @click="closeMoment"
    >
      <div class="moment-modal" role="dialog" aria-modal="true" aria-label="View moment" @click.stop>
        <button class="modal-close-btn" @click="closeMoment" aria-label="Close">
          <i class="bi bi-x-lg"></i>
        </button>

        <div class="moment-modal-content">
          <div class="moment-modal-image">
            <img
              :src="selectedMoment.photoUrl"
              :alt="`${selectedMoment.user.displayName}'s moment`"
              @error="(e) => { e.target.parentElement.classList.add('img-error') }"
            />
            <div class="img-error-msg"><i class="bi bi-image me-2"></i>Image unavailable</div>
          </div>

          <div class="moment-modal-sidebar">
            <div class="moment-modal-header">
              <div class="moment-user">
                <UserAvatar :src="selectedMoment.user?.avatarUrl" :name="selectedMoment.user?.displayName || ''" :size="40" />
                <div class="user-details">
                  <div class="user-name">
                    {{ selectedMoment.user.displayName }}
                    <span v-if="selectedMoment.user.id === user?.id" class="you-badge-inline">You</span>
                  </div>
                  <div class="moment-time">{{ formatTimeFull(selectedMoment.createdAt) }}</div>
                </div>
              </div>
              <button 
                v-if="!isFollowing(selectedMoment.user.id) && selectedMoment.user.id !== user?.id"
                class="btn btn-sm btn-primary"
                @click="followUser(selectedMoment.user.id)"
                :disabled="followLoading"
              >
                Follow
              </button>
              <button 
                v-if="selectedMoment.user.id === user?.id"
                class="btn btn-sm btn-danger"
                @click="deleteMoment"
                :disabled="deleteLoading"
              >
                <i class="bi bi-trash me-1"></i>Delete
              </button>
            </div>

            <div v-if="selectedMoment.caption" class="moment-caption-full">{{ selectedMoment.caption }}</div>

            <div v-if="selectedMoment.songTitle" class="moment-song-full">
              <div class="song-icon">🎵</div>
              <div class="song-info">
                <div class="song-title-full">{{ selectedMoment.songTitle }}</div>
                <div v-if="selectedMoment.songArtist" class="song-artist-full">{{ selectedMoment.songArtist }}</div>
                <a
                  v-if="selectedMoment.songLink"
                  :href="selectedMoment.songLink"
                  target="_blank"
                  class="song-link"
                >
                  <i class="bi bi-spotify me-1"></i>Listen on Spotify
                </a>
              </div>
            </div>

            <div class="moment-reactions">
              <button 
                :class="['reaction-btn', {active: userReaction === 'LIKE'}]"
                @click="toggleReaction('LIKE')"
                :disabled="reactionLoading"
              >
                <i class="bi bi-heart-fill"></i>
                <span>{{ reactionCounts.LIKE || 0 }}</span>
              </button>
              <button 
                :class="['reaction-btn', {active: userReaction === 'FIRE'}]"
                @click="toggleReaction('FIRE')"
                :disabled="reactionLoading"
              >
                <i class="bi bi-fire"></i>
                <span>{{ reactionCounts.FIRE || 0 }}</span>
              </button>
              <button 
                :class="['reaction-btn', {active: userReaction === 'CLAP'}]"
                @click="toggleReaction('CLAP')"
                :disabled="reactionLoading"
              >
                👏
                <span>{{ reactionCounts.CLAP || 0 }}</span>
              </button>
            </div>

            <div class="comments-section">
              <div class="comments-header">
                <h4>Comments</h4>
                <span class="comments-count">{{ comments.length }}</span>
              </div>

              <div class="comments-list" ref="commentsList">
                <div v-if="commentsLoading" class="comments-loading">
                  <div class="spinner-border spinner-border-sm"></div>
                </div>

                <div v-else-if="comments.length" class="comments">
                  <div v-for="comment in comments" :key="comment.id" class="comment">
                    <div class="comment-avatar">{{ getUserInitial(comment.user) }}</div>
                    <div class="comment-content">
                      <div class="comment-header">
                        <span class="comment-author">
                          {{ comment.user.displayName }}
                          <span v-if="comment.user.id === user?.id" class="you-label-small">(You)</span>
                        </span>
                        <span class="comment-time">{{ formatTime(comment.createdAt) }}</span>
                      </div>
                      <p class="comment-text">{{ comment.text }}</p>
                    </div>
                  </div>
                </div>

                <div v-else class="comments-empty">
                  <i class="bi bi-chat"></i>
                  <p>No comments yet. Be the first!</p>
                </div>
              </div>

              <form @submit.prevent="addComment" class="comment-form">
                <input 
                  v-model="newComment" 
                  type="text" 
                  class="comment-input"
                  placeholder="Add a comment..."
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
      </div>
    </div>

    <ConfirmModal
      v-model="showDeleteMomentConfirm"
      title="Delete Moment"
      body="This will permanently remove this moment from your feed."
      confirm-label="Delete"
      :danger="true"
      @confirm="doDeleteMoment"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import { useToast } from '@/composables/useToast'
import AppSpinner from '@/components/AppSpinner.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import { useNotificationStore } from '@/stores/notification'
import { useWorkoutClassifier } from '@/composables/useWorkoutClassifier'
import CreateEventForm from '@/components/CreateEventForm.vue'
import { usePullToRefresh } from '@/composables/usePullToRefresh'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { user } = storeToRefs(authStore)
const { formatDistance, formatDuration } = useUnits()
const { classifyActivity } = useWorkoutClassifier()

const feedDateline = computed(() => {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()
})

const activeTab = ref('all')
const timePeriod = ref('all')
const sortOrder = ref('newest')
const loading = ref(false)
const fetchError = ref(false)
const showCreateEvent = ref(false)
const moments = ref([])
const activities = ref([])

const selectedMoment = ref(null)
const comments = ref([])
const commentsLoading = ref(false)
const newComment = ref('')
const commentLoading = ref(false)

const reactionLoading = ref(false)
const userReaction = ref(null)
const reactionCounts = ref({})

const followLoading = ref(false)
const followingIds = ref(new Set())
const { showToast } = useToast()
const deleteLoading = ref(false)
const showDeleteMomentConfirm = ref(false)

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Activity reactions in feed
const activityReactionMap = ref({}) // { [activityId]: { userReaction: null, counts: {LIKE:0, FIRE:0, CLAP:0} } }

const getActivityReaction = (id) => activityReactionMap.value[id]?.userReaction || null
const getActivityReactionCount = (id, type) => activityReactionMap.value[id]?.counts?.[type] || 0

const initActivityReactions = (activity) => {
  if (activityReactionMap.value[activity.id]) return
  activityReactionMap.value[activity.id] = {
    userReaction: activity.userReaction || null,
    counts: activity.reactionCounts || { LIKE: 0, FIRE: 0, CLAP: 0 }
  }
}

const toggleActivityReaction = async (activityId, type) => {
  const current = activityReactionMap.value[activityId] || { userReaction: null, counts: { LIKE: 0, FIRE: 0, CLAP: 0 } }
  const prev = current.userReaction
  try {
    if (prev === type) {
      // Remove reaction
      await axios.delete(`${API_URL}/activities/${activityId}/reactions`, { headers: getAuthHeaders() })
      current.counts[type] = Math.max(0, (current.counts[type] || 0) - 1)
      current.userReaction = null
    } else {
      // Add/change reaction
      await axios.post(`${API_URL}/activities/${activityId}/reactions`, { type }, { headers: getAuthHeaders() })
      if (prev) current.counts[prev] = Math.max(0, (current.counts[prev] || 0) - 1)
      current.counts[type] = (current.counts[type] || 0) + 1
      current.userReaction = type
    }
    activityReactionMap.value[activityId] = { ...current }
  } catch {
    showToast('Failed to save reaction. Please try again.', 'error')
  }
}

// Combine moments and activities into unified feed
const feedItems = computed(() => {
  const momentItems = moments.value
    .filter(m => m && m.id)
    .map(m => ({ ...m, type: 'moment' }))
  const activityItems = activities.value
    .filter(a => a && a.id)
    .map(a => ({ ...a, type: 'activity' }))
  return [...momentItems, ...activityItems]
})

const getTimeCutoff = () => {
  const now = new Date()
  if (timePeriod.value === 'week')  return new Date(now - 7   * 24 * 60 * 60 * 1000)
  if (timePeriod.value === 'month') return new Date(now - 30  * 24 * 60 * 60 * 1000)
  if (timePeriod.value === 'year')  return new Date(now - 365 * 24 * 60 * 60 * 1000)
  return null
}

const sortedFeedItems = computed(() => {
  let filtered = []

  if (activeTab.value === 'all') {
    filtered = feedItems.value
  } else if (activeTab.value === 'activities') {
    filtered = feedItems.value.filter(item => item.type === 'activity')
  } else if (activeTab.value === 'moments') {
    filtered = feedItems.value.filter(item => item.type === 'moment')
  } else if (activeTab.value === 'mine') {
    filtered = feedItems.value.filter(item => item.user?.id === user.value?.id)
  } else if (activeTab.value === 'following') {
    filtered = feedItems.value.filter(item => followingIds.value.has(item.user?.id))
  }

  // Apply time period filter
  const cutoff = getTimeCutoff()
  if (cutoff) {
    filtered = filtered.filter(item => new Date(item.createdAt) >= cutoff)
  }

  if (sortOrder.value === 'newest') {
    return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } else {
    // Sort by popularity (reactions for moments, distance for activities)
    return [...filtered].sort((a, b) => {
      const aScore = a.type === 'moment' ? getTotalReactions(a) : (a.distanceMeters || 0)
      const bScore = b.type === 'moment' ? getTotalReactions(b) : (b.distanceMeters || 0)
      return bScore - aScore
    })
  }
})

const getTotalReactions = (moment) => {
  if (!moment.reactions) return 0
  return Object.values(moment.reactions).reduce((sum, count) => sum + count, 0)
}

const getUserInitial = (user) => {
  return user?.displayName?.charAt(0).toUpperCase() || 'U'
}

const getSportIcon = (sportType) => {
  const icons = {
    RUN: '🏃',
    BIKE: '🚴',
    SWIM: '🏊',
    HIKE: '🥾',
    WALK: '🚶',
    OTHER: '🏋️'
  }
  return icons[sportType] || '🏋️'
}

const getSportGradient = (sportType) => {
  const gradients = {
    RUN:  'linear-gradient(135deg, #0052FF 0%, #003ECC 100%)',
    BIKE: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    SWIM: 'linear-gradient(135deg, #0077B6 0%, #023E8A 100%)',
    HIKE: 'linear-gradient(135deg, #2D6A4F 0%, #1B4332 100%)',
    WALK: 'linear-gradient(135deg, #5A6B4E 0%, #2C3726 100%)',
  }
  return gradients[sportType] || 'linear-gradient(135deg, #333 0%, #111 100%)'
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const formatTimeFull = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const safeFetch = (url) =>
  axios.get(url, { headers: getAuthHeaders(), timeout: 15000 })
    .catch(() => ({ data: [], _failed: true }))

const fetchFeed = async () => {
  loading.value = true
  fetchError.value = false
  try {
    const [momentsRes, activitiesRes, ownActivitiesRes] = await Promise.all([
      safeFetch(`${API_URL}/moments/feed?page=0&size=100`),
      safeFetch(`${API_URL}/activities/feed`),
      safeFetch(`${API_URL}/activities?page=0&size=200`),
    ])

    // If the two critical endpoints both failed, surface an error
    if (ownActivitiesRes._failed && momentsRes._failed) {
      fetchError.value = true
    }

    moments.value = momentsRes.data.content || momentsRes.data || []

    // Merge own activities with friends' activities, deduplicate by ID
    const feedActs = activitiesRes.data.content || activitiesRes.data || []
    const ownActs  = ownActivitiesRes.data.content || ownActivitiesRes.data || []
    const seen = new Set(feedActs.map(a => a.id))
    const merged = [...feedActs]
    for (const a of ownActs) {
      if (!seen.has(a.id)) { seen.add(a.id); merged.push(a) }
    }
    activities.value = merged
    for (const a of merged) initActivityReactions(a)
  } finally {
    loading.value = false
  }
}

const openMoment = async (moment) => {
  selectedMoment.value = moment
  reactionCounts.value = moment.reactions || {}
  userReaction.value = moment.currentUserReaction || null
  await loadComments(moment.id)
  await loadFollowStatus()
}

const closeMoment = () => {
  selectedMoment.value = null
  comments.value = []
  newComment.value = ''
  userReaction.value = null
  reactionCounts.value = {}
}

const loadComments = async (momentId) => {
  commentsLoading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/moments/${momentId}/comments`, {
      headers: getAuthHeaders()
    })
    comments.value = data
  } catch {
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

const addComment = async () => {
  if (!newComment.value.trim() || !selectedMoment.value) return

  commentLoading.value = true
  try {
    const { data } = await axios.post(
      `${API_URL}/moments/${selectedMoment.value.id}/comments`,
      { text: newComment.value.trim() },
      { headers: getAuthHeaders() }
    )
    comments.value.push(data)
    newComment.value = ''
    
    const momentIndex = moments.value.findIndex(m => m.id === selectedMoment.value.id)
    if (momentIndex !== -1) {
      moments.value[momentIndex].commentCount = (moments.value[momentIndex].commentCount || 0) + 1
    }
  } catch {
    showToast('Failed to post comment. Please try again.', 'error')
  } finally {
    commentLoading.value = false
  }
}

const toggleReaction = async (type) => {
  if (!selectedMoment.value || reactionLoading.value) return

  // Snapshot for rollback
  const prevReaction = userReaction.value
  const prevCounts = { ...reactionCounts.value }
  const momentIndex = moments.value.findIndex(m => m.id === selectedMoment.value.id)

  // Optimistic update
  if (userReaction.value === type) {
    reactionCounts.value[type] = (reactionCounts.value[type] || 1) - 1
    userReaction.value = null
  } else {
    if (userReaction.value) {
      reactionCounts.value[userReaction.value] = (reactionCounts.value[userReaction.value] || 1) - 1
    }
    reactionCounts.value[type] = (reactionCounts.value[type] || 0) + 1
    userReaction.value = type
  }
  if (momentIndex !== -1) {
    moments.value[momentIndex].reactions = { ...reactionCounts.value }
    moments.value[momentIndex].currentUserReaction = userReaction.value
  }

  reactionLoading.value = true
  try {
    if (prevReaction === type) {
      await axios.delete(`${API_URL}/moments/${selectedMoment.value.id}/reaction`, { headers: getAuthHeaders() })
    } else {
      await axios.post(`${API_URL}/moments/${selectedMoment.value.id}/reaction`, { type }, { headers: getAuthHeaders() })
    }
  } catch (err) {
    // Rollback
    userReaction.value = prevReaction
    reactionCounts.value = prevCounts
    if (momentIndex !== -1) {
      moments.value[momentIndex].reactions = prevCounts
      moments.value[momentIndex].currentUserReaction = prevReaction
    }
    showToast('Failed to save reaction. Please try again.', 'error')
  } finally {
    reactionLoading.value = false
  }
}

const deleteMoment = () => {
  if (!selectedMoment.value || deleteLoading.value) return
  showDeleteMomentConfirm.value = true
}

const doDeleteMoment = async () => {
  showDeleteMomentConfirm.value = false
  deleteLoading.value = true
  try {
    await axios.delete(`${API_URL}/moments/${selectedMoment.value.id}`, { headers: getAuthHeaders() })
    moments.value = moments.value.filter(m => m.id !== selectedMoment.value.id)
    closeMoment()
    showToast('Moment deleted.', 'info')
  } catch {
    showToast('Failed to delete moment. Try again.', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const loadFollowStatus = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/follow/following`, {
      headers: getAuthHeaders()
    })
    followingIds.value = new Set(data.map(f => f.id))
  } catch {
    // non-critical, follow buttons default to unfollowed state
  }
}

const isFollowing = (userId) => {
  return followingIds.value.has(userId)
}

const followUser = async (userId) => {
  // Optimistic update
  followingIds.value.add(userId)
  followLoading.value = true
  try {
    await axios.post(`${API_URL}/follow/${userId}`, {}, { headers: getAuthHeaders() })
    notificationStore.createNotification({
      type: 'NEW_FOLLOWER',
      targetUserId: userId,
      actorId: user.value?.id,
      actorName: user.value?.displayName
    })
  } catch {
    // Rollback
    followingIds.value.delete(userId)
    showToast('Failed to follow user. Please try again.', 'error')
  } finally {
    followLoading.value = false
  }
}


const handleKeydown = (e) => {
  if (e.key === 'Escape' && selectedMoment.value) closeMoment()
}

function onEventCreated(event) {
  showCreateEvent.value = false
  router.push(`/multisport-events/${event.id}`)
}

const { refreshing: feedRefreshing, pullY: feedPullY } = usePullToRefresh(fetchFeed)

onMounted(() => {
  fetchFeed()
  loadFollowStatus()
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.feed-page {
  min-height: 100vh;
  padding-top: var(--nav-h, 64px);
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}

/* Error banner */
.feed-error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #FFF3CD;
  border-bottom: 2px solid #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 600;
  color: #16130F;
}
.feed-error-retry {
  margin-left: auto;
  padding: 4px 12px;
  border: 2px solid #16130F;
  background: transparent;
  color: #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
}
.feed-error-retry:hover { background: rgba(22,19,15,0.06); }

/* Pull-to-refresh */
.ptr-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: height 0.2s ease, opacity 0.15s ease;
  pointer-events: none;
}
.ptr-spinner { font-size: 1.4rem; color: #0052FF; }
.ptr-spinner.spinning i { animation: ptr-spin 0.7s linear infinite; }
@keyframes ptr-spin { to { transform: rotate(360deg); } }

/* ── HEADER BAR ── */
.feed-header-bar {
  position: fixed;
  top: var(--nav-h, 64px);
  left: 0;
  right: 0;
  z-index: 100;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.feed-header-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}
.feed-dateline {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 10px 0 8px;
  border-bottom: 1px solid #E7DFCE;
}
.feed-brand {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  color: #16130F;
  text-transform: uppercase;
}
.feed-date-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.10em;
  color: #5A5348;
  text-transform: uppercase;
}
.feed-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
}
.feed-tabs { display: flex; gap: 0; }
.feed-tab {
  padding: 8px 20px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.feed-tab:hover { color: #16130F; }
.feed-tab.active { color: #2A55F5; border-bottom-color: #2A55F5; }
.feed-actions { display: flex; gap: 8px; }
.feed-action-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #E7DFCE;
  background: #fff;
  font-size: 1rem;
  color: #5A5348;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s, border-color 0.15s;
}
.feed-action-btn:hover { color: #2A55F5; border-color: #2A55F5; }
.feed-action-btn.active { border-color: #2A55F5; background: #2A55F5; color: #fff; }

.feed-period-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-top: 1px solid #E7DFCE;
}
.period-pill {
  padding: 4px 14px;
  border: 2px solid #E7DFCE;
  background: transparent;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: #5A5348;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.period-pill:hover { color: #16130F; border-color: #16130F; }
.period-pill.active { background: #16130F; color: #FBF6EC; border-color: #16130F; }

.feed-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 182px 24px 60px;
}

.feed-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: #5A5348;
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.feed-card {
  background: #fff;
  border: 2px solid #16130F;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  position: relative;
}

.feed-card:hover { transform: none; }

/* ── GR ACTIVITY CARD ── */
.feed-card-activity { background: #fff; }

.act-card {
  display: block;
  text-decoration: none;
  color: #16130F;
}
.act-card:hover { text-decoration: none; background: rgba(22,19,15,0.01); }

.gr-post-top { padding: 22px 24px 0; }

.gr-post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.gr-avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.76rem;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}
.gr-user-info { flex: 1; min-width: 0; }
.gr-user-name { font-size: 0.92rem; font-weight: 800; color: #16130F; line-height: 1.2; }
.gr-user-handle {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: #8a8a8a;
  margin-top: 1px;
}
.gr-timestamp {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8a8a8a;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Stat row */
.gr-stat-row {
  display: flex;
  align-items: baseline;
  gap: 0;
  margin-bottom: 16px;
  font-variant-numeric: tabular-nums;
}
.gr-stat-block { display: flex; flex-direction: column; }
.gr-stat-block--div {
  border-left: 2px solid #E7DFCE;
  padding-left: 16px;
  margin-left: 16px;
}
.gr-stat-num {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 2rem;
  font-weight: 800;
  line-height: 0.9;
  color: #16130F;
}
.gr-stat-lbl {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #8a8a8a;
  margin-top: 4px;
}
.gr-pace-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8a8a8a;
  margin-top: 6px;
}

/* Route map card */
.gr-route-card {
  width: 100%;
  aspect-ratio: 16/7;
  background: #EDE5D5;
  border-top: 2px solid #16130F;
  position: relative;
  overflow: hidden;
}
.gr-route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.gr-route-path {
  animation: rkDraw 2.4s ease-out 0.15s forwards;
}

/* Reaction bar */
.gr-reaction-bar {
  display: flex;
  border-top: 2px solid #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.gr-rxn-btn {
  flex: 1;
  text-align: center;
  padding: 13px 0;
  border: none;
  border-right: 2px solid #16130F;
  background: transparent;
  color: #5A5348;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  transition: background 0.15s, color 0.15s;
}
.gr-rxn-btn:last-child { border-right: none; }
.gr-rxn-btn--active { background: #2A55F5; color: #fff; }
.gr-rxn-btn:hover:not(.gr-rxn-btn--active) { background: rgba(42,85,245,0.06); color: #2A55F5; }

/* ── MOMENT CARDS ── */
.feed-card-moment .moment-image {
  position: relative;
  width: 100%;
  padding-top: 133%;
  overflow: hidden;
  background: #EDE5D5;
  cursor: pointer;
}

.moment-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.moment-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent 50%);
  opacity: 0;
  transition: opacity 0.3s;
  display: flex;
  align-items: flex-end;
  padding: 20px;
}

.feed-card:hover .moment-overlay {
  opacity: 1;
}

.moment-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  font-weight: 700;
  font-size: 0.95rem;
}

/* (old activity card styles removed — replaced by GR styles above) */

/* Shared Card Info */
.card-info {
  padding: 16px;
}

.card-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  font-size: 1rem;
}

.user-details {
  flex: 1;
}

.avatar-link {
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
}
.avatar-link:hover { opacity: 0.8; }

.user-name-link {
  text-decoration: none;
  color: inherit;
}
.user-name-link:hover .user-name { color: #767676; }

.activity-header-link {
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
}
.activity-header-link:hover { opacity: 0.9; }

.user-name {
  font-weight: 900;
  font-size: 0.95rem;
  color: rgba(15,18,16,0.92);
}

.card-time {
  font-size: 0.8rem;
  color: rgba(15,18,16,0.50);
}

.moment-caption {
  font-size: 0.9rem;
  color: rgba(15,18,16,0.85);
  line-height: 1.5;
  margin-top: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}

.moment-song-compact {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 0;
  border: 1px solid #E5E5E5;
  margin-top: 12px;
}

.moment-song-compact i {
  font-size: 1.2rem;
  color: #767676;
}

.song-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.song-title {
  font-weight: 700;
  font-size: 0.9rem;
  color: rgba(15,18,16,0.92);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 0.8rem;
  color: rgba(15,18,16,0.60);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badges */
.item-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(15,18,16,0.80);
  color: white;
  padding: 6px 12px;
  border-radius: 0;
  font-weight: 700;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
}

.type-badge {
  position: absolute;
  bottom: 12px;
  left: 12px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: none;
  z-index: 2;
}

.moment-badge-type {
  background: #0052FF;
  color: white;
}

.activity-badge-type {
  background: #000;
  color: white;
}

.you-label {
  color: #000;
  font-weight: 700;
  font-size: 0.85rem;
  margin-left: 6px;
}

.you-label-small {
  color: #000;
  font-weight: 700;
  font-size: 0.75rem;
  margin-left: 4px;
}

.you-badge-inline {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0,0,0,0.08);
  color: #000;
  padding: 2px 8px;
  border-radius: 0;
  font-weight: 700;
  font-size: 0.75rem;
  margin-left: 8px;
}

/* Modal styles (keeping all existing modal styles from previous version) */
.moment-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(15,18,16,0.95);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.moment-modal {
  background: rgba(255,255,255,0.98);
  border-radius: 0;
  max-width: 1200px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.95);
  border: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.2rem;
}

.modal-close-btn:hover {
  background: white;
  transform: rotate(90deg);
}

.moment-modal-content {
  display: grid;
  grid-template-columns: 1fr 450px;
  height: 90vh;
}

.moment-modal-image {
  background: rgba(15,18,16,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.moment-modal-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.img-error-msg {
  display: none;
  color: #767676;
  font-size: 0.85rem;
  font-weight: 600;
}
.img-error img { display: none; }
.img-error .img-error-msg { display: flex; align-items: center; }

.moment-modal-sidebar {
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(15,18,16,0.10);
  background: white;
}

.moment-modal-header {
  padding: 24px;
  border-bottom: 1px solid rgba(15,18,16,0.10);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  font-size: 1.2rem;
}

.moment-caption-full {
  padding: 16px 24px;
  font-size: 1rem;
  color: rgba(15,18,16,0.88);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  border-bottom: 1px solid rgba(15,18,16,0.08);
}

.moment-song-full {
  padding: 24px;
  background: rgba(196,106,42,0.05);
  border-bottom: 1px solid rgba(15,18,16,0.10);
  display: flex;
  gap: 16px;
  align-items: center;
}

.song-icon {
  font-size: 2.5rem;
}

.song-info {
  flex: 1;
}

.song-title-full {
  font-weight: 900;
  font-size: 1.1rem;
  color: rgba(15,18,16,0.92);
  margin-bottom: 4px;
}

.song-artist-full {
  font-size: 0.95rem;
  color: rgba(15,18,16,0.60);
  margin-bottom: 8px;
}

.song-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #000;
  font-weight: 700;
  font-size: 0.85rem;
  text-decoration: none;
  transition: opacity 0.2s;
}

.song-link:hover {
  opacity: 0.8;
}

.moment-reactions {
  padding: 24px;
  border-bottom: 1px solid rgba(15,18,16,0.10);
  display: flex;
  gap: 12px;
}

.reaction-btn {
  flex: 1;
  padding: 14px;
  border-radius: 0;
  border: 1px solid #E5E5E5;
  background: rgba(255,255,255,0.70);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 1.3rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-btn:hover {
  background: rgba(255,255,255,0.95);
  transform: none;
}

.reaction-btn.active {
  background: #2A55F5;
  color: white;
  border-color: #2A55F5;
  transform: scale(1.05);
}

.reaction-btn span {
  font-size: 0.9rem;
  font-weight: 700;
}

.comments-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.comments-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(15,18,16,0.10);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comments-header h4 {
  font-weight: 900;
  font-size: 1.1rem;
  margin: 0;
}

.comments-count {
  font-weight: 700;
  color: rgba(15,18,16,0.50);
}

.comments-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.comments-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(15,18,16,0.60);
}

.comments-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(15,18,16,0.50);
  text-align: center;
}

.comments-empty i {
  font-size: 3rem;
  margin-bottom: 12px;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.comment-author {
  font-weight: 900;
  font-size: 0.9rem;
  color: rgba(15,18,16,0.92);
}

.comment-time {
  font-size: 0.75rem;
  color: rgba(15,18,16,0.50);
}

.comment-text {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(15,18,16,0.80);
}

.comment-form {
  padding: 20px 24px;
  border-top: 1px solid rgba(15,18,16,0.10);
  display: flex;
  gap: 12px;
  background: rgba(255,255,255,0.98);
}

.comment-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  background: rgba(255,255,255,0.70);
  font-family: inherit;
  font-size: 0.95rem;
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #000;
  box-shadow: none;
  background: white;
}

.comment-submit {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #000;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1.1rem;
}

.comment-submit:hover:not(:disabled) {
  background: #111;
  transform: scale(1.05);
}

.comment-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn {
  border: 1px solid #E5E5E5;
  background: rgba(255,255,255,0.60);
  color: rgba(15,18,16,0.78);
  border-radius: 0;
  height: 44px;
  padding: 0 20px;
  font-weight: 900;
  letter-spacing: 0.02em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-1px);
  border-color: rgba(15,18,16,0.18);
  background: rgba(255,255,255,0.72);
}

.btn-primary {
  background: #000;
  border-color: rgba(15,18,16,0.12);
  color: white;
}

.btn-primary:hover {
  background: #111;
}

.btn-danger {
  background: #dc3545;
  border-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
  border-color: #bd2130;
}

.btn-sm {
  height: 36px;
  padding: 0 16px;
  font-size: 0.85rem;
}

.me-1 {
  margin-right: 4px;
}

.me-2 {
  margin-right: 8px;
}

.mt-3 {
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .moment-modal-content {
    grid-template-columns: 1fr 380px;
  }
}

@media (max-width: 768px) {
  .feed-header-inner { padding: 0 12px; }
  .feed-container { padding-top: 168px; padding-left: 12px; padding-right: 12px; }
  .feed-tabs { gap: 6px; padding: 0 12px; }

  /* 44px minimum touch target for tabs */
  .feed-tab { min-height: 44px; padding: 12px 16px; font-size: 0.82rem; }

  .feed-header-content { padding: 0 12px; }

  /* Sort buttons — keep inline with tabs, right-aligned */
  .feed-sort {
    position: static;
    margin-top: 8px;
    justify-content: flex-end;
    padding: 0 12px;
  }
  .sort-btn { width: 44px; height: 44px; }

  /* Feed grid: single column */
  .feed-grid { grid-template-columns: 1fr; }

  /* Song metadata font-size bump */
  .song-title { font-size: 1rem; }
  .song-artist { font-size: 0.88rem; }

  /* Comment text readability */
  .comment-author { font-size: 0.95rem; }
  .comment-time { font-size: 0.8rem; }

  /* Moment modal — stack image on top, sidebar below (scrollable) */
  .moment-modal {
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }
  .moment-modal-content {
    grid-template-columns: 1fr;
    grid-template-rows: min(45vw, 300px) 1fr;
    height: auto;
    flex: 1;
  }
  /* Show the image — previously hidden */
  .moment-modal-image {
    display: flex;
    max-height: min(45vw, 300px);
    min-height: 200px;
  }
  .moment-modal-sidebar {
    border-left: none;
    border-top: 1px solid rgba(15,18,16,0.10);
    overflow-y: auto;
  }
}

@media (max-width: 375px) {
  .feed-header-inner { padding: 0 8px; }
  .feed-container { padding: 8px; padding-top: 168px; }
}

.create-event-btn {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border: 1px solid #E5E5E5;
  background: #fff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  font-family: inherit;
  color: #333;
  white-space: nowrap;
}
.create-event-btn:hover { border-color: #000; color: #000; }

.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 16px;
}
.modal-box {
  background: #fff; width: 100%; max-width: 600px;
  padding: 32px; max-height: 90vh; overflow-y: auto;
}
.modal-title {
  font-size: 1.1rem; font-weight: 900; text-transform: uppercase;
  letter-spacing: 0.06em; margin: 0 0 20px;
}

/* (old reaction btn styles removed — replaced by gr-rxn-btn above) */
</style>