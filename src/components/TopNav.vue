<!-- src/components/TopNav.vue -->
<template>
  <nav class="navbar">
    <div class="navbar-content">
      <router-link to="/" class="navbar-brand">
        <span class="brand-text">RUNNIT</span>
      </router-link>

      <div class="navbar-menu" v-if="isAuthenticated">
        <router-link to="/dashboard" class="nav-link">
          <i class="bi bi-grid-3x3-gap me-2"></i>Dashboard
        </router-link>
        <router-link to="/feed" class="nav-link">
          <i class="bi bi-collection me-2"></i>Feed
        </router-link>
        <router-link to="/track" class="nav-link nav-link-primary">
          <i class="bi bi-play-circle-fill me-2"></i>Track
        </router-link>
        <router-link to="/devices" class="nav-link">
          <i class="bi bi-smartwatch me-2"></i>Devices
        </router-link>
        <router-link to="/stats" class="nav-link">
          <i class="bi bi-bar-chart-line-fill me-2"></i>Stats
        </router-link>

        <!-- Notification Bell -->
        <div class="notif-wrap" ref="notifRef">
          <button class="nav-icon-btn" @click="toggleNotifDropdown" title="Notifications">
            <i class="bi bi-bell-fill"></i>
            <span v-if="unreadCount > 0" class="notif-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
          </button>

          <div v-if="notifOpen" class="notif-dropdown">
            <div class="notif-header">
              <span class="notif-title">Notifications</span>
              <button v-if="unreadCount > 0" class="notif-mark-all" @click="markAll">
                Mark all read
              </button>
            </div>

            <div v-if="notifLoading" class="notif-loading">
              <div class="spinner-border spinner-border-sm me-2"></div>Loading…
            </div>

            <div v-else-if="notifications.length === 0" class="notif-empty">
              <i class="bi bi-bell"></i>
              <p>No notifications yet</p>
            </div>

            <div v-else class="notif-list">
              <div
                v-for="n in notifications.slice(0, 12)"
                :key="n.id"
                :class="['notif-item', { unread: !n.read }]"
                @click="handleNotifClick(n)"
              >
                <div class="notif-icon-wrap" :class="`notif-icon-${n.type?.toLowerCase()}`">
                  <i :class="notifIcon(n.type)"></i>
                </div>
                <div class="notif-body">
                  <p class="notif-msg">{{ n.message || notifMessage(n) }}</p>
                  <span class="notif-time">{{ formatTime(n.createdAt) }}</span>
                </div>
                <div v-if="!n.read" class="notif-dot"></div>
              </div>
            </div>

            <div v-if="notifications.length > 12" class="notif-footer">
              {{ notifications.length - 12 }} more notifications
            </div>
          </div>
        </div>

        <!-- Profile avatar -->
        <router-link
          v-if="userId"
          :to="`/profile/${userId}`"
          class="nav-avatar"
          :title="`View profile`"
        >
          {{ userInitial }}
        </router-link>

        <button class="nav-link" @click="handleLogout">
          <i class="bi bi-box-arrow-right me-2"></i>Logout
        </button>
      </div>

      <div class="navbar-menu" v-else>
        <router-link to="/features" class="nav-link">Features</router-link>
        <router-link to="/about" class="nav-link">About</router-link>
        <router-link to="/support" class="nav-link">Support</router-link>
        <router-link to="/join-us" class="nav-link">Login</router-link>
        <router-link to="/signup" class="nav-link nav-link-primary">Join Us</router-link>
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" @click="mobileMenuOpen = !mobileMenuOpen" :aria-expanded="mobileMenuOpen">
        <i :class="mobileMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'"></i>
      </button>
    </div>

  </nav>

  <!-- Teleport drawer outside navbar to avoid backdrop-filter stacking context clipping -->
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>
    </Transition>

    <Transition name="drawer-slide">
      <div v-if="mobileMenuOpen" class="mobile-drawer">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <span class="drawer-brand">RUNNIT</span>
          <button class="drawer-close" @click="mobileMenuOpen = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Authenticated links -->
        <template v-if="isAuthenticated">
          <div class="drawer-user" v-if="user">
            <div class="drawer-avatar">{{ userInitial }}</div>
            <div class="drawer-user-info">
              <div class="drawer-user-name">{{ user.displayName }}</div>
              <div class="drawer-user-email">{{ user.email }}</div>
            </div>
          </div>

          <nav class="drawer-nav">
            <router-link to="/dashboard" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-grid-3x3-gap"></i> Dashboard
            </router-link>
            <router-link to="/feed" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-collection"></i> Feed
            </router-link>
            <router-link to="/track" class="drawer-link drawer-link-primary" @click="mobileMenuOpen = false">
              <i class="bi bi-play-circle-fill"></i> Track Activity
            </router-link>
            <router-link to="/stats" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-bar-chart-line-fill"></i> Stats
            </router-link>
            <router-link to="/achievements" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-trophy"></i> Achievements
            </router-link>
            <router-link to="/clubs" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-people"></i> Clubs
            </router-link>
            <router-link to="/challenges" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-flag"></i> Challenges
            </router-link>
            <router-link to="/plans" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-calendar3"></i> Training Plans
            </router-link>
            <router-link to="/devices" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-smartwatch"></i> Devices
            </router-link>
          </nav>

          <div class="drawer-footer">
            <router-link v-if="userId" :to="`/profile/${userId}`" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-person-circle"></i> My Profile
            </router-link>
            <router-link to="/settings" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-gear"></i> Settings
            </router-link>
            <button class="drawer-link drawer-link-danger" @click="handleLogout">
              <i class="bi bi-box-arrow-right"></i> Logout
            </button>
          </div>
        </template>

        <!-- Unauthenticated links -->
        <template v-else>
          <nav class="drawer-nav">
            <router-link to="/features" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-star"></i> Features
            </router-link>
            <router-link to="/about" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-info-circle"></i> About
            </router-link>
            <router-link to="/support" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-question-circle"></i> Support
            </router-link>
          </nav>
          <div class="drawer-footer">
            <router-link to="/join-us" class="drawer-link" @click="mobileMenuOpen = false">
              <i class="bi bi-box-arrow-in-right"></i> Login
            </router-link>
            <router-link to="/signup" class="drawer-link drawer-link-primary" @click="mobileMenuOpen = false">
              <i class="bi bi-person-plus"></i> Join Us
            </router-link>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificationStore()

const { user, isAuthenticated } = storeToRefs(authStore)
const { notifications, unreadCount, loading: notifLoading } = storeToRefs(notifStore)

const mobileMenuOpen = ref(false)
const notifOpen = ref(false)
const notifRef = ref(null)
const userId = computed(() => user.value?.id)
const userInitial = computed(() => user.value?.displayName?.charAt(0).toUpperCase() || '?')

const toggleNotifDropdown = () => {
  notifOpen.value = !notifOpen.value
  if (notifOpen.value) notifStore.fetchNotifications()
}

const markAll = () => {
  notifStore.markAllRead()
}

const notifIcon = (type) => {
  const map = {
    NEW_FOLLOWER: 'bi bi-person-plus-fill',
    REACTION: 'bi bi-heart-fill',
    COMMENT: 'bi bi-chat-fill',
    CLUB_INVITE: 'bi bi-people-fill',
    CHALLENGE: 'bi bi-trophy-fill',
    DEFAULT: 'bi bi-bell-fill'
  }
  return map[type] || map.DEFAULT
}

const notifMessage = (n) => {
  const actor = n.actorName || 'Someone'
  switch (n.type) {
    case 'NEW_FOLLOWER': return `${actor} started following you`
    case 'REACTION': return `${actor} reacted to your moment`
    case 'COMMENT': return `${actor} commented on your moment`
    case 'CLUB_INVITE': return `${actor} invited you to ${n.entityName || 'a club'}`
    case 'CHALLENGE': return `${actor} joined your challenge`
    default: return n.message || 'New notification'
  }
}

const formatTime = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const handleNotifClick = async (n) => {
  if (!n.read) await notifStore.markRead(n.id)
  notifOpen.value = false
  if (n.type === 'NEW_FOLLOWER' && n.actorId) router.push(`/profile/${n.actorId}`)
  else if (n.type === 'REACTION' || n.type === 'COMMENT') router.push('/feed')
  else if (n.type === 'CLUB_INVITE') router.push('/clubs')
}

const handleOutsideClick = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) {
    notifOpen.value = false
  }
}

const handleLogout = () => {
  notifStore.stopPolling()
  authStore.logout()
  mobileMenuOpen.value = false
  router.push('/')
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  if (isAuthenticated.value) {
    notifStore.startPolling(30000)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  notifStore.stopPolling()
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(90, 107, 78, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 24px rgba(15, 18, 16, 0.12);
}

.navbar-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand { text-decoration: none; }
.brand-text {
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 0.05em;
  color: white;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid transparent;
  background: transparent;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}
.nav-link:hover { background: rgba(255, 255, 255, 0.12); color: white; }
.nav-link-primary {
  background: rgba(196, 106, 42, 0.95);
  color: white;
  border-color: rgba(196, 106, 42, 0.95);
}
.nav-link-primary:hover { background: #C46A2A; border-color: #C46A2A; }

/* Notification bell */
.notif-wrap { position: relative; }
.nav-icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.20);
  background: rgba(255,255,255,0.10);
  color: rgba(255,255,255,0.90);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.nav-icon-btn:hover { background: rgba(255,255,255,0.20); color: white; }
.notif-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid rgba(90,107,78,0.85);
  line-height: 1;
}

/* Notification dropdown */
.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 360px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 16px 48px rgba(15,18,16,0.22);
  border: 1px solid rgba(15,18,16,0.10);
  overflow: hidden;
  animation: dropIn 0.2s ease;
  z-index: 2000;
}
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(15,18,16,0.08);
}
.notif-title { font-weight: 900; font-size: 0.95rem; color: rgba(15,18,16,0.90); }
.notif-mark-all {
  font-size: 0.78rem;
  font-weight: 700;
  color: #5A6B4E;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s;
}
.notif-mark-all:hover { background: rgba(90,107,78,0.10); }
.notif-loading {
  display: flex;
  align-items: center;
  padding: 24px 20px;
  font-size: 0.88rem;
  color: rgba(15,18,16,0.55);
}
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: rgba(15,18,16,0.45);
  text-align: center;
}
.notif-empty i { font-size: 2.5rem; margin-bottom: 10px; }
.notif-empty p { margin: 0; font-weight: 700; font-size: 0.88rem; }
.notif-list { max-height: 380px; overflow-y: auto; }
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(15,18,16,0.05);
  position: relative;
}
.notif-item:hover { background: rgba(15,18,16,0.03); }
.notif-item.unread { background: rgba(90,107,78,0.04); }
.notif-item.unread:hover { background: rgba(90,107,78,0.08); }
.notif-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  flex-shrink: 0;
  background: rgba(90,107,78,0.12);
  color: #5A6B4E;
}
.notif-icon-new_follower { background: rgba(90,107,78,0.12); color: #5A6B4E; }
.notif-icon-reaction { background: rgba(239,68,68,0.12); color: #ef4444; }
.notif-icon-comment { background: rgba(59,130,246,0.12); color: #3b82f6; }
.notif-icon-club_invite { background: rgba(196,106,42,0.12); color: #C46A2A; }
.notif-icon-challenge { background: rgba(245,158,11,0.12); color: #f59e0b; }
.notif-body { flex: 1; min-width: 0; }
.notif-msg {
  font-size: 0.85rem;
  font-weight: 600;
  color: rgba(15,18,16,0.85);
  margin: 0 0 3px;
  line-height: 1.4;
}
.notif-time { font-size: 0.75rem; color: rgba(15,18,16,0.45); }
.notif-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #5A6B4E;
  flex-shrink: 0;
  margin-top: 6px;
}
.notif-footer {
  padding: 12px 20px;
  text-align: center;
  font-size: 0.78rem;
  color: rgba(15,18,16,0.45);
  border-top: 1px solid rgba(15,18,16,0.07);
}

/* Profile avatar */
.nav-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255,255,255,0.20);
  border: 2px solid rgba(255,255,255,0.50);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.9rem;
  color: white;
  text-decoration: none;
  transition: all 0.2s;
  flex-shrink: 0;
}
.nav-avatar:hover {
  background: rgba(255,255,255,0.30);
  border-color: rgba(255,255,255,0.80);
}

/* Mobile toggle */
.mobile-menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  border: none;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.mobile-menu-toggle:hover { background: rgba(255, 255, 255, 0.20); }

/* (drawer styles moved to non-scoped block below) */

.me-2 { margin-right: 8px; }
.spinner-border { width: 1rem; height: 1rem; border: 2px solid rgba(15,18,16,0.15); border-top-color: #5A6B4E; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 1rem; height: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .navbar-menu { display: none; }
  .mobile-menu-toggle { display: flex; }
  .navbar-content {
    padding: 18px 20px;
    min-height: 68px;
  }
  .brand-text { font-size: 1.4rem; }
  .mobile-menu-toggle {
    width: 48px;
    height: 48px;
    font-size: 1.4rem;
    border-radius: 14px;
  }
}
</style>

<!-- Non-scoped: drawer teleported to <body>, scoped attrs don't follow -->
<style>
/* Drawer overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 18, 16, 0.55);
  backdrop-filter: blur(4px);
  z-index: 9998;
}

/* Drawer panel */
.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(320px, 85vw);
  background: #1e2a1a;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  box-shadow: -8px 0 40px rgba(15, 18, 16, 0.35);
  font-family: Futura, 'Avenir Next', system-ui, sans-serif;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.drawer-brand {
  font-weight: 900;
  font-size: 1.2rem;
  letter-spacing: 0.08em;
  color: white;
}
.drawer-close {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.80);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}
.drawer-close:hover { background: rgba(255, 255, 255, 0.15); color: white; }

/* User block */
.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.drawer-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(196, 106, 42, 0.80);
  border: 2px solid rgba(255, 255, 255, 0.20);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 1rem;
  color: white;
  flex-shrink: 0;
}
.drawer-user-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: white;
}
.drawer-user-email {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.50);
  margin-top: 2px;
}

/* Nav links */
.drawer-nav {
  flex: 1;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.drawer-footer {
  padding: 10px 12px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.drawer-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.78);
  font-weight: 700;
  font-size: 0.95rem;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
}
.drawer-link i { font-size: 1.05rem; width: 20px; text-align: center; }
.drawer-link:hover { background: rgba(255, 255, 255, 0.08); color: white; }
.drawer-link.router-link-active { background: rgba(255, 255, 255, 0.10); color: white; }
.drawer-link-primary {
  background: rgba(196, 106, 42, 0.20);
  color: #e8a46a;
  border: 1px solid rgba(196, 106, 42, 0.30);
}
.drawer-link-primary:hover { background: rgba(196, 106, 42, 0.30); color: #f0b882; }
.drawer-link-danger { color: rgba(248, 113, 113, 0.85); }
.drawer-link-danger:hover { background: rgba(239, 68, 68, 0.10); color: #f87171; }

/* Transitions */
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.25s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }

.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }
</style>
