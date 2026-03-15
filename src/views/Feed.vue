<template>
  <div class="feed-page">
    <!-- Header -->
    <header class="feed-header">
      <div class="feed-header-content">
        <h1 class="feed-title">Feed</h1>
      </div>
    </header>

    <!-- Tabs -->
    <div class="feed-tabs-wrapper">
      <div class="feed-tabs">
        <button 
          :class="['feed-tab', {active: activeTab === 'all'}]" 
          @click="activeTab = 'all'"
        >
          All
        </button>
        <button 
          :class="['feed-tab', {active: activeTab === 'activities'}]" 
          @click="activeTab = 'activities'"
        >
          Activities
        </button>
        <button 
          :class="['feed-tab', {active: activeTab === 'moments'}]" 
          @click="activeTab = 'moments'"
        >
          Moments
        </button>
        <button
          :class="['feed-tab', {active: activeTab === 'mine'}]"
          @click="activeTab = 'mine'"
        >
          Mine
        </button>
        <button
          :class="['feed-tab', {active: activeTab === 'following'}]"
          @click="activeTab = 'following'"
        >
          Following
        </button>
      </div>

      <div class="feed-sort">
        <button
          class="create-event-btn"
          @click="showCreateEvent = true"
          title="Group activities as a multisport event"
        >
          <i class="bi bi-collection-play me-1"></i>Create Event
        </button>
        <button
          :class="['sort-btn', {active: sortOrder === 'newest'}]"
          @click="sortOrder = 'newest'"
          title="Sort by newest"
        >
          <i class="bi bi-clock"></i>
        </button>
        <button
          :class="['sort-btn', {active: sortOrder === 'popular'}]"
          @click="sortOrder = 'popular'"
          title="Sort by popular"
        >
          <i class="bi bi-fire"></i>
        </button>
      </div>
    </div>

    <!-- Feed Content -->
    <div class="feed-container">
      <AppSpinner v-if="loading" label="Loading feed…" />

      <div v-else-if="sortedFeedItems.length" class="feed-grid">
        <!-- Activity Card -->
        <article 
          v-for="item in sortedFeedItems" 
          :key="item.id + '-' + item.type"
          :class="['feed-card', `feed-card-${item.type}`]"
        >
          <!-- MOMENT CARD -->
          <template v-if="item.type === 'moment'">
            <div class="moment-image" @click="openMoment(item)">
              <img :src="item.photoUrl" :alt="`${item.user.displayName}'s moment`" />
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
              <div v-if="item.user.id === user?.id" class="item-badge">
                <i class="bi bi-person-fill me-1"></i>You
              </div>
              <div class="type-badge moment-badge-type">
                <i class="bi bi-camera-fill"></i>
              </div>
            </div>

            <div class="card-info">
              <div class="card-user">
                <router-link :to="`/profile/${item.user.id}`" class="user-avatar-small avatar-link">{{ getUserInitial(item.user) }}</router-link>
                <div class="user-details">
                  <router-link :to="`/profile/${item.user.id}`" class="user-name-link">
                    <div class="user-name">
                      {{ item.user.displayName }}
                      <span v-if="item.user.id === user?.id" class="you-label">(You)</span>
                    </div>
                  </router-link>
                  <div class="card-time">{{ formatTime(item.createdAt) }}</div>
                </div>
              </div>

              <div class="moment-song-compact">
                <i class="bi bi-music-note-beamed me-2"></i>
                <div class="song-text">
                  <span class="song-title">{{ item.songTitle }}</span>
                  <span class="song-artist">{{ item.songArtist }}</span>
                </div>
              </div>
            </div>
          </template>

          <!-- ACTIVITY CARD -->
          <template v-else-if="item.type === 'activity'">
            <div class="activity-card-content">
              <router-link :to="`/activities/${item.id}`" class="activity-header activity-header-link">
                <div class="activity-icon-large">{{ getSportIcon(item.sportType) }}</div>
                <div v-if="item.user.id === user?.id" class="item-badge">
                  <i class="bi bi-person-fill me-1"></i>You
                </div>
                <div class="type-badge activity-badge-type">
                  <i class="bi bi-activity"></i>
                </div>
              </router-link>

              <div class="activity-stats-grid">
                <div class="activity-stat">
                  <div class="stat-label">Distance</div>
                  <div class="stat-value">{{ formatDistance(item.distanceMeters) }}</div>
                </div>
                <div class="activity-stat">
                  <div class="stat-label">Duration</div>
                  <div class="stat-value">{{ formatDuration(item.durationSeconds) }}</div>
                </div>
                <div class="activity-stat">
                  <div class="stat-label">Type</div>
                  <div class="stat-value">
                    <span
                      v-if="classifyActivity(item)"
                      class="feed-workout-chip"
                      :style="{ background: classifyActivity(item).color }"
                    >{{ classifyActivity(item).label }}</span>
                    <span v-else>{{ item.sportType }}</span>
                  </div>
                </div>
              </div>

              <div class="card-info">
                <div class="card-user">
                  <router-link :to="`/profile/${item.user.id}`" class="user-avatar-small avatar-link">{{ getUserInitial(item.user) }}</router-link>
                  <div class="user-details">
                    <router-link :to="`/profile/${item.user.id}`" class="user-name-link">
                      <div class="user-name">
                        {{ item.user.displayName }}
                        <span v-if="item.user.id === user?.id" class="you-label">(You)</span>
                      </div>
                    </router-link>
                    <div class="card-time">{{ formatTime(item.createdAt) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </article>
      </div>

      <EmptyState
        v-else-if="activeTab === 'following'"
        icon="bi-people"
        title="Nothing here yet"
        message="Follow some athletes to see their workouts."
      />

      <div v-else class="feed-empty">
        <i class="bi bi-collection" style="font-size: 4rem; color: rgba(15,18,16,0.30);"></i>
        <h3>No activity yet</h3>
        <p v-if="activeTab === 'mine'">
          You haven't logged any activities or created moments yet
        </p>
        <p v-else-if="activeTab === 'activities'">
          No activities have been logged yet
        </p>
        <p v-else-if="activeTab === 'moments'">
          No moments have been shared yet
        </p>
        <p v-else>
          Be the first to log an activity or share a moment!
        </p>
        <button class="btn btn-primary mt-3" @click="goToDashboard">
          <i class="bi bi-plus-lg me-2"></i>Get Started
        </button>
      </div>
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
            <img :src="selectedMoment.photoUrl" :alt="`${selectedMoment.user.displayName}'s moment`" />
          </div>

          <div class="moment-modal-sidebar">
            <div class="moment-modal-header">
              <div class="moment-user">
                <div class="user-avatar">{{ getUserInitial(selectedMoment.user) }}</div>
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

            <div class="moment-song-full">
              <div class="song-icon">🎵</div>
              <div class="song-info">
                <div class="song-title-full">{{ selectedMoment.songTitle }}</div>
                <div class="song-artist-full">{{ selectedMoment.songArtist }}</div>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import axios from 'axios'
import { useUnits } from '@/composables/useUnits'
import AppSpinner from '@/components/AppSpinner.vue'
import EmptyState from '@/components/EmptyState.vue'
import { useNotificationStore } from '@/stores/notification'
import { useWorkoutClassifier } from '@/composables/useWorkoutClassifier'
import CreateEventForm from '@/components/CreateEventForm.vue'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { user } = storeToRefs(authStore)
const { formatDistance, formatDuration } = useUnits()
const { classifyActivity } = useWorkoutClassifier()

const activeTab = ref('all')
const sortOrder = ref('newest')
const loading = ref(false)
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
const deleteLoading = ref(false)

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// Combine moments and activities into unified feed
const feedItems = computed(() => {
  const momentItems = moments.value.map(m => ({ ...m, type: 'moment' }))
  const activityItems = activities.value.map(a => ({ ...a, type: 'activity' }))
  return [...momentItems, ...activityItems]
})

const sortedFeedItems = computed(() => {
  let filtered = []
  
  if (activeTab.value === 'all') {
    filtered = feedItems.value
  } else if (activeTab.value === 'activities') {
    filtered = feedItems.value.filter(item => item.type === 'activity')
  } else if (activeTab.value === 'moments') {
    filtered = feedItems.value.filter(item => item.type === 'moment')
  } else if (activeTab.value === 'mine') {
    filtered = feedItems.value.filter(item => item.user.id === user.value?.id)
  } else if (activeTab.value === 'following') {
    filtered = feedItems.value.filter(item => item.user.id !== user.value?.id)
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
  axios.get(url, { headers: getAuthHeaders() }).catch(() => ({ data: [] }))

const fetchFeed = async () => {
  loading.value = true
  try {
    const [momentsRes, activitiesRes, ownActivitiesRes] = await Promise.all([
      safeFetch(`${API_URL}/moments/feed`),
      safeFetch(`${API_URL}/activities/feed`),
      safeFetch(`${API_URL}/activities?page=0&size=30`),
    ])

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
  } catch (err) {
    console.error('Failed to load comments:', err)
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
  } catch (err) {
    console.error('Failed to add comment:', err)
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
      await axios.delete(`${API_URL}/reactions/${selectedMoment.value.id}`, { headers: getAuthHeaders() })
    } else {
      await axios.post(`${API_URL}/reactions/${selectedMoment.value.id}`, { reactionType: type }, { headers: getAuthHeaders() })
    }
  } catch (err) {
    // Rollback
    userReaction.value = prevReaction
    reactionCounts.value = prevCounts
    if (momentIndex !== -1) {
      moments.value[momentIndex].reactions = prevCounts
      moments.value[momentIndex].currentUserReaction = prevReaction
    }
    console.error('Failed to toggle reaction:', err)
  } finally {
    reactionLoading.value = false
  }
}

const deleteMoment = async () => {
  if (!selectedMoment.value || deleteLoading.value) return
  
  if (!confirm('Are you sure you want to delete this moment?')) return

  deleteLoading.value = true
  try {
    await axios.delete(`${API_URL}/moments/${selectedMoment.value.id}`, {
      headers: getAuthHeaders()
    })
    
    moments.value = moments.value.filter(m => m.id !== selectedMoment.value.id)
    closeMoment()
  } catch (err) {
    console.error('Failed to delete moment:', err)
    alert('Failed to delete moment')
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
  } catch (err) {
    console.error('Failed to load follow status:', err)
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
  } catch (err) {
    // Rollback
    followingIds.value.delete(userId)
    console.error('Follow failed:', err)
  } finally {
    followLoading.value = false
  }
}

const goToDashboard = () => {
  router.push('/dashboard')
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && selectedMoment.value) closeMoment()
}

function onEventCreated(event) {
  showCreateEvent.value = false
  router.push(`/multisport-events/${event.id}`)
}

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
  background: #fff;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
}

.feed-header {
  position: fixed;
  top: var(--nav-h, 64px);
  left: 0;
  right: 0;
  z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15,18,16,0.10);
  padding: 16px 0;
}

.feed-header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.feed-title {
  font-weight: 900;
  font-size: 1.5rem;
  margin: 0;
  color: rgba(15,18,16,0.92);
}

.feed-tabs-wrapper {
  position: fixed;
  top: 140px;
  left: 0;
  right: 0;
  z-index: 99;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(15,18,16,0.10);
  padding: 12px 0;
}

.feed-tabs {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  gap: 12px;
}

.feed-tab {
  flex: 1;
  max-width: 180px;
  padding: 12px 20px;
  border-radius: 0;
  border: 1px solid #E5E5E5;
  background: rgba(255,255,255,0.70);
  font-weight: 900;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(15,18,16,0.70);
}

.feed-tab:hover {
  background: rgba(255,255,255,0.90);
  color: rgba(15,18,16,0.90);
}

.feed-tab.active {
  background: var(--r-black, #0F1210);
  color: white;
  border-color: var(--r-black, #0F1210);
}

.feed-sort {
  position: absolute;
  right: 24px;
  top: 12px;
  display: flex;
  gap: 8px;
}

.sort-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid #E5E5E5;
  background: rgba(255,255,255,0.70);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(15,18,16,0.60);
}

.sort-btn:hover {
  background: rgba(255,255,255,0.95);
  color: rgba(15,18,16,0.90);
}

.sort-btn.active {
  background: var(--r-black, #0F1210);
  color: white;
  border-color: var(--r-black, #0F1210);
}

.feed-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 200px 24px 60px;
}

.feed-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  gap: 16px;
  color: rgba(15,18,16,0.60);
}

.feed-empty {
  text-align: center;
  padding: 80px 20px;
  color: rgba(15,18,16,0.60);
}

.feed-empty h3 {
  font-weight: 900;
  font-size: 1.5rem;
  margin: 16px 0 8px;
  color: rgba(15,18,16,0.80);
}

.feed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.feed-card {
  background: #fff;
  border: 1px solid #E5E5E5;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  position: relative;
}

.feed-card:hover {
  transform: none;
}

/* Moment Cards */
.feed-card-moment .moment-image {
  position: relative;
  width: 100%;
  padding-top: 133%;
  overflow: hidden;
  background: rgba(15,18,16,0.05);
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

/* Activity Cards */
.activity-card-content {
  padding: 20px;
}

.activity-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 20px 24px;
  background: #fff;
  border-bottom: 1px solid var(--r-border);
  position: relative;
}

.activity-icon-large {
  font-size: 5rem;
  line-height: 1;
}

.activity-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
  background: rgba(255,255,255,0.60);
  margin: -1px 0 16px;
}

.activity-stat {
  text-align: center;
  padding: 12px;
  background: rgba(255,255,255,0.90);
  border: 1px solid #E5E5E5;
  border-radius: 0;
}

.feed-workout-chip {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: white;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(15,18,16,0.60);
  margin-bottom: 6px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 900;
  color: rgba(15,18,16,0.92);
}

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
  border-radius: 50%;
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
  border-radius: 50%;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  color: white;
  font-size: 1.2rem;
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
  background: #0052FF;
  color: white;
  border-color: #0052FF;
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
  border-radius: 50%;
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
  .feed-header { top: 64px; padding: 10px 0; }
  .feed-tabs-wrapper { top: 112px; padding: 8px 0; }
  .feed-container { padding-top: 168px; padding-left: 12px; padding-right: 12px; }
  .feed-tabs { gap: 6px; padding: 0 12px; }
  .feed-tab { padding: 9px 14px; font-size: 0.82rem; }
  .feed-header-content { padding: 0 12px; }

  .moment-modal-content {
    grid-template-columns: 1fr;
  }

  .moment-modal-image {
    display: none;
  }

  .feed-grid {
    grid-template-columns: 1fr;
  }

  .feed-sort {
    position: static;
    margin-top: 12px;
  }
}

@media (max-width: 375px) {
  .feed-container { padding: 8px; padding-top: 168px; }
  .feed-header { padding: 12px 0; }
  .feed-header-content { padding: 0 8px; }
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
</style>