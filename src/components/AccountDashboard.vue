<template>
  <main class="dash">
    <StoriesViewer />
    <!-- Loading State -->
    <div v-if="!user" class="loading-screen">
      <div class="spinner-border text-primary" role="status"></div>
      <p>Loading dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else class="wrap">
      <!-- TOP BAR -->
      <header class="topbar">
        <div class="brandline">
          <div class="status-dot" aria-hidden="true"></div>
          <div class="kicker">RUNNIT // TRAINING HUB</div>
        </div>

        <div class="top-actions">
          <button class="btn btn-ghost" type="button" @click="openActivityModal">
            <i class="bi bi-plus-lg me-2"></i>New Activity
          </button>
          <button class="btn btn-ghost" type="button" @click="openFriendsModal">
            <i class="bi bi-people-fill me-2"></i>Find Friends
          </button>
          <button class="btn btn-primary" type="button" @click="openMomentModal">
            <i class="bi bi-camera-fill me-2"></i>Create Moment
          </button>
        </div>
      </header>

      <!-- HERO STATS -->
      <section class="hero-stats">
        <div class="stat-card stat-card-primary">
          <div class="stat-icon">🏃</div>
          <div class="stat-content">
            <div class="stat-label">Total Distance</div>
            <div class="stat-value">{{ totalStats.distance }} <span class="unit">km</span></div>
            <div class="stat-change positive">+12% vs last month</div>
          </div>
        </div>

        <div class="stat-card stat-card-secondary">
          <div class="stat-icon">⚡</div>
          <div class="stat-content">
            <div class="stat-label">Total Time</div>
            <div class="stat-value">{{ totalStats.duration }} <span class="unit">hrs</span></div>
            <div class="stat-change positive">+8% vs last month</div>
          </div>
        </div>

        <div class="stat-card stat-card-accent">
          <div class="stat-icon">🔥</div>
          <div class="stat-content">
            <div class="stat-label">Current Streak</div>
            <div class="stat-value">{{ totalStats.streak }} <span class="unit">days</span></div>
            <div class="stat-change">Keep it going!</div>
          </div>
        </div>

        <div class="stat-card stat-card-info">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <div class="stat-label">Friends</div>
            <div class="stat-value">{{ friendsCount }}</div>
            <div class="stat-change">Following</div>
          </div>
        </div>
      </section>

      <!-- MAIN GRID -->
      <section class="dashboard-grid">
        <!-- LEFT: Charts -->
        <div class="charts-section">
          <!-- Weekly Activity Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Weekly Activity</h3>
              <div class="chart-tabs">
                <button :class="['tab', {active: chartView === 'distance'}]" @click="chartView = 'distance'">Distance</button>
                <button :class="['tab', {active: chartView === 'duration'}]" @click="chartView = 'duration'">Duration</button>
              </div>
            </div>
            <div class="chart-body">
              <canvas ref="weeklyChart"></canvas>
            </div>
          </div>

          <!-- Activity Breakdown -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Activity Breakdown</h3>
              <select class="period-select" v-model="breakdownPeriod">
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
            <div class="chart-body chart-body-split">
              <div class="chart-doughnut">
                <canvas ref="activityPieChart"></canvas>
              </div>
              <div class="chart-legend">
                <div v-for="sport in sportBreakdown" :key="sport.type" class="legend-item">
                  <div class="legend-color" :style="{background: sport.color}"></div>
                  <div class="legend-text">
                    <div class="legend-label">{{ sport.type }}</div>
                    <div class="legend-value">{{ sport.count }} activities</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Progress Chart -->
          <div class="chart-card">
            <div class="chart-header">
              <h3 class="chart-title">Monthly Progress</h3>
              <div class="chart-metric">
                <span class="metric-value">{{ monthlyGoalProgress }}%</span>
                <span class="metric-label">of goal</span>
              </div>
            </div>
            <div class="chart-body">
              <canvas ref="progressChart"></canvas>
            </div>
          </div>
        </div>

        <!-- RIGHT: Activity Feed & Profile -->
        <div class="sidebar-section">
          <!-- Quick Profile -->
          <aside class="profile-card">
            <div class="profile-header">
              <div class="avatar-large">{{ userInitial }}</div>
              <div class="profile-info">
                <div class="profile-name">{{ user.displayName || 'User' }}</div>
                <div class="profile-email">{{ user.email }}</div>
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
              <div class="badge-item">
                <div class="badge-icon">🏆</div>
                <div class="badge-text">Early Adopter</div>
              </div>
              <div class="badge-item">
                <div class="badge-icon">⚡</div>
                <div class="badge-text">5 Day Streak</div>
              </div>
            </div>

            <div class="profile-actions">
              <button class="action-btn" @click="openActivityModal">
                <i class="bi bi-plus-circle me-2"></i>Log Activity
              </button>
              <button class="action-btn" @click="openFriendsModal">
                <i class="bi bi-people me-2"></i>Find Friends
              </button>
              <button class="action-btn" @click="openMomentModal">
                <i class="bi bi-camera me-2"></i>Share Moment
              </button>
              <button class="action-btn" @click="goToFeed">
                <i class="bi bi-collection me-2"></i>View Feed
              </button>
              <button class="action-btn action-btn-danger" @click="handleLogout">
                <i class="bi bi-box-arrow-right me-2"></i>Logout
              </button>
            </div>
          </aside>

          <!-- Recent Activities -->
          <div class="recent-activities">
            <div class="section-header">
              <h3 class="section-title">Recent Activities</h3>
              <div class="filters-compact">
                <button 
                  v-for="filter in filters" 
                  :key="filter"
                  :class="['filter-pill', { active: activeFilter === filter }]" 
                  @click="activeFilter = filter"
                >
                  {{ filter }}
                </button>
              </div>
            </div>

            <div v-if="loading" class="activities-loading">
              <div class="spinner-border spinner-border-sm"></div>
              <span>Loading...</span>
            </div>

            <div v-else-if="filteredActivities.length" class="activities-list">
              <div 
                v-for="activity in filteredActivities.slice(0, 5)"
                :key="activity.id"
                class="activity-item"
              >
                <div class="activity-icon">{{ getSportIcon(activity.sportType) }}</div>
                <div class="activity-details">
                  <div class="activity-name">{{ activity.sportType }} Activity</div>
                  <div class="activity-meta">
                    {{ formatDuration(activity.durationSeconds) }} • {{ formatDistance(activity.distanceMeters) }}
                  </div>
                </div>
                <div class="activity-date">{{ formatDateShort(activity.createdAt) }}</div>
              </div>
            </div>

            <div v-else class="activities-empty">
              <div class="empty-icon">🏃</div>
              <div class="empty-text">No activities yet</div>
              <button class="btn btn-sm btn-primary mt-2" @click="openActivityModal">Log First Activity</button>
            </div>
          </div>

          <!-- Goals Widget -->
          <div class="goals-widget">
            <div class="goals-header">
              <h3 class="goals-title">This Month's Goals</h3>
              <button class="goals-edit"><i class="bi bi-pencil"></i></button>
            </div>
            <div class="goal-item">
              <div class="goal-label">
                <span>Distance</span>
                <span class="goal-progress-text">{{ monthlyDistance }}/100 km</span>
              </div>
              <div class="goal-bar">
                <div class="goal-fill" :style="{width: `${Math.min(monthlyDistance, 100)}%`}"></div>
              </div>
            </div>
            <div class="goal-item">
              <div class="goal-label">
                <span>Activities</span>
                <span class="goal-progress-text">{{ activities?.length || 0 }}/20</span>
              </div>
              <div class="goal-bar">
                <div class="goal-fill" :style="{width: `${Math.min((activities?.length || 0) * 5, 100)}%`}"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- FIND FRIENDS MODAL -->
    <div v-if="showFriendsModal" class="modal-overlay" @click="closeFriendsModal">
      <div class="modal-card modal-large" @click.stop>
        <div class="modal-header">
          <h3>Find Friends</h3>
          <button class="modal-close" @click="closeFriendsModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Search Bar -->
          <div class="friends-search">
            <div class="search-input-wrapper">
              <i class="bi bi-search search-icon"></i>
              <input 
                v-model="searchQuery" 
                type="text" 
                class="form-control search-input"
                placeholder="Search by name or email..."
                @input="handleSearch"
              />
            </div>
          </div>

          <!-- Tabs -->
          <div class="friends-tabs">
            <button 
              :class="['friends-tab', {active: friendsTab === 'search'}]" 
              @click="friendsTab = 'search'"
            >
              <i class="bi bi-search me-2"></i>Search
            </button>
            <button 
              :class="['friends-tab', {active: friendsTab === 'following'}]" 
              @click="friendsTab = 'following'"
            >
              <i class="bi bi-person-check me-2"></i>Following ({{ friendsCount }})
            </button>
            <button 
              :class="['friends-tab', {active: friendsTab === 'followers'}]" 
              @click="friendsTab = 'followers'"
            >
              <i class="bi bi-people me-2"></i>Followers ({{ followersCount }})
            </button>
          </div>

          <!-- Search Results -->
          <div v-if="friendsTab === 'search'" class="friends-list">
            <div v-if="searchLoading" class="friends-loading">
              <div class="spinner-border spinner-border-sm"></div>
              <span>Searching...</span>
            </div>

            <div v-else-if="searchResults.length" class="user-cards">
              <div v-for="searchUser in searchResults" :key="searchUser.id" class="user-card">
                <div class="user-avatar">{{ searchUser.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
                <div class="user-info">
                  <div class="user-name">{{ searchUser.displayName || 'User' }}</div>
                  <div class="user-email">{{ searchUser.email }}</div>
                </div>
                <button 
                  v-if="!isFollowing(searchUser.id)"
                  class="btn btn-sm btn-primary" 
                  @click="followUser(searchUser.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-plus me-1"></i>Follow
                </button>
                <button 
                  v-else
                  class="btn btn-sm btn-outline" 
                  @click="unfollowUser(searchUser.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-check me-1"></i>Following
                </button>
              </div>
            </div>

            <div v-else-if="searchQuery" class="friends-empty">
              <i class="bi bi-search" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>No users found</p>
            </div>

            <div v-else class="friends-empty">
              <i class="bi bi-people" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>Search for friends by name or email</p>
            </div>
          </div>

          <!-- Following List -->
          <div v-if="friendsTab === 'following'" class="friends-list">
            <div v-if="friendsLoading" class="friends-loading">
              <div class="spinner-border spinner-border-sm"></div>
              <span>Loading...</span>
            </div>

            <div v-else-if="followingList.length" class="user-cards">
              <div v-for="friend in followingList" :key="friend.id" class="user-card">
                <div class="user-avatar">{{ friend.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
                <div class="user-info">
                  <div class="user-name">{{ friend.displayName || 'User' }}</div>
                  <div class="user-stats">{{ friend.followerCount || 0 }} followers</div>
                </div>
                <button 
                  class="btn btn-sm btn-outline" 
                  @click="unfollowUser(friend.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-dash me-1"></i>Unfollow
                </button>
              </div>
            </div>

            <div v-else class="friends-empty">
              <i class="bi bi-people" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>You're not following anyone yet</p>
              <button class="btn btn-sm btn-primary mt-2" @click="friendsTab = 'search'">Find Friends</button>
            </div>
          </div>

          <!-- Followers List -->
          <div v-if="friendsTab === 'followers'" class="friends-list">
            <div v-if="friendsLoading" class="friends-loading">
              <div class="spinner-border spinner-border-sm"></div>
              <span>Loading...</span>
            </div>

            <div v-else-if="followersList.length" class="user-cards">
              <div v-for="follower in followersList" :key="follower.id" class="user-card">
                <div class="user-avatar">{{ follower.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
                <div class="user-info">
                  <div class="user-name">{{ follower.displayName || 'User' }}</div>
                  <div class="user-stats">{{ follower.followingCount || 0 }} following</div>
                </div>
                <button 
                  v-if="!isFollowing(follower.id)"
                  class="btn btn-sm btn-primary" 
                  @click="followUser(follower.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-plus me-1"></i>Follow Back
                </button>
                <button 
                  v-else
                  class="btn btn-sm btn-outline" 
                  @click="unfollowUser(follower.id)"
                  :disabled="followLoading"
                >
                  <i class="bi bi-person-check me-1"></i>Following
                </button>
              </div>
            </div>

            <div v-else class="friends-empty">
              <i class="bi bi-people" style="font-size: 3rem; color: rgba(15,18,16,0.30);"></i>
              <p>No followers yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- LOG ACTIVITY MODAL (keeping existing) -->
    <div v-if="showActivityModal" class="modal-overlay" @click="closeActivityModal">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>Log Activity</h3>
          <button class="modal-close" @click="closeActivityModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="handleActivitySubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">Sport Type *</label>
            <select v-model="activityForm.sportType" class="form-control" required>
              <option value="">Choose sport...</option>
              <option value="RUN">🏃 Run</option>
              <option value="BIKE">🚴 Bike</option>
              <option value="SWIM">🏊 Swim</option>
              <option value="HIKE">🥾 Hike</option>
              <option value="WALK">🚶 Walk</option>
              <option value="OTHER">🏋️ Other</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Duration (minutes) *</label>
            <input 
              v-model.number="activityForm.durationMinutes" 
              type="number" 
              class="form-control"
              placeholder="e.g., 30"
              min="1"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Distance (km) <span class="optional">(optional)</span></label>
            <input 
              v-model.number="activityForm.distanceKm" 
              type="number" 
              class="form-control"
              placeholder="e.g., 5.2"
              step="0.1"
              min="0"
            />
          </div>

          <div v-if="activityError" class="alert alert-danger">
            {{ activityError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeActivityModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="activityLoading">
              <span v-if="activityLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ activityLoading ? 'Saving...' : 'Save Activity' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- CREATE MOMENT MODAL (keeping existing) -->
    <div v-if="showMomentModal" class="modal-overlay" @click="closeMomentModal">
      <div class="modal-card modal-large" @click.stop>
        <div class="modal-header">
          <h3>Create Moment</h3>
          <button class="modal-close" @click="closeMomentModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="handleMomentSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">Photo *</label>
            <div v-if="!photoPreview" class="upload-area" @click="triggerFileInput">
              <i class="bi bi-camera" style="font-size: 48px;"></i>
              <p>Tap to take photo or upload</p>
            </div>
            <div v-else class="photo-preview">
              <img :src="photoPreview" alt="Preview" />
              <button type="button" class="btn btn-sm btn-danger remove-btn" @click="removePhoto">
                <i class="bi bi-x"></i> Remove
              </button>
            </div>
            <input 
              ref="fileInput"
              type="file" 
              accept="image/*" 
              @change="handlePhotoSelect"
              style="display: none"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Song Title *</label>
            <input 
              v-model="momentForm.songTitle" 
              type="text" 
              class="form-control"
              placeholder="What's your workout song?"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Artist *</label>
            <input 
              v-model="momentForm.songArtist" 
              type="text" 
              class="form-control"
              placeholder="Artist name"
              required 
            />
          </div>

          <div class="form-group">
            <label class="form-label">Song Link <span class="optional">(optional)</span></label>
            <input 
              v-model="momentForm.songLink" 
              type="url" 
              class="form-control"
              placeholder="https://spotify.com/..."
            />
          </div>

          <div v-if="momentError" class="alert alert-danger">
            {{ momentError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeMomentModal">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="momentLoading || !photoPreview">
              <span v-if="momentLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ momentLoading ? `Uploading ${uploadProgress}%` : 'Post Moment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useActivityStore } from '@/stores/activity'
import { useMomentStore } from '@/stores/moment'
import { useUploadStore } from '@/stores/upload'
import { useFollowStore } from '@/stores/follow'
import { storeToRefs } from 'pinia'
import { Chart, registerables } from 'chart.js'
import axios from 'axios'

Chart.register(...registerables)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const activityStore = useActivityStore()
const momentStore = useMomentStore()
const uploadStore = useUploadStore()
const followStore = useFollowStore()

const { user } = storeToRefs(authStore)
const { activities, loading } = storeToRefs(activityStore)
const { uploading: momentLoading, progress: uploadProgress } = storeToRefs(uploadStore)

const showActivityModal = ref(false)
const showMomentModal = ref(false)
const showFriendsModal = ref(false)

const activityForm = ref({
  sportType: '',
  durationMinutes: null,
  distanceKm: null
})
const activityLoading = ref(false)
const activityError = ref('')

const momentForm = ref({
  photoUrl: '',
  songTitle: '',
  songArtist: '',
  songLink: ''
})
const photoFile = ref(null)
const photoPreview = ref(null)
const momentError = ref('')
const fileInput = ref(null)

// Friends/Follow state
const friendsTab = ref('search')
const searchQuery = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const followingList = ref([])
const followersList = ref([])
const friendsLoading = ref(false)
const followLoading = ref(false)
const followingIds = ref(new Set())

const filters = ['All', 'Run', 'Bike', 'Swim', 'Hike', 'Walk']
const activeFilter = ref('All')

const chartView = ref('distance')
const breakdownPeriod = ref('month')

// Chart refs
const weeklyChart = ref(null)
const activityPieChart = ref(null)
const progressChart = ref(null)

let weeklyChartInstance = null
let pieChartInstance = null
let progressChartInstance = null

const userInitial = computed(() => {
  return user.value?.displayName?.charAt(0).toUpperCase() || 'U'
})

const totalStats = computed(() => {
  const acts = activities.value || []
  const totalDistance = acts.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000
  const totalDuration = acts.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 3600
  
  return {
    distance: totalDistance.toFixed(1),
    duration: totalDuration.toFixed(1),
    streak: 5,
    activities: acts.length
  }
})

const monthlyDistance = computed(() => {
  const acts = activities.value || []
  return (acts.reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000).toFixed(1)
})

const monthlyGoalProgress = computed(() => {
  return Math.min(Math.round((parseFloat(monthlyDistance.value) / 100) * 100), 100)
})

const sportBreakdown = computed(() => {
  const acts = activities.value || []
  const breakdown = {}
  const colors = {
    RUN: '#C46A2A',
    BIKE: '#5A6B4E',
    SWIM: '#4A9ECC',
    HIKE: '#8B7355',
    WALK: '#A3A69F',
    OTHER: '#6B5B95'
  }
  
  acts.forEach(a => {
    breakdown[a.sportType] = (breakdown[a.sportType] || 0) + 1
  })
  
  return Object.entries(breakdown).map(([type, count]) => ({
    type,
    count,
    color: colors[type] || colors.OTHER
  }))
})

const filteredActivities = computed(() => {
  if (!activities.value) return []
  if (activeFilter.value === 'All') return activities.value
  return activities.value.filter(a => a.sportType === activeFilter.value.toUpperCase())
})

const friendsCount = computed(() => followingList.value.length)
const followersCount = computed(() => followersList.value.length)

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

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}

const formatDistance = (meters) => {
  if (!meters) return '—'
  return `${(meters / 1000).toFixed(2)} km`
}

const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const openActivityModal = () => {
  showActivityModal.value = true
}

const closeActivityModal = () => {
  showActivityModal.value = false
  activityForm.value = { sportType: '', durationMinutes: null, distanceKm: null }
  activityError.value = ''
}

const openMomentModal = () => {
  showMomentModal.value = true
}

const closeMomentModal = () => {
  showMomentModal.value = false
  momentForm.value = { photoUrl: '', songTitle: '', songArtist: '', songLink: '' }
  photoFile.value = null
  photoPreview.value = null
  momentError.value = ''
}

const openFriendsModal = async () => {
  showFriendsModal.value = true
  await loadFollowData()
}

const closeFriendsModal = () => {
  showFriendsModal.value = false
  searchQuery.value = ''
  searchResults.value = []
}

const handleActivitySubmit = async () => {
  activityLoading.value = true
  activityError.value = ''

  try {
    await activityStore.createActivity({
      sportType: activityForm.value.sportType,
      durationSeconds: activityForm.value.durationMinutes * 60,
      distanceMeters: activityForm.value.distanceKm ? Math.round(activityForm.value.distanceKm * 1000) : null
    })

    closeActivityModal()
    await activityStore.fetchActivities()
    updateCharts()
  } catch (err) {
    activityError.value = err.response?.data?.error || 'Failed to create activity'
  } finally {
    activityLoading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handlePhotoSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  photoFile.value = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    photoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removePhoto = () => {
  photoFile.value = null
  photoPreview.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleMomentSubmit = async () => {
  momentError.value = ''

  try {
    momentForm.value.photoUrl = await uploadStore.uploadImage(photoFile.value)
    await momentStore.createMoment(momentForm.value)
    closeMomentModal()
    router.push('/feed')
  } catch (err) {
    momentError.value = err.response?.data?.error || 'Failed to create moment'
  }
}

// Friends/Follow functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchLoading.value = true
  try {
    const { data } = await axios.get(`${API_URL}/users/search?query=${searchQuery.value}`, {
      headers: getAuthHeaders()
    })
    searchResults.value = data.filter(u => u.id !== user.value.id)
  } catch (err) {
    console.error('Search failed:', err)
    searchResults.value = []
  } finally {
    searchLoading.value = false
  }
}

const loadFollowData = async () => {
  friendsLoading.value = true
  try {
    const [followingRes, followersRes] = await Promise.all([
      axios.get(`${API_URL}/follow/following`, { headers: getAuthHeaders() }),
      axios.get(`${API_URL}/follow/followers`, { headers: getAuthHeaders() })
    ])
    
    followingList.value = followingRes.data
    followersList.value = followersRes.data
    followingIds.value = new Set(followingList.value.map(f => f.id))
  } catch (err) {
    console.error('Failed to load follow data:', err)
  } finally {
    friendsLoading.value = false
  }
}

const isFollowing = (userId) => {
  return followingIds.value.has(userId)
}

const followUser = async (userId) => {
  followLoading.value = true
  try {
    await axios.post(`${API_URL}/follow/${userId}`, {}, {
      headers: getAuthHeaders()
    })
    followingIds.value.add(userId)
    await loadFollowData()
  } catch (err) {
    console.error('Follow failed:', err)
  } finally {
    followLoading.value = false
  }
}

const unfollowUser = async (userId) => {
  followLoading.value = true
  try {
    await axios.delete(`${API_URL}/follow/${userId}`, {
      headers: getAuthHeaders()
    })
    followingIds.value.delete(userId)
    await loadFollowData()
  } catch (err) {
    console.error('Unfollow failed:', err)
  } finally {
    followLoading.value = false
  }
}

const goToFeed = () => {
  router.push('/feed')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

// Chart initialization (keeping existing chart code)
const initWeeklyChart = () => {
  if (!weeklyChart.value) return
  
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy()
  }
  
  const ctx = weeklyChart.value.getContext('2d')
  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: chartView.value === 'distance' ? 'Distance (km)' : 'Duration (min)',
        data: [5.2, 0, 7.1, 3.5, 0, 10.2, 8.0],
        backgroundColor: 'rgba(196, 106, 42, 0.8)',
        borderColor: 'rgba(196, 106, 42, 1)',
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { 
          beginAtZero: true,
          grid: { color: 'rgba(15,18,16,0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  })
}

const initPieChart = () => {
  if (!activityPieChart.value) return
  
  if (pieChartInstance) {
    pieChartInstance.destroy()
  }
  
  const ctx = activityPieChart.value.getContext('2d')
  pieChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: sportBreakdown.value.map(s => s.type),
      datasets: [{
        data: sportBreakdown.value.map(s => s.count),
        backgroundColor: sportBreakdown.value.map(s => s.color),
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      cutout: '70%'
    }
  })
}

const initProgressChart = () => {
  if (!progressChart.value) return
  
  if (progressChartInstance) {
    progressChartInstance.destroy()
  }
  
  const ctx = progressChart.value.getContext('2d')
  progressChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [{
        label: 'Distance',
        data: [15, 28, 42, parseFloat(monthlyDistance.value)],
        borderColor: '#5A6B4E',
        backgroundColor: 'rgba(90, 107, 78, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#5A6B4E'
      }, {
        label: 'Goal',
        data: [25, 50, 75, 100],
        borderColor: 'rgba(196, 106, 42, 0.5)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { 
          beginAtZero: true,
          grid: { color: 'rgba(15,18,16,0.05)' }
        },
        x: {
          grid: { display: false }
        }
      }
    }
  })
}

const updateCharts = () => {
  nextTick(() => {
    initWeeklyChart()
    initPieChart()
    initProgressChart()
  })
}

watch(chartView, () => {
  initWeeklyChart()
})

watch(activities, () => {
  updateCharts()
}, { deep: true })

onMounted(async () => {
  try {
    await activityStore.fetchActivities()
    await loadFollowData()
    await nextTick()
    updateCharts()
  } catch (err) {
    console.error('Failed to load data:', err)
  }
})
</script>

<style scoped>
/* ... keeping all existing styles ... */

/* Add new Friends Modal styles */
.friends-search {
  margin-bottom: 24px;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(15,18,16,0.40);
  font-size: 1.1rem;
}

.search-input {
  padding-left: 48px !important;
}

.friends-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(15,18,16,0.10);
  padding-bottom: 16px;
}

.friends-tab {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px 12px 0 0;
  border: none;
  background: transparent;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(15,18,16,0.60);
}

.friends-tab:hover {
  background: rgba(15,18,16,0.05);
  color: rgba(15,18,16,0.80);
}

.friends-tab.active {
  background: var(--r-olive);
  color: white;
}

.friends-list {
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
}

.friends-loading {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(15,18,16,0.60);
}

.friends-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(15,18,16,0.60);
  text-align: center;
}

.friends-empty p {
  margin-top: 12px;
  font-weight: 600;
}

.user-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: rgba(255,255,255,0.70);
  border: 1px solid rgba(15,18,16,0.08);
  border-radius: 14px;
  transition: all 0.2s;
}

.user-card:hover {
  background: rgba(255,255,255,0.95);
  transform: translateX(4px);
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--r-olive), var(--r-olive-deep));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1.2rem;
  color: white;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-email {
  font-size: 0.8rem;
  color: rgba(15,18,16,0.60);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-stats {
  font-size: 0.8rem;
  color: rgba(15,18,16,0.60);
}

.profile-stats-mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(15,18,16,0.08);
}

.stat-mini {
  text-align: center;
  padding: 10px;
  background: rgba(196,106,42,0.05);
  border-radius: 12px;
}

.stat-mini-value {
  font-weight: 900;
  font-size: 1.3rem;
  color: rgba(15,18,16,0.90);
}

.stat-mini-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: rgba(15,18,16,0.60);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

/* Keep all other existing styles */
.dash{--r-olive:#5A6B4E;--r-olive-deep:#2C3726;--r-black:#0F1210;--r-stone:#A3A69F;--r-offwhite:#F5F6F3;--r-white:#FFFFFF;--r-accent:#C46A2A;min-height:100vh;padding-top:90px;background:radial-gradient(900px 420px at 18% 12%,rgba(90,107,78,0.18),rgba(90,107,78,0) 60%),radial-gradient(900px 420px at 85% 20%,rgba(196,106,42,0.10),rgba(196,106,42,0) 60%),var(--r-offwhite);font-family:Futura,"Futura PT","Futura Std","Avenir Next",Avenir,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:rgba(15,18,16,0.92)}
.loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;color:rgba(15,18,16,0.70)}
.wrap{max-width:1400px;margin:0 auto;padding:26px 20px 56px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:32px}
.brandline{display:flex;align-items:center;gap:10px}
.status-dot{width:10px;height:10px;border-radius:999px;background:var(--r-accent);box-shadow:0 0 0 3px rgba(196,106,42,0.22)}
.kicker{letter-spacing:.18em;font-weight:900;font-size:.78rem;color:rgba(15,18,16,0.70)}
.top-actions{display:flex;gap:10px;flex-wrap:wrap}
.hero-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:32px}
.stat-card{background:linear-gradient(135deg,rgba(255,255,255,0.95),rgba(255,255,255,0.85));border:1px solid rgba(15,18,16,0.10);border-radius:20px;padding:24px;display:flex;gap:20px;align-items:center;box-shadow:0 8px 32px rgba(15,18,16,0.08);transition:all 0.3s}
.stat-card:hover{transform:translateY(-4px);box-shadow:0 12px 48px rgba(15,18,16,0.12)}
.stat-card-primary{border-left:4px solid var(--r-accent)}
.stat-card-secondary{border-left:4px solid var(--r-olive)}
.stat-card-accent{border-left:4px solid #f59e0b}
.stat-card-info{border-left:4px solid #3b82f6}
.stat-icon{font-size:3rem;line-height:1}
.stat-content{flex:1}
.stat-label{font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:rgba(15,18,16,0.60);margin-bottom:6px}
.stat-value{font-size:2.2rem;font-weight:900;line-height:1;color:rgba(15,18,16,0.92)}
.stat-value .unit{font-size:1.2rem;font-weight:600;color:rgba(15,18,16,0.50);margin-left:4px}
.stat-change{font-size:0.8rem;font-weight:600;margin-top:6px}
.stat-change.positive{color:#10b981}
.dashboard-grid{display:grid;grid-template-columns:1fr 380px;gap:24px}
.charts-section{display:flex;flex-direction:column;gap:24px}
.sidebar-section{display:flex;flex-direction:column;gap:24px}
.chart-card{background:linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,255,255,0.92));border:1px solid rgba(15,18,16,0.10);border-radius:20px;padding:24px;box-shadow:0 8px 32px rgba(15,18,16,0.08)}
.chart-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.chart-title{font-size:1.1rem;font-weight:900;margin:0;color:rgba(15,18,16,0.92)}
.chart-tabs{display:flex;gap:8px}
.tab{padding:8px 16px;border-radius:8px;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.60);font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s}
.tab:hover{background:rgba(255,255,255,0.90)}
.tab.active{background:var(--r-accent);color:white;border-color:var(--r-accent)}
.period-select{padding:8px 12px;border-radius:8px;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.80);font-weight:600;font-size:0.85rem}
.chart-body{height:280px;position:relative}
.chart-body-split{display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:center}
.chart-doughnut{position:relative;height:200px}
.chart-legend{display:flex;flex-direction:column;gap:12px}
.legend-item{display:flex;align-items:center;gap:12px}
.legend-color{width:16px;height:16px;border-radius:4px}
.legend-text{flex:1}
.legend-label{font-weight:700;font-size:0.9rem}
.legend-value{font-size:0.8rem;color:rgba(15,18,16,0.60)}
.chart-metric{text-align:right}
.metric-value{font-size:1.8rem;font-weight:900;color:var(--r-accent)}
.metric-label{font-size:0.75rem;color:rgba(15,18,16,0.60);display:block;margin-top:2px}
.profile-card{background:linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,255,255,0.92));border:1px solid rgba(15,18,16,0.10);border-radius:20px;padding:24px;box-shadow:0 8px 32px rgba(15,18,16,0.08)}
.profile-header{display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(15,18,16,0.08)}
.avatar-large{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--r-olive),var(--r-olive-deep));border:3px solid rgba(255,255,255,0.80);box-shadow:0 4px 16px rgba(15,18,16,0.15);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:2rem;color:white}
.profile-info{flex:1}
.profile-name{font-weight:900;font-size:1.15rem;margin-bottom:4px}
.profile-email{font-size:0.85rem;color:rgba(15,18,16,0.60)}
.profile-badges{display:flex;gap:10px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(15,18,16,0.08)}
.badge-item{flex:1;padding:12px;background:rgba(196,106,42,0.08);border-radius:12px;text-align:center}
.badge-icon{font-size:1.5rem;margin-bottom:4px}
.badge-text{font-size:0.75rem;font-weight:700;color:rgba(15,18,16,0.70)}
.profile-actions{display:flex;flex-direction:column;gap:10px}
.action-btn{padding:14px;border-radius:12px;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.70);font-weight:700;font-size:0.9rem;text-align:left;cursor:pointer;transition:all 0.2s;display:flex;align-items:center}
.action-btn:hover{background:rgba(255,255,255,0.95);transform:translateX(4px)}
.action-btn-danger{color:#dc3545;border-color:rgba(220,53,69,0.20)}
.action-btn-danger:hover{background:rgba(220,53,69,0.05)}
.recent-activities{background:linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,255,255,0.92));border:1px solid rgba(15,18,16,0.10);border-radius:20px;padding:24px;box-shadow:0 8px 32px rgba(15,18,16,0.08)}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.section-title{font-size:1.1rem;font-weight:900;margin:0}
.filters-compact{display:flex;gap:6px;flex-wrap:wrap}
.filter-pill{padding:6px 12px;border-radius:999px;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.70);font-weight:700;font-size:0.75rem;cursor:pointer;transition:all 0.2s}
.filter-pill:hover{background:rgba(255,255,255,0.95)}
.filter-pill.active{background:var(--r-olive);color:white;border-color:var(--r-olive)}
.activities-loading{display:flex;align-items:center;gap:12px;justify-content:center;padding:40px;color:rgba(15,18,16,0.60)}
.activities-list{display:flex;flex-direction:column;gap:12px}
.activity-item{display:flex;align-items:center;gap:14px;padding:14px;background:rgba(255,255,255,0.70);border:1px solid rgba(15,18,16,0.08);border-radius:12px;transition:all 0.2s}
.activity-item:hover{background:rgba(255,255,255,0.95);transform:translateX(4px)}
.activity-icon{font-size:1.8rem}
.activity-details{flex:1}
.activity-name{font-weight:700;font-size:0.9rem;margin-bottom:3px}
.activity-meta{font-size:0.8rem;color:rgba(15,18,16,0.60)}
.activity-date{font-size:0.8rem;font-weight:600;color:rgba(15,18,16,0.50)}
.activities-empty{text-align:center;padding:40px 20px}
.empty-icon{font-size:3rem;margin-bottom:12px}
.empty-text{font-weight:700;color:rgba(15,18,16,0.60);margin-bottom:12px}
.goals-widget{background:linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,255,255,0.92));border:1px solid rgba(15,18,16,0.10);border-radius:20px;padding:24px;box-shadow:0 8px 32px rgba(15,18,16,0.08)}
.goals-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.goals-title{font-size:1.1rem;font-weight:900;margin:0}
.goals-edit{width:32px;height:32px;border-radius:50%;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.70);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s}
.goals-edit:hover{background:rgba(255,255,255,0.95)}
.goal-item{margin-bottom:20px}
.goal-item:last-child{margin-bottom:0}
.goal-label{display:flex;justify-content:space-between;margin-bottom:8px;font-weight:700;font-size:0.9rem}
.goal-progress-text{color:rgba(15,18,16,0.60);font-weight:600}
.goal-bar{height:12px;background:rgba(15,18,16,0.08);border-radius:999px;overflow:hidden}
.goal-fill{height:100%;background:linear-gradient(90deg,var(--r-accent),#f59e0b);border-radius:999px;transition:width 0.3s}
.btn{border:1px solid rgba(15,18,16,0.14);background:rgba(255,255,255,0.60);color:rgba(15,18,16,0.78);border-radius:14px;height:44px;padding:0 16px;font-weight:900;letter-spacing:0.02em;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all 0.2s}
.btn:hover{transform:translateY(-1px);border-color:rgba(15,18,16,0.18);background:rgba(255,255,255,0.72)}
.btn-primary{background:radial-gradient(700px 220px at 30% 0%,rgba(255,255,255,0.18),rgba(255,255,255,0) 60%),linear-gradient(135deg,var(--r-accent),#a85722);border-color:rgba(15,18,16,0.12);color:rgba(255,255,255,0.96)}
.btn-primary:hover{background:linear-gradient(135deg,#a85722,#914a1e)}
.btn-primary:disabled{opacity:0.6;cursor:not-allowed;transform:none}
.btn-outline{background:rgba(255,255,255,0.50);border-color:rgba(15,18,16,0.16)}
.btn-ghost{background:rgba(255,255,255,0.40);border-color:rgba(15,18,16,0.10)}
.btn-sm{height:36px;padding:0 12px;font-size:0.85rem}
.btn-danger{background:#dc3545;border-color:#dc3545;color:white}
.mt-2{margin-top:8px}
.me-1{margin-right:4px}
.me-2{margin-right:8px}
.modal-overlay{position:fixed;inset:0;background:rgba(15,18,16,0.70);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;animation:fadeIn 0.2s ease}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal-card{background:radial-gradient(700px 220px at 30% 0%,rgba(196,106,42,0.08),rgba(196,106,42,0) 60%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(255,255,255,0.95));border-radius:24px;border:1px solid rgba(15,18,16,0.12);box-shadow:0 20px 60px rgba(15,18,16,0.30);max-width:500px;width:100%;max-height:90vh;overflow:auto;animation:slideUp 0.3s ease}
.modal-large{max-width:600px}
@keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
.modal-header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid rgba(15,18,16,0.10)}
.modal-header h3{font-weight:900;font-size:1.3rem;margin:0}
.modal-close{width:36px;height:36px;border-radius:50%;border:1px solid rgba(15,18,16,0.14);background:rgba(255,255,255,0.60);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s}
.modal-close:hover{background:rgba(255,255,255,0.90);transform:rotate(90deg)}
.modal-body{padding:24px}
.form-group{margin-bottom:20px}
.form-label{display:block;font-weight:900;font-size:0.9rem;margin-bottom:8px;color:rgba(15,18,16,0.80)}
.optional{font-weight:500;font-size:0.85rem;color:rgba(15,18,16,0.50)}
.form-control{width:100%;padding:12px 14px;border:1px solid rgba(15,18,16,0.16);border-radius:12px;background:rgba(255,255,255,0.70);font-family:inherit;font-size:0.95rem;transition:all 0.2s}
.form-control:focus{outline:none;border-color:var(--r-accent);box-shadow:0 0 0 3px rgba(196,106,42,0.12);background:rgba(255,255,255,0.95)}
.upload-area{border:2px dashed rgba(15,18,16,0.20);border-radius:16px;padding:60px 20px;text-align:center;cursor:pointer;transition:all 0.3s;background:rgba(255,255,255,0.50)}
.upload-area:hover{border-color:var(--r-accent);background:rgba(196,106,42,0.08)}
.upload-area i{color:rgba(15,18,16,0.30);margin-bottom:12px}
.upload-area p{color:rgba(15,18,16,0.60);margin:0}
.photo-preview{position:relative;border-radius:16px;overflow:hidden;border:1px solid rgba(15,18,16,0.12)}
.photo-preview img{width:100%;height:auto;display:block}
.remove-btn{position:absolute;top:12px;right:12px}
.alert{padding:12px 14px;border-radius:12px;margin-bottom:16px}
.alert-danger{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.30);color:#991b1b;font-weight:600}
.modal-actions{display:flex;gap:12px;margin-top:24px}
.modal-actions .btn{flex:1}
@media (max-width:1200px){.dashboard-grid{grid-template-columns:1fr}.sidebar-section{grid-template-columns:repeat(auto-fit,minmax(300px,1fr));display:grid}}
@media (max-width:768px){.hero-stats{grid-template-columns:1fr}.topbar{flex-direction:column;align-items:flex-start}.top-actions{width:100%}.top-actions .btn{flex:1}.chart-body-split{grid-template-columns:1fr;gap:20px}.chart-doughnut{height:180px;margin:0 auto}}
</style>