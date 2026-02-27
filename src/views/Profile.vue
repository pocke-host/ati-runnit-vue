<template>
  <main class="profile-page">
    <div v-if="profile" class="profile-content">
      <!-- Cover + Avatar -->
      <div class="profile-cover">
        <div class="cover-art"></div>
        <div class="profile-avatar-wrap">
          <div class="profile-avatar">{{ profile.name[0] }}</div>
          <button v-if="isOwnProfile" class="edit-avatar-btn"><i class="bi bi-camera-fill"></i></button>
        </div>
      </div>

      <div class="container-xxl profile-body">
        <!-- Identity -->
        <div class="identity-row">
          <div>
            <h1>{{ profile.name }}</h1>
            <p class="handle">@{{ profile.username }}</p>
            <p class="bio">{{ profile.bio }}</p>
            <div class="location-row" v-if="profile.location">
              <i class="bi bi-geo-alt-fill"></i> {{ profile.location }}
            </div>
          </div>

          <div class="profile-actions">
            <template v-if="isOwnProfile">
              <router-link to="/settings" class="btn btn-outline-dark">Edit Profile</router-link>
            </template>
            <template v-else>
              <button :class="['btn', isFollowing ? 'btn-outline-dark' : 'btn-primary']" @click="toggleFollow">
                {{ isFollowing ? 'Following' : 'Follow' }}
              </button>
              <button class="btn btn-outline-dark" @click="openDM">Message</button>
            </template>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-num">{{ profile.stats.totalRuns }}</div>
            <div class="stat-lbl">Activities</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ profile.stats.totalKm.toLocaleString() }}</div>
            <div class="stat-lbl">Total km</div>
          </div>
          <div class="stat-item">
            <div class="stat-num">{{ profile.stats.streak }}</div>
            <div class="stat-lbl">Day Streak 🔥</div>
          </div>
          <div class="stat-item clickable" @click="showTab('followers')">
            <div class="stat-num">{{ profile.followers.toLocaleString() }}</div>
            <div class="stat-lbl">Followers</div>
          </div>
          <div class="stat-item clickable" @click="showTab('following')">
            <div class="stat-num">{{ profile.following.toLocaleString() }}</div>
            <div class="stat-lbl">Following</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-row">
          <button v-for="tab in tabs" :key="tab.key" :class="['tab-btn', { active: activeTab === tab.key }]" @click="activeTab = tab.key">
            <i :class="`bi ${tab.icon}`"></i> {{ tab.label }}
          </button>
        </div>

        <!-- Activities Tab -->
        <div v-if="activeTab === 'activities'" class="activities-list">
          <div v-for="activity in profile.recentActivities" :key="activity.id" class="activity-card" @click="$router.push(`/activities/${activity.id}`)">
            <div class="activity-art" :style="{ background: sportGradient(activity.sport) }">
              <i :class="`bi ${sportIcon(activity.sport)}`"></i>
            </div>
            <div class="activity-info">
              <div class="activity-name">{{ activity.name }}</div>
              <div class="activity-date">{{ activity.date }}</div>
              <div class="activity-stats">
                <span>{{ activity.distance }} km</span>
                <span>{{ activity.duration }}</span>
                <span v-if="activity.pace">{{ activity.pace }} /km</span>
              </div>
            </div>
            <i class="bi bi-chevron-right activity-arrow"></i>
          </div>
        </div>

        <!-- Moments Tab -->
        <div v-if="activeTab === 'moments'" class="moments-grid">
          <div v-for="moment in profile.moments" :key="moment.id" class="moment-thumb">
            <div class="moment-img" :style="{ backgroundImage: moment.photoUrl ? `url(${moment.photoUrl})` : 'none' }">
              <div v-if="!moment.photoUrl" class="moment-placeholder"><i class="bi bi-image"></i></div>
            </div>
            <div class="moment-song"><i class="bi bi-music-note"></i> {{ moment.song }}</div>
          </div>
        </div>

        <!-- PR Tab -->
        <div v-if="activeTab === 'prs'" class="prs-list">
          <div v-for="pr in profile.prs" :key="pr.distance" class="pr-card">
            <div class="pr-distance">{{ pr.distance }}</div>
            <div class="pr-time">{{ pr.time }}</div>
            <div class="pr-date">{{ pr.date }}</div>
            <div class="pr-badge"><i class="bi bi-trophy-fill"></i> PR</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="loading-page"><div class="spinner-border text-success"></div></div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const profile = ref(null)
const activeTab = ref('activities')
const isFollowing = ref(false)

const tabs = [
  { key: 'activities', label: 'Activities', icon: 'bi-activity' },
  { key: 'moments', label: 'Moments', icon: 'bi-camera-fill' },
  { key: 'prs', label: 'PRs', icon: 'bi-trophy-fill' },
]

const isOwnProfile = computed(() => {
  const currentUserId = authStore.user?.id
  return route.params.id === 'me' || route.params.id === currentUserId
})

const sportGradient = (sport) => {
  const map = { running: 'linear-gradient(135deg,#2C3726,#5A6B4E)', cycling: 'linear-gradient(135deg,#1e3a8a,#1e40af)', swimming: 'linear-gradient(135deg,#164e63,#0e7490)' }
  return map[sport] || 'linear-gradient(135deg,#374151,#111827)'
}
const sportIcon = (sport) => {
  const map = { running: 'bi-person-walking', cycling: 'bi-bicycle', swimming: 'bi-water', hiking: 'bi-tree-fill' }
  return map[sport] || 'bi-activity'
}

const showTab = (tab) => { activeTab.value = tab }
const toggleFollow = () => { isFollowing.value = !isFollowing.value }
const openDM = () => {}

onMounted(async () => {
  profile.value = {
    name: 'Elena Martinez',
    username: 'elena.runs',
    bio: 'Marathon runner | Chasing the feeling of mile 20 💚 | Boston 2025 🎯',
    location: 'Brooklyn, NY',
    followers: 1842,
    following: 324,
    stats: { totalRuns: 186, totalKm: 2840, streak: 14 },
    recentActivities: [
      { id: 'a1', name: 'Sunday Long Run', sport: 'running', date: 'Today', distance: '22.1', duration: '1h 59m', pace: '5:22' },
      { id: 'a2', name: 'Tempo Tuesday', sport: 'running', date: 'Yesterday', distance: '10.4', duration: '47m', pace: '4:31' },
      { id: 'a3', name: 'Easy Recovery', sport: 'running', date: '2 days ago', distance: '5.2', duration: '29m', pace: '5:35' },
    ],
    moments: [
      { id: 'm1', song: 'Sicko Mode — Travis Scott', photoUrl: '' },
      { id: 'm2', song: 'HUMBLE. — Kendrick Lamar', photoUrl: '' },
      { id: 'm3', song: 'Blinding Lights — The Weeknd', photoUrl: '' },
    ],
    prs: [
      { distance: '5K', time: '20:14', date: 'Mar 2025' },
      { distance: '10K', time: '42:31', date: 'Jan 2025' },
      { distance: 'Half Marathon', time: '1:32:44', date: 'Nov 2024' },
      { distance: 'Marathon', time: '3:22:08', date: 'Oct 2024' },
    ]
  }
})
</script>

<style scoped>
.profile-page { background: #F5F6F3; min-height: 100vh; padding-bottom: 64px; }

.cover-art { height: 200px; background: linear-gradient(135deg, #2C3726, #5A6B4E); }
.profile-avatar-wrap { position: relative; display: inline-block; margin-top: -40px; margin-left: 24px; }
.profile-avatar { width: 80px; height: 80px; border-radius: 50%; background: #C46A2A; color: white; font-size: 2rem; font-weight: 900; display: flex; align-items: center; justify-content: center; border: 4px solid white; }
.edit-avatar-btn { position: absolute; bottom: 0; right: 0; width: 28px; height: 28px; border-radius: 50%; background: white; border: 2px solid rgba(15,18,16,.12); display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: .75rem; }

.profile-body { padding: 0 24px 40px; }
.identity-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; margin-top: 16px; margin-bottom: 24px; }
.identity-row h1 { font-weight: 900; font-size: 1.5rem; margin-bottom: 2px; }
.handle { color: #6b7280; font-size: .9rem; margin-bottom: 8px; }
.bio { font-size: .95rem; color: #374151; margin-bottom: 6px; }
.location-row { font-size: .85rem; color: #9ca3af; display: flex; align-items: center; gap: 4px; }
.profile-actions { display: flex; gap: 8px; flex-shrink: 0; margin-top: 8px; }

.stats-row { display: flex; gap: 0; background: white; border-radius: 16px; border: 1px solid rgba(15,18,16,.08); padding: 16px; margin-bottom: 24px; }
.stat-item { flex: 1; text-align: center; padding: 8px; border-right: 1px solid rgba(15,18,16,.06); }
.stat-item:last-child { border-right: none; }
.stat-item.clickable { cursor: pointer; }
.stat-item.clickable:hover { background: rgba(15,18,16,.03); border-radius: 10px; }
.stat-num { font-weight: 900; font-size: 1.3rem; }
.stat-lbl { font-size: .75rem; color: #9ca3af; font-weight: 600; margin-top: 2px; }

.tabs-row { display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid rgba(15,18,16,.1); }
.tab-btn { padding: 10px 16px; background: none; border: none; border-bottom: 2px solid transparent; font-weight: 700; font-size: .9rem; cursor: pointer; color: #6b7280; display: flex; align-items: center; gap: 6px; transition: all .2s; }
.tab-btn.active { color: #2C3726; border-bottom-color: #2C3726; }

.activities-list { display: flex; flex-direction: column; gap: 10px; }
.activity-card { background: white; border-radius: 14px; border: 1px solid rgba(15,18,16,.08); padding: 14px; display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all .2s; }
.activity-card:hover { box-shadow: 0 4px 16px rgba(15,18,16,.1); }
.activity-art { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.8); font-size: 1.3rem; flex-shrink: 0; }
.activity-info { flex: 1; }
.activity-name { font-weight: 800; font-size: .95rem; }
.activity-date { font-size: .8rem; color: #9ca3af; margin-bottom: 4px; }
.activity-stats { display: flex; gap: 12px; font-size: .82rem; font-weight: 600; color: #6b7280; }
.activity-arrow { color: #d1d5db; }

.moments-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; }
.moment-thumb { aspect-ratio: 1; position: relative; overflow: hidden; border-radius: 8px; cursor: pointer; }
.moment-img { width: 100%; height: 100%; background: #e5e7eb; background-size: cover; background-position: center; }
.moment-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #d1d5db; }
.moment-song { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(transparent, rgba(0,0,0,.7)); padding: 24px 8px 6px; font-size: .7rem; color: white; font-weight: 600; display: flex; align-items: center; gap: 4px; }

.prs-list { display: flex; flex-direction: column; gap: 10px; }
.pr-card { background: white; border-radius: 14px; border: 1px solid rgba(15,18,16,.08); padding: 16px 20px; display: flex; align-items: center; gap: 16px; }
.pr-distance { font-weight: 800; font-size: .95rem; width: 120px; }
.pr-time { font-weight: 900; font-size: 1.3rem; color: #C46A2A; flex: 1; }
.pr-date { font-size: .82rem; color: #9ca3af; }
.pr-badge { background: rgba(245,158,11,.12); color: #b45309; font-size: .75rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; display: flex; align-items: center; gap: 4px; }

.btn { border-radius: 12px; font-weight: 800; padding: 10px 18px; cursor: pointer; border: none; transition: all .2s; font-size: .875rem; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
.btn-primary { background: #C46A2A; color: white; }
.btn-primary:hover { background: #a85722; }
.btn-outline-dark { background: white; border: 1px solid rgba(15,18,16,.2); color: #374151; }

.loading-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; }

@media (max-width: 600px) {
  .identity-row { flex-direction: column; }
  .stats-row { overflow-x: auto; }
  .stat-item { min-width: 70px; }
}
</style>
