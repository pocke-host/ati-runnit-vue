<!-- src/components/TopNav.vue -->
<template>
  <header :class="['site-header', { 'site-header--auth': isAuthenticated }]">
    <!-- Spec bar — marketing pages only (unauthenticated) -->
    <SpecBar v-if="!isAuthenticated" />

    <nav class="navbar">
    <div class="navbar-content">

      <!-- LEFT: brand -->
      <router-link :to="isAuthenticated ? (role === 'coach' ? '/coach/dashboard' : '/dashboard') : '/'" class="navbar-brand">
        <span v-if="!isAuthenticated" class="brand-text brand-text--gr">RUNNIT<span class="brand-dot">.</span></span>
        <span v-else class="brand-text brand-text--gr">RUNNIT<span class="brand-dot">.</span></span>
      </router-link>

      <!-- LEFT: desktop nav links (authenticated athletes, left-aligned after brand) -->
      <div class="navbar-links" v-if="isAuthenticated && role !== 'coach'">
        <router-link to="/feed" class="nav-link-auth">Feed</router-link>
        <router-link to="/explore" class="nav-link-auth">Explore</router-link>
        <router-link to="/stats" class="nav-link-auth">Stats</router-link>
        <router-link to="/my-coach" class="nav-link-auth">Coach</router-link>
      </div>

      <!-- RIGHT: icons + coach links + public links + hamburger -->
      <div class="nav-right">

        <!-- Coach desktop nav links (right-aligned, not centered) -->
        <div class="navbar-links navbar-links--coach" v-if="isAuthenticated && role === 'coach'">
          <router-link to="/coach/dashboard" class="nav-link">
            <i class="bi bi-grid-3x3-gap me-2"></i>Dashboard
          </router-link>
          <router-link to="/coach/athletes" class="nav-link">
            <i class="bi bi-people me-2"></i>Roster
          </router-link>
        </div>

        <!-- Public nav links -->
        <div class="navbar-links navbar-links--public" v-if="!isAuthenticated">
          <router-link to="/features" class="nav-link nav-link-gr">Features</router-link>
          <router-link to="/about" class="nav-link nav-link-gr">About</router-link>
          <router-link to="/pricing" class="nav-link nav-link-gr">Pricing</router-link>
          <router-link to="/waitlist" class="nav-link nav-link-gr-cta">Join Waitlist</router-link>
        </div>

        <!-- Auth icons -->
        <template v-if="isAuthenticated">
          <router-link to="/track" class="nav-track-pill desktop-only" aria-label="Track activity">
            <span class="track-pill-play">▶</span>Track
          </router-link>
          <div class="icon-group">
          <!-- DM (hidden on mobile — accessible via drawer) -->
          <div class="notif-wrap desktop-only">
            <button class="nav-icon-btn" @click="dmStore.open()" aria-label="Messages">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="20" height="20" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1.5-4.5a8.5 8.5 0 1 1 16.5-4Z"/></svg>
              <span v-if="dmStore.unreadCount > 0" class="notif-unread-dot" :aria-label="`${dmStore.unreadCount} unread messages`"></span>
            </button>
          </div>

          <!-- Bell (hidden on mobile — accessible via drawer) -->
          <div class="notif-wrap desktop-only" ref="notifRef">
            <button
              class="nav-icon-btn"
              @click="toggleNotifDropdown"
              aria-label="Notifications"
              :aria-expanded="notifOpen"
              aria-haspopup="true"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" width="20" height="20" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.5 21a1.7 1.7 0 0 1-3 0"/></svg>
              <span v-if="unreadCount > 0" class="notif-unread-dot" :aria-label="`${unreadCount} unread notifications`"></span>
            </button>
            <div v-if="notifOpen" class="notif-dropdown">
              <div class="notif-header">
                <span class="notif-title">Notifications</span>
                <button v-if="unreadCount > 0" class="notif-mark-all" @click="markAll">Mark all read</button>
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
                  v-for="n in notifications"
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
            </div>
          </div>

          <!-- Avatar -->
          <div class="avatar-wrap" ref="avatarRef" style="margin-left:4px;">
            <button
              class="nav-avatar nav-avatar-btn"
              @click="toggleAvatarDropdown"
              :aria-label="`Account menu for ${user?.displayName}`"
              :aria-expanded="avatarOpen"
              aria-haspopup="true"
            >
              <div class="nav-avatar-mono">{{ userInitial }}</div>
            </button>
            <div v-if="avatarOpen" class="avatar-dropdown">
              <div class="avd-header">
                <div class="avd-name">{{ user?.displayName }}</div>
                <div class="avd-email">{{ user?.email }}</div>
              </div>
              <router-link :to="role === 'coach' ? '/coach/dashboard' : '/dashboard'" class="avd-link" @click="avatarOpen = false">
                <i class="bi bi-grid-3x3-gap"></i> Dashboard
              </router-link>
              <router-link to="/profile/edit" class="avd-link" @click="avatarOpen = false">
                <i class="bi bi-person-circle"></i> Edit Profile
              </router-link>
              <router-link to="/settings" class="avd-link" @click="avatarOpen = false">
                <i class="bi bi-gear"></i> Settings
              </router-link>
              <div class="avd-divider"></div>
              <button class="avd-link avd-link-danger" @click="handleLogout">
                <i class="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          </div>
          </div><!-- /icon-group -->
        </template>

        <!-- Mobile Join button (unauthenticated only, mobile only) -->
        <router-link v-if="!isAuthenticated" to="/waitlist" class="mobile-join-btn mobile-join-btn--gr">Join</router-link>

        <!-- Hamburger (mobile only, all users) -->
        <button
          class="mobile-menu-toggle"
          @click="mobileMenuOpen = !mobileMenuOpen"
          :aria-expanded="mobileMenuOpen"
          aria-label="Open navigation menu"
          aria-controls="mobile-drawer"
        >
          <i :class="mobileMenuOpen ? 'bi bi-x-lg' : 'bi bi-list'" aria-hidden="true"></i>
        </button>

      </div>
    </div>
  </nav>

  <!-- Coach View banner — persistent indicator when in coach mode -->
  <div v-if="isAuthenticated && role === 'coach'" class="coach-mode-bar">
    <i class="bi bi-person-badge-fill me-2"></i>
    COACH VIEW
    <router-link to="/dashboard" class="coach-mode-switch">Switch to Athlete →</router-link>
  </div>

  <!-- DM Drawer -->
  <DMDrawer />

  <!-- Teleport drawer outside navbar to avoid backdrop-filter stacking context clipping -->
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>
    </Transition>

    <Transition name="drawer-slide">
      <div v-if="mobileMenuOpen" :class="['mobile-drawer', { 'mobile-drawer--public': !isAuthenticated }]" @touchstart.passive="onDrawerTouchStart" @touchend.passive="onDrawerTouchEnd">
        <!-- Drawer Header -->
        <div class="drawer-header">
          <span class="drawer-brand">RUNNIT<span class="drawer-brand-dot">.</span></span>
          <button class="drawer-close" @click="mobileMenuOpen = false" aria-label="Close navigation menu">✕</button>
        </div>

        <!-- Authenticated links -->
        <template v-if="isAuthenticated">
          <div class="drawer-user" v-if="user">
            <UserAvatar :src="user?.avatarUrl" :name="user?.displayName || ''" :size="44" />
            <div class="drawer-user-info">
              <div class="drawer-user-name">{{ user.displayName }}</div>
              <div class="drawer-user-email">{{ user.email }}</div>
            </div>
          </div>

          <!-- Quick: messages + notifications -->
          <div class="drawer-quick">
            <button class="drawer-link drawer-link--quick" @click="dmStore.open(); mobileMenuOpen = false">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 9 9 0 0 1-4-1L3 20l1.5-4.5a8.5 8.5 0 1 1 16.5-4Z"/></svg>
              Messages
              <span v-if="dmStore.unreadCount > 0" class="drawer-badge">{{ dmStore.unreadCount }}</span>
            </button>
            <router-link to="/notifications" class="drawer-link drawer-link--quick" @click="mobileMenuOpen = false">
              <span class="drawer-bell-wrap">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.5 21a1.7 1.7 0 0 1-3 0"/></svg>
                <span v-if="unreadCount > 0" class="drawer-bell-dot"></span>
              </span>
              Notifications
              <span v-if="unreadCount > 0" class="drawer-badge">{{ unreadCount }}</span>
            </router-link>
          </div>
          <div class="drawer-divider"></div>

          <nav class="drawer-nav">
            <!-- Coach drawer links -->
            <template v-if="role === 'coach'">
              <router-link to="/coach/dashboard" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
              </router-link>
              <router-link to="/coach/athletes" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M15 20c0-2 1-3.5 3-3.5s3 1.5 3 3.5"/></svg>
                Athletes
              </router-link>
            </template>
            <!-- Athlete drawer links -->
            <template v-else>
              <router-link to="/dashboard" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                Dashboard
              </router-link>
              <router-link to="/feed" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="16" rx="1"/><path d="M3 9h18"/></svg>
                Feed
              </router-link>
              <div class="drawer-section-divider"></div>
              <div class="drawer-track-wrap">
                <router-link to="/track" class="drawer-link drawer-link-primary" @click="mobileMenuOpen = false">
                  <span class="drawer-track-icon">▶</span>
                  Track Activity
                </router-link>
              </div>
              <router-link to="/stats" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>
                Stats
              </router-link>
              <router-link to="/achievements" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9a6 6 0 0 0 12 0V3H6Z"/><path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3M9 21h6M12 15v6"/></svg>
                Achievements
              </router-link>
              <router-link to="/clubs" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.2"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M15 20c0-2 1-3.5 3-3.5s3 1.5 3 3.5"/></svg>
                Clubs
              </router-link>
              <router-link to="/challenges" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 3v18M5 4h13l-2 4 2 4H5"/></svg>
                Challenges
              </router-link>
              <router-link to="/plans" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="1"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
                Training Plans
              </router-link>
              <router-link to="/devices" class="drawer-link" @click="mobileMenuOpen = false">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="7" y="4" width="10" height="16" rx="2.5"/><path d="M11 4h2"/></svg>
                Devices
              </router-link>
            </template>
          </nav>

          <div class="drawer-footer">
            <router-link to="/settings" class="drawer-link drawer-link-settings" @click="mobileMenuOpen = false">Settings</router-link>
            <router-link
              v-if="subscriptionTier !== 'free'"
              to="/billing"
              class="drawer-link drawer-link-settings"
              @click="mobileMenuOpen = false"
            >Billing</router-link>
            <router-link
              v-else
              to="/subscribe"
              class="drawer-link drawer-link-settings"
              @click="mobileMenuOpen = false"
            >Upgrade</router-link>
            <button class="drawer-link drawer-link-signout" @click="handleLogout">Sign Out</button>
          </div>
        </template>

        <!-- Unauthenticated links -->
        <template v-else>
          <nav class="drawer-nav">
            <router-link to="/features" class="drawer-link" @click="mobileMenuOpen = false">Features</router-link>
            <router-link to="/about" class="drawer-link" @click="mobileMenuOpen = false">About</router-link>
            <router-link to="/pricing" class="drawer-link" @click="mobileMenuOpen = false">Pricing</router-link>
          </nav>
          <div class="drawer-footer">
            <router-link to="/join-us" class="drawer-link" @click="mobileMenuOpen = false">Login</router-link>
            <router-link to="/waitlist" class="drawer-link drawer-link-primary" @click="mobileMenuOpen = false">Join Waitlist</router-link>
          </div>
        </template>
      </div>
    </Transition>
  </Teleport>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useDMStore } from '@/stores/dm'
import { storeToRefs } from 'pinia'
import DMDrawer from '@/components/DMDrawer.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import SpecBar from '@/components/SpecBar.vue'

const router = useRouter()
const authStore = useAuthStore()
const notifStore = useNotificationStore()
const dmStore = useDMStore()

const { user, isAuthenticated, subscriptionTier, role } = storeToRefs(authStore)
const { notifications, unreadCount, loading: notifLoading } = storeToRefs(notifStore)

const mobileMenuOpen = ref(false)
const scrolled = ref(false)

const handleScroll = () => { scrolled.value = window.scrollY > 32 }

// Swipe-to-close drawer (swipe right ≥ 60px)
let swipeStartX = null
const onDrawerTouchStart = (e) => { swipeStartX = e.touches[0].clientX }
const onDrawerTouchEnd = (e) => {
  if (swipeStartX === null) return
  const delta = e.changedTouches[0].clientX - swipeStartX
  if (delta > 60) mobileMenuOpen.value = false
  swipeStartX = null
}
const notifOpen = ref(false)
const notifRef = ref(null)
const avatarOpen = ref(false)
const avatarRef = ref(null)
const userId = computed(() => user.value?.id)
const userInitial = computed(() => user.value?.displayName?.charAt(0).toUpperCase() || '?')

const toggleAvatarDropdown = () => {
  avatarOpen.value = !avatarOpen.value
  if (avatarOpen.value) notifOpen.value = false
}

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
  else if (n.type === 'REACTION' || n.type === 'COMMENT') {
    if (n.activityId) router.push(`/activities/${n.activityId}`)
    else router.push('/feed')
  }
  else if (n.type === 'CLUB_INVITE') router.push('/clubs')
  else if (n.type === 'ACHIEVEMENT') router.push('/achievements')
  else if (n.type === 'CHALLENGE') router.push('/challenges')
  else if (n.type === 'PLAN_ASSIGNED') router.push('/plans')
  else if (n.type === 'WORKOUT_REMINDER') router.push('/plans')
  else if (n.type === 'PERSONAL_RECORD') router.push('/stats')
  // fallback: stay put (modal already closed)
}

const handleOutsideClick = (e) => {
  if (notifRef.value && !notifRef.value.contains(e.target)) notifOpen.value = false
  if (avatarRef.value && !avatarRef.value.contains(e.target)) avatarOpen.value = false
}

const handleKeydown = (e) => {
  if (e.key === 'Escape') {
    notifOpen.value = false
    avatarOpen.value = false
    mobileMenuOpen.value = false
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
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('scroll', handleScroll, { passive: true })
  if (isAuthenticated.value) {
    notifStore.startPolling(30000)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', handleScroll)
  notifStore.stopPolling()
})
</script>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding-top: env(safe-area-inset-top, 0px);
}
.navbar {
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}

.navbar-content {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  height: 66px;
  display: flex;
  align-items: center;
}

/* Desktop layout: brand left | athlete links centered | icons right */
.navbar-content { position: relative; }
.mobile-menu-toggle { display: none; }
/* Override Bootstrap's .navbar-brand margin-right: 1rem */
.navbar-brand { text-decoration: none; flex-shrink: 0; margin-right: 0; }

/* Athlete nav links: absolutely centered in the navbar */
.navbar-links {
  display: flex;
  align-items: center;
  gap: 28px;
  margin-left: 20px;
}
/* Coach + public links: sit inside nav-right */
.navbar-links--coach,
.navbar-links--public {
  position: static;
  transform: none;
  margin-left: 0;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
}
.nav-right .icon-group {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 20px;
  border-left: 2px solid #E7DFCE;
}

.brand-text {
  font-family: Futura, "Futura PT", "Avenir Next", Avenir, "Jost", system-ui, sans-serif;
  font-weight: 900;
  font-size: 1.25rem;
  letter-spacing: -0.04em;
  color: #000;
  text-transform: uppercase;
}
.brand-reg {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 500;
  vertical-align: super;
  margin-left: 1px;
}
/* Good Record logo */
.brand-text--gr {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.7rem;
  letter-spacing: 0.01em;
  color: #16130F;
}
.brand-dot {
  color: #2A55F5;
  font-style: normal;
}
/* Good Record nav links */
.nav-link-gr {
  font-family: 'Spline Sans Mono', ui-monospace, monospace !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.12em !important;
  text-transform: uppercase !important;
  color: #16130F !important;
  border-bottom: none !important;
  padding: 5px 0 !important;
}
.nav-link-gr:hover { color: #2A55F5 !important; }
.nav-link-gr.router-link-active {
  color: #16130F !important;
  border-bottom: 2px solid #2A55F5 !important;
}
/* Good Record CTA pill */
.nav-link-gr-cta {
  background: #2A55F5 !important;
  color: #fff !important;
  border: 2px solid #16130F !important;
  border-radius: 999px !important;
  padding: 9px 15px !important;
  font-family: 'Spline Sans Mono', ui-monospace, monospace !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
  box-shadow: 3px 3px 0 #16130F !important;
  transition: background 0.15s !important;
}
.nav-link-gr-cta:hover {
  background: #1E42D6 !important;
  color: #fff !important;
  text-decoration: none !important;
}
.nav-link-gr-cta.router-link-active {
  border-bottom: 2px solid #16130F !important;
}
/* Good Record mobile join pill */
.mobile-join-btn--gr {
  background: #2A55F5 !important;
  border: 2px solid #16130F !important;
  border-radius: 999px !important;
  box-shadow: 2px 2px 0 #16130F !important;
  font-family: 'Spline Sans Mono', ui-monospace, monospace !important;
}

.nav-link {
  padding: 5px 0;
  border-radius: 0;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #767676;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 500;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  transition: color 0.15s;
}
.nav-link:hover { background: transparent; color: #000; }
.nav-link.router-link-active {
  color: #000;
  border-bottom: 2px solid #000;
  padding-bottom: 5px;
}
/* non-mono links keep old styling (e.g. Track) */
.nav-link:not(.nav-link-mono) {
  font-family: Futura, "Futura PT", "Avenir Next", Avenir, "Jost", system-ui, sans-serif;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  color: #767676;
  font-weight: 500;
}
.nav-link:not(.nav-link-mono):hover { color: #000; }
.nav-link:not(.nav-link-mono).router-link-active { color: #000; border-bottom: 2px solid #000; }

.nav-link-mono {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  letter-spacing: 0.1em;
  font-weight: 500;
  color: #767676;
}
.nav-link-mono:hover { color: #000; }
.nav-link-mono.router-link-active {
  color: #000;
  font-weight: 600;
  border-bottom: 2px solid #000;
}

.nav-link-track {
  background: #000;
  color: #fff !important;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  font-size: 0.68rem;
  padding: 8px 16px;
  margin-left: 4px;
  gap: 7px;
  border-bottom: none !important;
}
.nav-link-track:hover { background: #222 !important; color: #fff !important; }

/* GR authenticated nav links */
.nav-link-auth {
  position: relative;
  padding: 22px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5a5348;
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.15s;
}
.nav-link-auth:hover { color: #16130F; }
.nav-link-auth.router-link-active { color: #16130F; }
.nav-link-auth.router-link-active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  background: #2A55F5;
}

/* GR Track CTA pill */
.nav-track-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #2A55F5;
  color: #fff !important;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 9px 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 3px 3px 0 #16130F;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.nav-track-pill:hover { background: #1E42D6 !important; text-decoration: none; }
.track-pill-play {
  display: inline-flex;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background: #fff;
  color: #2A55F5;
  align-items: center;
  justify-content: center;
  font-size: 7px;
  flex-shrink: 0;
}

/* GR cobalt avatar monogram */
.nav-avatar-mono {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #2A55F5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.74rem;
  border: 2px solid #16130F;
  flex-shrink: 0;
}

/* Hide on mobile, show on desktop */
.desktop-only { display: flex; }

/* Notification bell */
.notif-wrap { position: relative; }
.nav-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #5a5348;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.15s;
  position: relative;
  flex-shrink: 0;
  padding: 0;
}
.nav-icon-btn:hover { color: #16130F; }
.notif-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  border-radius: 0;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
  line-height: 1;
}
.notif-unread-dot {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #2A55F5;
  border: 1.5px solid #FBF6EC;
}

/* Notification dropdown */
.notif-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  background: #FBF6EC;
  border-radius: 0;
  box-shadow: 4px 4px 0 #16130F;
  border: 2px solid #16130F;
  overflow: hidden;
  animation: dropIn 0.15s ease;
  z-index: 2000;
}
@keyframes dropIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}
.notif-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 2px solid #E7DFCE;
}
.notif-title { font-weight: 700; font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; color: #000; }
.notif-mark-all {
  font-size: 0.72rem;
  font-weight: 600;
  color: #767676;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.notif-mark-all:hover { color: #000; }
.notif-loading {
  display: flex;
  align-items: center;
  padding: 24px 20px;
  font-size: 0.85rem;
  color: #767676;
}
.notif-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #767676;
  text-align: center;
}
.notif-empty i { font-size: 2rem; margin-bottom: 10px; }
.notif-empty p { margin: 0; font-weight: 400; font-size: 0.85rem; }
.notif-list { max-height: 380px; overflow-y: auto; }
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.1s;
  border-bottom: 2px solid #E7DFCE;
  position: relative;
}
.notif-item:hover { background: rgba(42,85,245,0.04); }
.notif-item.unread { background: rgba(42,85,245,0.06); }
.notif-item.unread:hover { background: rgba(42,85,245,0.08); }
.notif-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  flex-shrink: 0;
  background: #f0f0f0;
  color: #000;
}
.notif-icon-new_follower { background: #f0f0f0; color: #000; }
.notif-icon-reaction { background: #fff0f0; color: #ef4444; }
.notif-icon-comment { background: #f0f4ff; color: #3b82f6; }
.notif-icon-club_invite { background: #f0f0f0; color: #000; }
.notif-icon-challenge { background: #EBF0FF; color: #2A55F5; }
.notif-body { flex: 1; min-width: 0; }
.notif-msg {
  font-size: 0.83rem;
  font-weight: 400;
  color: #000;
  margin: 0 0 3px;
  line-height: 1.4;
}
.notif-time { font-size: 0.72rem; color: #767676; }
.notif-dot {
  width: 6px;
  height: 6px;
  border-radius: 0;
  background: #000;
  flex-shrink: 0;
  margin-top: 6px;
}
.notif-footer {
  display: block;
  width: 100%;
  padding: 12px 20px;
  text-align: center;
  font-size: 0.75rem;
  color: #767676;
  border-top: 1px solid #E5E5E5;
  background: none;
  border-left: none;
  border-right: none;
  border-bottom: none;
  cursor: pointer;
  transition: background 0.15s;
}
.notif-footer:hover { background: #f5f5f5; color: #000; }

/* Profile avatar dropdown */
.avatar-wrap { position: relative; }

.nav-avatar {
  border-radius: 0;
  border: none;
  padding: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.15s;
  flex-shrink: 0;
  overflow: hidden;
}
.nav-avatar:hover { opacity: 0.8; }

.avatar-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 220px;
  background: #FBF6EC;
  border: 2px solid #16130F;
  box-shadow: 4px 4px 0 #16130F;
  border-radius: 0;
  overflow: hidden;
  animation: dropIn 0.15s ease;
  z-index: 2000;
}

.avd-header {
  padding: 14px 16px;
  border-bottom: 2px solid #E7DFCE;
}
.avd-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: #000;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.avd-email {
  font-size: 0.72rem;
  color: #767676;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.avd-link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  font-size: 0.83rem;
  color: #000;
  text-decoration: none;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  font-family: inherit;
  transition: background 0.1s;
}
.avd-link i { width: 16px; text-align: center; color: #767676; font-size: 0.9rem; }
.avd-link:hover { background: #f5f5f5; }

.avd-divider {
  border: none;
  border-top: 1px solid #E5E5E5;
  margin: 4px 0;
}

.avd-link-danger { color: #dc2626; }
.avd-link-danger i { color: #dc2626; }
.avd-link-danger:hover { background: #fef2f2; }

/* Primary nav CTA — blue mono button */
.nav-link-primary {
  background: #2A55F5;
  color: #fff !important;
  border: 2px solid #2A55F5;
  padding: 9px 16px !important;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 2px solid #2A55F5 !important;
  transition: background 0.15s, border-color 0.15s;
}
.nav-link-primary:hover {
  background: #1E42D6 !important;
  border-color: #1E42D6 !important;
  color: #fff !important;
}
.nav-link-primary.router-link-active {
  border-bottom: 2px solid #2A55F5 !important;
}

/* Mobile Join button */
.mobile-join-btn {
  display: none;
  background: #2A55F5;
  color: #fff !important;
  border: none;
  padding: 8px 14px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s;
  flex-shrink: 0;
}
.mobile-join-btn:hover { background: #1E42D6; text-decoration: none; }

/* Mobile toggle */
.mobile-menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 0;
  color: #000;
  font-size: 1.2rem;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
}
.mobile-menu-toggle:hover { opacity: 0.7; }

.me-2 { margin-right: 8px; }
.spinner-border { width: 1rem; height: 1rem; border: 2px solid rgba(0,0,0,0.10); border-top-color: #000; border-radius: 50%; animation: spin 0.75s linear infinite; display: inline-block; }
.spinner-border-sm { width: 1rem; height: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 640px) {
  .navbar-content { height: 56px; }
  .mobile-join-btn { display: inline-flex; align-items: center; }
}

@media (max-width: 768px) {
  .navbar-content {
    /* horizontal safe-area for notch/island (landscape or side-notch) */
    padding: 0 max(16px, env(safe-area-inset-right, 16px)) 0 max(16px, env(safe-area-inset-left, 16px));
  }
  /* Center brand on mobile via absolute */
  .navbar-brand {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
  .nav-right {
    flex: 1;
    justify-content: flex-end;
    margin-left: auto;
    gap: 8px;
  }
  .nav-right .icon-group {
    margin-left: 0;
    padding-left: 0;
    border-left: none;
    gap: 8px;
  }
  /* Hide text nav links and DM/bell on mobile — use drawer instead */
  .navbar-links { display: none !important; }
  .desktop-only { display: none !important; }
  .mobile-menu-toggle { display: flex; color: #000; }
  .brand-text { font-size: 1rem; }
}
</style>

<!-- Non-scoped: drawer teleported to <body>, scoped attrs don't follow -->
<style>
/* Drawer overlay */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(22, 19, 15, 0.55);
  z-index: 9998;
}

/* Drawer panel */
.mobile-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(320px, 85vw);
  background: #16130F;
  border-left: 3px solid #2A55F5;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #FBF6EC;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-right: env(safe-area-inset-right, 0px);
}

/* Public drawer: Good Record cream (unauthenticated) */
.mobile-drawer--public {
  background: #FBF6EC;
  border-left: 2px solid #16130F;
  color: #16130F;
}
.mobile-drawer--public .drawer-header { border-bottom: 2px solid #16130F; }
.mobile-drawer--public .drawer-brand { color: #16130F; }
.mobile-drawer--public .drawer-brand-dot { color: #2A55F5; }
.mobile-drawer--public .drawer-close { color: #16130F; border-color: rgba(22,19,15,0.3); }
.mobile-drawer--public .drawer-close:hover { color: #2A55F5; }
.mobile-drawer--public .drawer-link { color: #16130F; }
.mobile-drawer--public .drawer-link:hover { color: #2A55F5; }
.mobile-drawer--public .drawer-footer { border-top: 2px solid #16130F; }
.mobile-drawer--public .drawer-link-primary {
  background: #2A55F5;
  color: #fff !important;
  border: 2px solid #16130F;
  border-radius: 999px;
  margin: 12px 20px;
  padding: 13px 20px;
  text-align: center;
  justify-content: center;
  box-shadow: 3px 3px 0 #16130F;
}
.mobile-drawer--public .drawer-link-primary:hover { background: #1E42D6; }

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px;
  border-bottom: 2px solid rgba(251, 246, 236, 0.15);
  flex-shrink: 0;
}
.drawer-brand {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.5rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #FBF6EC;
}
.drawer-brand-dot { color: #2A55F5; }
.drawer-close {
  width: 30px;
  height: 30px;
  border: 2px solid rgba(251, 246, 236, 0.35);
  background: transparent;
  color: rgba(251, 246, 236, 0.85);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
  flex-shrink: 0;
}
.drawer-close:hover { border-color: #FBF6EC; color: #FBF6EC; }

/* User block */
.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 2px solid rgba(251, 246, 236, 0.15);
  flex-shrink: 0;
}
.drawer-user-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  line-height: 0.9;
  text-transform: uppercase;
  color: #FBF6EC;
}
.drawer-user-email {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  color: rgba(251, 246, 236, 0.55);
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Quick actions (messages / notifications) */
.drawer-quick {
  display: flex;
  flex-direction: column;
  padding: 6px 0;
  border-bottom: 2px solid rgba(251, 246, 236, 0.15);
}

/* Nav links */
.drawer-nav {
  flex: 1;
  padding: 8px 0;
  display: flex;
  flex-direction: column;
}
.drawer-footer {
  padding: 14px 20px;
  border-top: 2px solid rgba(251, 246, 236, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  gap: 12px;
}
.drawer-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 13px 20px;
  color: rgba(251, 246, 236, 0.85);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
  width: 100%;
  text-align: left;
  box-sizing: border-box;
}
.drawer-link svg { flex-shrink: 0; }
.drawer-link:hover { color: #FBF6EC; background: rgba(251,246,236,0.05); }
.drawer-link.router-link-active {
  color: #2A55F5;
  background: rgba(42, 85, 245, 0.14);
}
.drawer-link.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #2A55F5;
}
.drawer-link.router-link-active svg { stroke: #2A55F5; }

/* Track Activity CTA */
.drawer-track-wrap { padding: 6px 20px; }
.drawer-link-primary {
  background: #2A55F5;
  color: #fff !important;
  border: 2px solid #FBF6EC !important;
  border-radius: 999px;
  padding: 12px 16px;
  justify-content: center;
  box-shadow: 3px 3px 0 rgba(251, 246, 236, 0.25);
  width: 100%;
  letter-spacing: 0.1em;
}
.drawer-link-primary:hover { background: #1E42D6 !important; }
.drawer-track-icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  color: #2A55F5;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  flex-shrink: 0;
}

/* Footer links */
.drawer-link-settings {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(251, 246, 236, 0.85);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  width: auto;
}
.drawer-link-settings:hover { color: #FBF6EC; }
.drawer-link-signout {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2A55F5;
  border: none;
  background: none;
  cursor: pointer;
  padding: 0;
  width: auto;
}
.drawer-link-signout:hover { color: #FBF6EC; }

/* Bell unread dot */
.drawer-bell-wrap { position: relative; display: inline-flex; }
.drawer-bell-dot {
  position: absolute;
  top: -2px;
  right: -3px;
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #2A55F5;
  border: 1.5px solid #16130F;
}

.drawer-divider {
  height: 2px;
  background: rgba(251, 246, 236, 0.15);
  margin: 4px 20px;
}

/* Hairline within nav — between Feed and Track */
.drawer-section-divider {
  height: 2px;
  background: rgba(251, 246, 236, 0.15);
  margin: 10px 20px;
}

/* Quick action links use Hanken Grotesk (not mono) per spec */
.drawer-link--quick {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0;
  text-transform: none;
}
.drawer-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: 999px;
}

/* Transitions */
.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 0.20s ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }

.drawer-slide-enter-active, .drawer-slide-leave-active { transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
.drawer-slide-enter-from, .drawer-slide-leave-to { transform: translateX(100%); }

/* Coach mode banner */
.coach-mode-bar {
  position: fixed;
  top: var(--nav-h, 66px);
  left: 0;
  right: 0;
  z-index: 999;
  background: #2A55F5;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px 16px;
  gap: 0;
}
.coach-mode-switch {
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.10em;
  margin-left: auto;
  border-bottom: 1px solid rgba(255,255,255,0.40);
  padding-bottom: 1px;
}
.coach-mode-switch:hover { color: #fff; border-bottom-color: #fff; }
</style>
