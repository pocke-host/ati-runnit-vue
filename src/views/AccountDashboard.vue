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
          <div class="stat-icon-bs"><i class="bi bi-lightning-charge-fill"></i></div>
          <div class="stat-content">
            <div class="stat-label">Total Distance</div>
            <div class="stat-value">{{ formatDistance(totalStats.distance) }}</div>
            <div v-if="monthCompare" :class="['stat-change', monthCompare.startsWith('+') ? 'positive' : 'negative']">{{ monthCompare }}</div>
          </div>
        </div>

        <div class="stat-card stat-card-secondary">
          <div class="stat-icon-bs"><i class="bi bi-clock-fill"></i></div>
          <div class="stat-content">
            <div class="stat-label">Total Time</div>
            <div class="stat-value">{{ totalStats.duration }} <span class="unit">hrs</span></div>
            <div class="stat-change positive">This month</div>
          </div>
        </div>

        <div class="stat-card stat-card-accent">
          <div class="stat-icon-bs"><i class="bi bi-fire"></i></div>
          <div class="stat-content">
            <div class="stat-label">Current Streak</div>
            <div class="stat-value">{{ totalStats.streak }} <span class="unit">days</span></div>
            <div class="stat-change">Keep it going!</div>
          </div>
        </div>

        <div class="stat-card stat-card-info">
          <div class="stat-icon-bs"><i class="bi bi-people-fill"></i></div>
          <div class="stat-content">
            <div class="stat-label">Following</div>
            <div class="stat-value">{{ friendsCount }}</div>
            <div class="stat-change">Friends</div>
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
              <div class="empty-icon"><i class="bi bi-activity" style="font-size:2.5rem;color:var(--r-stone)"></i></div>
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
                <span class="goal-progress-text">{{ formatDistance(monthlyDistanceMeters) }}/{{ isImperial ? '100 mi' : '100 km' }}</span>
              </div>
              <div class="goal-bar">
                <div class="goal-fill" :style="{width: `${Math.min(Math.round(metersToDisplay(monthlyDistanceMeters)), 100)}%`}"></div>
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

    <!-- LOG ACTIVITY MODAL -->
    <div v-if="showActivityModal" class="modal-overlay" @click="closeActivityModal">
      <div class="modal-card modal-large" @click.stop>
        <div class="modal-header">
          <h3>Log Activity</h3>
          <button class="modal-close" @click="closeActivityModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <form @submit.prevent="handleActivitySubmit" class="modal-body">

          <!-- Row 1: Sport + Workout Type -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Sport *</label>
              <select v-model="activityForm.sportType" class="form-control" required>
                <option value="">Choose sport…</option>
                <option value="RUN">🏃 Run</option>
                <option value="BIKE">🚴 Bike</option>
                <option value="SWIM">🏊 Swim</option>
                <option value="HIKE">🥾 Hike</option>
                <option value="WALK">🚶 Walk</option>
                <option value="OTHER">🏋️ Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Workout Type <span class="optional">(optional)</span></label>
              <select v-model="activityForm.workoutType" class="form-control" :disabled="!activityForm.sportType">
                <option value="">Select type…</option>
                <option v-for="wt in workoutTypeOptions" :key="wt" :value="wt">{{ wt }}</option>
              </select>
            </div>
          </div>

          <!-- Title -->
          <div class="form-group">
            <label class="form-label">Title <span class="optional">(optional)</span></label>
            <input v-model="activityForm.title" type="text" class="form-control" placeholder="e.g., Morning Workout" />
          </div>

          <!-- Row 2: Duration -->
          <div class="form-group">
            <label class="form-label">Duration *</label>
            <div class="duration-inputs">
              <div class="duration-field">
                <input v-model.number="activityForm.durationMinutes" type="number" class="form-control" placeholder="0" min="0" required />
                <span class="duration-unit">min</span>
              </div>
              <div class="duration-field">
                <input v-model.number="activityForm.durationSeconds" type="number" class="form-control" placeholder="0" min="0" max="59" />
                <span class="duration-unit">sec</span>
              </div>
            </div>
          </div>

          <!-- Row 3: Distance + Elevation -->
          <div class="form-row-2">
            <div class="form-group">
              <label class="form-label">Distance <span class="optional">({{ distanceLabel }})</span></label>
              <input v-model.number="activityForm.distance" type="number" class="form-control" :placeholder="isImperial ? 'e.g., 3.1' : 'e.g., 5.0'" step="0.01" min="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Elevation Gain <span class="optional">({{ elevationLabel }})</span></label>
              <input v-model.number="activityForm.elevationGain" type="number" class="form-control" :placeholder="isImperial ? 'e.g., 250' : 'e.g., 76'" min="0" />
            </div>
          </div>

          <!-- Row 4: HR + Cadence + Calories -->
          <div class="form-row-3">
            <div class="form-group">
              <label class="form-label">Avg HR <span class="optional">(bpm)</span></label>
              <input v-model.number="activityForm.avgHeartRate" type="number" class="form-control" placeholder="e.g., 152" min="40" max="220" />
            </div>
            <div class="form-group">
              <label class="form-label">Max HR <span class="optional">(bpm)</span></label>
              <input v-model.number="activityForm.maxHeartRate" type="number" class="form-control" placeholder="e.g., 178" min="40" max="220" />
            </div>
            <div class="form-group">
              <label class="form-label">Cadence <span class="optional">(spm)</span></label>
              <input v-model.number="activityForm.cadence" type="number" class="form-control" placeholder="e.g., 172" min="0" />
            </div>
          </div>

          <!-- Calories -->
          <div class="form-group">
            <label class="form-label">Calories <span class="optional">(kcal, optional)</span></label>
            <input v-model.number="activityForm.calories" type="number" class="form-control" placeholder="e.g., 420" min="0" />
          </div>

          <!-- Gear -->
          <div class="form-group">
            <label class="form-label">Gear <span class="optional">(optional)</span></label>
            <input v-model="activityForm.gear" type="text" class="form-control" :placeholder="gearPlaceholder" />
          </div>

          <!-- Notes -->
          <div class="form-group">
            <label class="form-label">Notes <span class="optional">(optional)</span></label>
            <textarea v-model="activityForm.notes" class="form-control" rows="2" placeholder="How did it feel?"></textarea>
          </div>

          <div v-if="activityError" class="alert alert-danger">
            {{ activityError }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeActivityModal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="activityLoading">
              <span v-if="activityLoading" class="spinner-border spinner-border-sm me-2"></span>
              {{ activityLoading ? 'Saving…' : 'Save Activity' }}
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
import { useUnits } from '@/composables/useUnits'
import { usePlanStore } from '@/stores/plan'
import { useAchievementStore } from '@/stores/achievement'
import { usePRStore } from '@/stores/pr'

Chart.register(...registerables)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const router = useRouter()
const authStore = useAuthStore()
const activityStore = useActivityStore()
const momentStore = useMomentStore()
const uploadStore = useUploadStore()
const followStore = useFollowStore()

const { user, subscriptionTier } = storeToRefs(authStore)
const { activities, loading } = storeToRefs(activityStore)
const { uploading: momentLoading, progress: uploadProgress } = storeToRefs(uploadStore)

const planStore = usePlanStore()
const achievementStore = useAchievementStore()
const prStore = usePRStore()
const { activePlan } = storeToRefs(planStore)
const { latestEarned } = storeToRefs(achievementStore)
const { topPRs } = storeToRefs(prStore)
const { formatDistance, formatDuration, formatDurationClock, formatPace, formatElevation, isImperial, distanceLabel, elevationLabel, metersToDisplay } = useUnits()

const showActivityModal = ref(false)
const showMomentModal = ref(false)
const showFriendsModal = ref(false)

const activityForm = ref({
  sportType: '',
  title: '',
  workoutType: '',
  durationMinutes: null,
  durationSeconds: null,
  distance: null,
  gear: '',
  avgHeartRate: null,
  maxHeartRate: null,
  cadence: null,
  elevationGain: null,
  calories: null,
  notes: ''
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

const currentStreak = computed(() => {
  const acts = activities.value || []
  if (!acts.length) return 0

  const uniqueDays = [...new Set(
    acts.map(a => {
      const d = new Date(a.createdAt)
      d.setHours(0, 0, 0, 0)
      return d.getTime()
    })
  )].sort((a, b) => b - a)

  let streak = 0
  let cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  for (const ts of uniqueDays) {
    const diff = Math.round((cursor.getTime() - ts) / (1000 * 60 * 60 * 24))
    if (diff <= 1) {
      streak++
      cursor = new Date(ts)
    } else {
      break
    }
  }
  return streak
})

const monthCompare = computed(() => {
  const acts = activities.value || []
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const thisKm = acts
    .filter(a => new Date(a.createdAt) >= thisMonthStart)
    .reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000

  const lastKm = acts
    .filter(a => {
      const d = new Date(a.createdAt)
      return d >= lastMonthStart && d < thisMonthStart
    })
    .reduce((sum, a) => sum + (a.distanceMeters || 0), 0) / 1000

  if (lastKm === 0) return null
  const pct = Math.round(((thisKm - lastKm) / lastKm) * 100)
  return pct >= 0 ? `+${pct}% vs last month` : `${pct}% vs last month`
})

const weeklyChartData = computed(() => {
  const acts = activities.value || []
  const days = [0, 0, 0, 0, 0, 0, 0] // Mon–Sun

  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)

  acts.forEach(a => {
    const d = new Date(a.createdAt)
    if (d >= monday) {
      const idx = (d.getDay() + 6) % 7
      if (chartView.value === 'distance') {
        days[idx] += metersToDisplay(a.distanceMeters || 0)
      } else {
        days[idx] += (a.durationSeconds || 0) / 60
      }
    }
  })

  return days.map(v => parseFloat(v.toFixed(1)))
})

const totalStats = computed(() => {
  const acts = activities.value || []
  const totalMeters = acts.reduce((sum, a) => sum + (a.distanceMeters || 0), 0)
  const totalDuration = acts.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / 3600

  return {
    distance: totalMeters,
    duration: totalDuration.toFixed(1),
    streak: currentStreak.value,
    activities: acts.length
  }
})

const monthlyDistanceMeters = computed(() => {
  const acts = activities.value || []
  return acts.reduce((sum, a) => sum + (a.distanceMeters || 0), 0)
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
    RUN: '#4A5E3F',
    BIKE: '#1E2B1A',
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

const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

const formatPRValue = (pr) => {
  if (!pr.data) return '—'
  const { id, data: d } = pr
  if (['best_5k', 'best_10k', 'best_half', 'best_marathon'].includes(id)) {
    return formatDurationClock(d.estTime)
  }
  if (id === 'fastest_pace') return formatPace(d.pace / 60)
  if (id === 'most_elevation') return formatElevation(d.elevationMeters)
  return formatDistance(d.distanceMeters)
}

const openActivityModal = () => {
  showActivityModal.value = true
}

const closeActivityModal = () => {
  showActivityModal.value = false
  activityForm.value = {
    sportType: '', title: '', workoutType: '', durationMinutes: null, durationSeconds: null,
    distance: null, gear: '', avgHeartRate: null, maxHeartRate: null,
    cadence: null, elevationGain: null, calories: null, notes: ''
  }
  activityError.value = ''
}

const workoutTypeOptions = computed(() => {
  const s = activityForm.value.sportType
  if (s === 'RUN')  return ['Easy', 'Long Run', 'Tempo', 'Interval', 'Fartlek', 'Race', 'Recovery', 'Trail']
  if (s === 'BIKE') return ['Endurance', 'Hill', 'Interval', 'Race', 'Recovery', 'Commute']
  if (s === 'SWIM') return ['Easy', 'Drill', 'Interval', 'Open Water', 'Race']
  if (s === 'HIKE') return ['Trail', 'Mountain', 'Backpacking', 'Urban']
  if (s === 'WALK') return ['Easy', 'Brisk', 'Trail', 'Race Walk']
  return ['General', 'Strength', 'Cross Training', 'HIIT', 'Flexibility']
})

const gearPlaceholder = computed(() => {
  const s = activityForm.value.sportType
  if (s === 'RUN')  return 'e.g., Nike Vaporfly 3'
  if (s === 'BIKE') return 'e.g., Trek Domane SL 6'
  if (s === 'SWIM') return 'e.g., Speedo Fastskin'
  if (s === 'HIKE') return 'e.g., Salomon X Ultra 4'
  return 'e.g., Equipment name'
})

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
    const f = activityForm.value
    const totalSeconds = (f.durationMinutes || 0) * 60 + (f.durationSeconds || 0)
    const distanceMeters = f.distance
      ? Math.round(f.distance * (isImperial.value ? 1609.34 : 1000))
      : null
    const elevationMeters = f.elevationGain
      ? isImperial.value ? f.elevationGain / 3.28084 : f.elevationGain
      : null

    await activityStore.createActivity({
      sportType: f.sportType,
      title: f.title || null,
      workoutType: f.workoutType || null,
      durationSeconds: totalSeconds,
      distanceMeters,
      gear: f.gear || null,
      avgHeartRate: f.avgHeartRate || null,
      maxHeartRate: f.maxHeartRate || null,
      cadence: f.cadence || null,
      elevationGain: elevationMeters ? Math.round(elevationMeters) : null,
      calories: f.calories || null,
      notes: f.notes || null,
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
        label: chartView.value === 'distance' ? `Distance (${distanceLabel.value})` : 'Duration (min)',
        data: weeklyChartData.value,
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
        borderColor: '#4A5E3F',
        backgroundColor: 'rgba(74, 94, 63, 0.08)',
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointRadius: 5,
        pointBackgroundColor: '#4A5E3F'
      }, {
        label: 'Goal',
        data: [25, 50, 75, 100],
        borderColor: 'rgba(107, 107, 107, 0.40)',
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
    await Promise.all([
      planStore.fetchPlans(),
      achievementStore.fetchAchievements(activities.value),
      prStore.fetchPRs(activities.value)
    ])
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
  border-radius: 0;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  background: transparent;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.15s;
  color: #767676;
}

.friends-tab:hover {
  background: transparent;
  color: #000;
}

.friends-tab.active {
  background: transparent;
  color: #000;
  border-bottom-color: #000;
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
  border: 1px solid #E5E5E5;
  border-radius: 0;
  transition: all 0.2s;
}

.user-card:hover {
  background: rgba(255,255,255,0.95);
  transform: none;
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
  background: #f9f9f9;
  border-radius: 0;
  border: 1px solid #E5E5E5;
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
.dash{--r-olive:#4A5E3F;--r-olive-deep:#1E2B1A;--r-black:#0F1210;--r-stone:#A3A69F;--r-warm-gray:#6B6B6B;--r-offwhite:#FFFFFF;--r-white:#FFFFFF;--r-accent:#B85C20;--r-border:rgba(15,18,16,0.10);--r-shadow-sm:0 2px 12px rgba(15,18,16,0.06);--r-shadow:0 8px 32px rgba(15,18,16,0.10);min-height:100vh;padding-top:90px;background:#fff;font-family:Futura,"Futura PT","Futura Std","Avenir Next",Avenir,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;color:rgba(15,18,16,0.92)}
.loading-screen{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;color:rgba(15,18,16,0.70)}
.wrap{max-width:1400px;margin:0 auto;padding:26px 20px 56px}
.topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:32px}
.brandline{display:flex;align-items:center;gap:10px}
.status-dot{width:10px;height:10px;border-radius:0;background:#000}
.kicker{letter-spacing:.18em;font-weight:900;font-size:.78rem;color:rgba(15,18,16,0.70)}
.top-actions{display:flex;gap:10px;flex-wrap:wrap}
.hero-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px;margin-bottom:32px}
.stat-card{background:#fff;border:1px solid #E5E5E5;border-radius:0;padding:24px;display:flex;gap:18px;align-items:center;box-shadow:none;transition:box-shadow 0.2s,transform 0.2s}
.stat-card:hover{transform:none;box-shadow:none}
.stat-card-primary{border-bottom:1px solid #E5E5E5}
.stat-card-secondary{border-bottom:1px solid #E5E5E5}
.stat-card-accent{border-bottom:1px solid #E5E5E5}
.stat-card-info{border-bottom:1px solid #E5E5E5}
.stat-icon{font-size:2.5rem;line-height:1}
.stat-icon-bs{width:44px;height:44px;border-radius:0;background:#f0f0f0;display:flex;align-items:center;justify-content:center;color:#767676;font-size:1.2rem;flex-shrink:0}
.stat-content{flex:1}
.stat-label{font-size:0.85rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:rgba(15,18,16,0.60);margin-bottom:6px}
.stat-value{font-size:2.2rem;font-weight:900;line-height:1;color:rgba(15,18,16,0.92)}
.stat-value .unit{font-size:1.2rem;font-weight:600;color:rgba(15,18,16,0.50);margin-left:4px}
.stat-change{font-size:0.8rem;font-weight:600;margin-top:6px}
.stat-change.positive{color:#10b981}.stat-change.negative{color:#ef4444}
.dashboard-grid{display:grid;grid-template-columns:1fr 380px;gap:24px}
.charts-section{display:flex;flex-direction:column;gap:24px}
.sidebar-section{display:flex;flex-direction:column;gap:24px}
.chart-card{background:#fff;border:1px solid #E5E5E5;border-radius:0;padding:24px;box-shadow:none}
.chart-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.chart-title{font-size:1.1rem;font-weight:900;margin:0;color:rgba(15,18,16,0.92)}
.chart-tabs{display:flex;gap:8px}
.tab{padding:8px 16px;border-radius:0;border:1px solid #E5E5E5;background:#fff;font-weight:700;font-size:0.85rem;cursor:pointer;transition:all 0.2s}
.tab:hover{background:rgba(255,255,255,0.90)}
.tab.active{background:#000;color:white;border-color:var(--r-black)}
.period-select{padding:8px 12px;border-radius:0;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.80);font-weight:600;font-size:0.85rem}
.chart-body{height:280px;position:relative}
.chart-body-split{display:grid;grid-template-columns:200px 1fr;gap:24px;align-items:center}
.chart-doughnut{position:relative;height:200px}
.chart-legend{display:flex;flex-direction:column;gap:12px}
.legend-item{display:flex;align-items:center;gap:12px}
.legend-color{width:16px;height:16px;border-radius:0}
.legend-text{flex:1}
.legend-label{font-weight:700;font-size:0.9rem}
.legend-value{font-size:0.8rem;color:rgba(15,18,16,0.60)}
.chart-metric{text-align:right}
.metric-value{font-size:1.8rem;font-weight:900;color:#767676}
.metric-label{font-size:0.75rem;color:rgba(15,18,16,0.60);display:block;margin-top:2px}
.profile-card{background:#fff;border:1px solid #E5E5E5;border-radius:0;padding:24px;box-shadow:none}
.profile-header{display:flex;align-items:center;gap:16px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(15,18,16,0.08)}
.avatar-large{width:64px;height:64px;border-radius:50%;background:#000;border:2px solid var(--r-border);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:1.7rem;color:white}
.profile-info{flex:1}
.profile-name{font-weight:900;font-size:1.15rem;margin-bottom:4px}
.profile-email{font-size:0.85rem;color:rgba(15,18,16,0.60)}
.profile-badges{display:flex;gap:10px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(15,18,16,0.08)}
.badge-item{flex:1;padding:12px;background:#f9f9f9;border-radius:0;text-align:center;border:1px solid #E5E5E5}
.badge-icon{font-size:1.5rem;margin-bottom:4px}
.badge-text{font-size:0.75rem;font-weight:700;color:rgba(15,18,16,0.70)}
.profile-prs{margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid rgba(15,18,16,0.08)}
.prs-row-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.prs-label{font-weight:900;font-size:0.85rem;color:rgba(15,18,16,0.80)}
.prs-all-link{font-size:0.8rem;color:#767676;font-weight:700;text-decoration:none}
.prs-all-link:hover{color:#000}
.prs-empty{font-size:0.85rem;color:rgba(15,18,16,0.50);text-align:center;padding:8px}
.prs-list{display:flex;flex-direction:column;gap:8px}
.pr-mini{display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#f9f9f9;border:1px solid #E5E5E5}
.pr-mini-label{font-size:0.8rem;color:rgba(15,18,16,0.60);font-weight:700}
.pr-mini-val{font-size:0.9rem;color:#000;font-weight:900}
.profile-actions{display:flex;flex-direction:column;gap:10px}
.action-btn{padding:14px;border-radius:0;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.70);font-weight:700;font-size:0.9rem;text-align:left;cursor:pointer;transition:all 0.2s;display:flex;align-items:center}
.action-btn:hover{background:rgba(255,255,255,0.95);transform:none}
.action-btn-danger{color:#dc3545;border-color:rgba(220,53,69,0.20)}
.action-btn-danger:hover{background:rgba(220,53,69,0.05)}
.upgrade-banner{margin-top:16px;padding:20px;background:#000;border-radius:0}
.upgrade-label{font-size:0.7rem;font-weight:700;letter-spacing:0.14em;color:rgba(255,255,255,0.55);margin-bottom:8px}
.upgrade-desc{font-size:0.82rem;color:rgba(255,255,255,0.70);margin:0 0 16px;line-height:1.5}
.upgrade-btn{display:inline-block;background:#fff;color:#000;font-weight:700;font-size:0.75rem;letter-spacing:0.10em;text-transform:uppercase;text-decoration:none;padding:10px 20px;border-radius:0;transition:background 0.15s}
.upgrade-btn:hover{background:#e5e5e5}
.manage-sub-link{margin-top:16px;padding:12px 0}
.manage-sub-link a{font-size:0.82rem;color:#767676;text-decoration:none;display:flex;align-items:center;transition:color 0.15s}
.manage-sub-link a:hover{color:#000}
.recent-activities{background:#fff;border:1px solid #E5E5E5;border-radius:0;padding:24px;box-shadow:none}
.section-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.section-title{font-size:1.1rem;font-weight:900;margin:0}
.filters-compact{display:flex;gap:6px;flex-wrap:wrap}
.filter-pill{padding:6px 12px;border-radius:0;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.70);font-weight:700;font-size:0.75rem;cursor:pointer;transition:all 0.2s}
.filter-pill:hover{background:rgba(255,255,255,0.95)}
.filter-pill.active{background:#000;color:white;border-color:var(--r-black)}
.activities-loading{display:flex;align-items:center;gap:12px;justify-content:center;padding:40px;color:rgba(15,18,16,0.60)}
.activities-list{display:flex;flex-direction:column;gap:12px}
.activity-item{display:flex;align-items:center;gap:14px;padding:14px;background:rgba(255,255,255,0.70);border:1px solid rgba(15,18,16,0.08);border-radius:0;transition:all 0.2s}
.activity-item:hover{background:rgba(255,255,255,0.95);transform:none}
.activity-icon{font-size:1.8rem}
.activity-details{flex:1}
.activity-name{font-weight:700;font-size:0.9rem;margin-bottom:3px}
.activity-meta{font-size:0.8rem;color:rgba(15,18,16,0.60)}
.activity-date{font-size:0.8rem;font-weight:600;color:rgba(15,18,16,0.50)}
.activities-empty{text-align:center;padding:40px 20px}
.empty-icon{font-size:3rem;margin-bottom:12px}
.empty-text{font-weight:700;color:rgba(15,18,16,0.60);margin-bottom:12px}
.goals-widget{background:#fff;border:1px solid #E5E5E5;border-radius:0;padding:24px;box-shadow:none}
.goals-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.goals-title{font-size:1.1rem;font-weight:900;margin:0}
.goals-edit{width:32px;height:32px;border-radius:50%;border:1px solid rgba(15,18,16,0.12);background:rgba(255,255,255,0.70);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s}
.goals-edit:hover{background:rgba(255,255,255,0.95)}
.goal-item{margin-bottom:20px}
.goal-item:last-child{margin-bottom:0}
.goal-label{display:flex;justify-content:space-between;margin-bottom:8px;font-weight:700;font-size:0.9rem}
.goal-progress-text{color:rgba(15,18,16,0.60);font-weight:600}
.goal-bar{height:12px;background:rgba(15,18,16,0.08);border-radius:0;overflow:hidden}
.goal-fill{height:100%;background:#000;border-radius:0;transition:width 0.3s}
.btn{border:1px solid #E5E5E5;background:#fff;color:#000;border-radius:0;height:44px;padding:0 16px;font-weight:900;letter-spacing:0.02em;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;transition:all 0.2s}
.btn:hover{transform:translateY(-1px);border-color:rgba(15,18,16,0.18);background:rgba(255,255,255,0.72)}
.btn-primary{background:#000;border-color:var(--r-black);color:#fff}
.btn-primary:hover{background:#2a2a2a;border-color:#2a2a2a}
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
.modal-card{background:#fff;border-radius:0;border:1px solid #E5E5E5;box-shadow:none;max-width:500px;width:100%;max-height:90vh;overflow:auto;animation:slideUp 0.3s ease}
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
.form-control{width:100%;padding:12px 14px;border:1px solid rgba(15,18,16,0.16);border-radius:0;background:rgba(255,255,255,0.70);font-family:inherit;font-size:0.95rem;transition:all 0.2s}
.form-control:focus{outline:none;border-color:#000;box-shadow:none;background:rgba(255,255,255,0.95)}
.upload-area{border:2px dashed rgba(15,18,16,0.20);border-radius:0;padding:60px 20px;text-align:center;cursor:pointer;transition:all 0.3s;background:rgba(255,255,255,0.50)}
.upload-area:hover{border-color:#000;background:#f9f9f9}
.upload-area i{color:rgba(15,18,16,0.30);margin-bottom:12px}
.upload-area p{color:rgba(15,18,16,0.60);margin:0}
.photo-preview{position:relative;border-radius:0;overflow:hidden;border:1px solid rgba(15,18,16,0.12)}
.photo-preview img{width:100%;height:auto;display:block}
.remove-btn{position:absolute;top:12px;right:12px}
.alert{padding:12px 14px;border-radius:0;margin-bottom:16px}
.alert-danger{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.30);color:#991b1b;font-weight:600}
.modal-actions{display:flex;gap:12px;margin-top:24px}
.modal-actions .btn{flex:1}
.form-row-2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.duration-inputs{display:flex;gap:12px}
.duration-field{display:flex;align-items:center;gap:8px;flex:1}
.duration-field .form-control{flex:1}
.duration-unit{font-size:0.85rem;font-weight:700;color:rgba(15,18,16,0.50);white-space:nowrap}
textarea.form-control{resize:vertical;min-height:72px}
@media(max-width:480px){.form-row-2,.form-row-3{grid-template-columns:1fr}}
@media (max-width:1200px){.dashboard-grid{grid-template-columns:1fr}.sidebar-section{grid-template-columns:repeat(auto-fit,minmax(300px,1fr));display:grid}}
@media (max-width:768px){.hero-stats{grid-template-columns:1fr}.topbar{flex-direction:column;align-items:flex-start}.top-actions{width:100%}.top-actions .btn{flex:1}.chart-body-split{grid-template-columns:1fr;gap:20px}.chart-doughnut{height:180px;margin:0 auto}}
</style>