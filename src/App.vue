<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { storeToRefs } from 'pinia'
import TopNav from './components/TopNav.vue'
import BottomNav from './components/BottomNav.vue'
import Footer from './components/Footer.vue'
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { usePushNotifications } from '@/composables/usePushNotifications'
import { useDeepLinks } from '@/composables/useDeepLinks'

const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
const { toasts, dismissToast, showToast } = useToast()

const showChrome = computed(() => route.path !== '/onboard')

// ── Session helpers ──────────────────────────────────────────────────────────
const INACTIVITY_MS = 30 * 60 * 1000  // 30 minutes
const JWT_CHECK_MS  =  5 * 60 * 1000  //  5 minutes

const isJWTExpired = (t) => {
  try {
    const payload = JSON.parse(atob(t.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch { return true }
}

const expireSession = (notify = true) => {
  if (!isAuthenticated.value) return
  authStore.logout()
  if (notify) showToast('Session expired — please sign in again.', 'error')
  router.push('/join-us')
}

// ── Inactivity timer ─────────────────────────────────────────────────────────
let idleTimer = null

const resetIdleTimer = () => {
  if (!isAuthenticated.value) return
  clearTimeout(idleTimer)
  idleTimer = setTimeout(() => expireSession(true), INACTIVITY_MS)
}

const IDLE_EVENTS = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']

// ── Periodic JWT validity check ──────────────────────────────────────────────
let jwtInterval = null

const startJWTCheck = () => {
  jwtInterval = setInterval(() => {
    const token = localStorage.getItem('token')
    if (token && isJWTExpired(token)) expireSession(false)
  }, JWT_CHECK_MS)
}

// ── StatusBar (iOS native only) ───────────────────────────────────────────────
async function initStatusBar() {
  if (!Capacitor.isNativePlatform()) return
  try {
    await StatusBar.setStyle({ style: Style.Dark })  // dark icons on light bg
    await StatusBar.setBackgroundColor({ color: '#ffffff' })
    await StatusBar.show()
  } catch { /* non-fatal on platforms that don't support it */ }
}

// ── Native plugins (push + deep links) ───────────────────────────────────────
const { init: initPush, cleanup: cleanupPush }       = usePushNotifications()
const { init: initDeepLinks, cleanup: cleanupDeepLinks } = useDeepLinks()

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
  if (sessionStorage.getItem('session_corrupted') === 'true') {
    sessionStorage.removeItem('session_corrupted')
    showToast('Your session data was corrupted and you were signed out. Please sign in again.', 'error')
  }

  initStatusBar()
  initDeepLinks()
  if (isAuthenticated.value) initPush()

  // Backend warm-up
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
  fetch(`${API_URL}/health`, { method: 'GET' }).catch(() => {})

  // Start security timers only when authenticated
  if (isAuthenticated.value) {
    IDLE_EVENTS.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))
    resetIdleTimer()
    startJWTCheck()
  }
})

onUnmounted(() => {
  IDLE_EVENTS.forEach(e => window.removeEventListener(e, resetIdleTimer))
  clearTimeout(idleTimer)
  clearInterval(jwtInterval)
  cleanupPush()
  cleanupDeepLinks()
})

const toastIcon = (type) => ({
  success: 'bi bi-check-circle-fill',
  error:   'bi bi-exclamation-circle-fill',
  info:    'bi bi-info-circle-fill',
}[type] || 'bi bi-info-circle-fill')
</script>

<template>
  <TopNav v-if="showChrome" />
  <BottomNav v-if="showChrome" />
  <router-view v-slot="{ Component }">
    <Transition name="page" mode="out-in">
      <component :is="Component" />
    </Transition>
  </router-view>
  <Footer v-if="showChrome" />

  <!-- Global toast stack -->
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast">
        <div
          v-for="t in toasts"
          :key="t.id"
          :class="['app-toast', `app-toast--${t.type}`]"
          @click="dismissToast(t.id)"
        >
          <i :class="['me-2', toastIcon(t.type)]"></i>
          {{ t.message }}
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style>
/* ── Global Toast Stack ── */
.toast-stack {
  position: fixed;
  bottom: 88px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  pointer-events: none;
}

.app-toast {
  display: flex;
  align-items: center;
  padding: 11px 20px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  white-space: nowrap;
  cursor: pointer;
  pointer-events: all;
  font-family: Futura, "Avenir Next", system-ui, sans-serif;
  box-shadow: 0 4px 16px rgba(0,0,0,0.18);
}

.app-toast--info    { background: #000; color: #fff; }
.app-toast--success { background: #16a34a; color: #fff; }
.app-toast--error   { background: #dc2626; color: #fff; }

/* ── Page transition ── */
.page-enter-active { transition: opacity 0.15s ease; }
.page-leave-active { transition: opacity 0.1s ease; }
.page-enter-from,
.page-leave-to     { opacity: 0; }

/* TransitionGroup animations */
.toast-enter-active { transition: all 0.22s ease; }
.toast-leave-active { transition: all 0.18s ease; }
.toast-enter-from   { opacity: 0; transform: translateY(10px); }
.toast-leave-to     { opacity: 0; transform: translateY(-6px); }

/* ── Scroll Reveal ── */
[data-reveal] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.65s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.65s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal].is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* ── Stagger children ── */
[data-stagger] > * {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-stagger].is-visible > *:nth-child(1) { opacity: 1; transform: translateY(0); transition-delay: 0s; }
[data-stagger].is-visible > *:nth-child(2) { opacity: 1; transform: translateY(0); transition-delay: 0.08s; }
[data-stagger].is-visible > *:nth-child(3) { opacity: 1; transform: translateY(0); transition-delay: 0.16s; }
[data-stagger].is-visible > *:nth-child(4) { opacity: 1; transform: translateY(0); transition-delay: 0.24s; }
[data-stagger].is-visible > *:nth-child(5) { opacity: 1; transform: translateY(0); transition-delay: 0.32s; }
[data-stagger].is-visible > *:nth-child(6) { opacity: 1; transform: translateY(0); transition-delay: 0.40s; }
[data-stagger].is-visible > *:nth-child(7) { opacity: 1; transform: translateY(0); transition-delay: 0.48s; }
[data-stagger].is-visible > *:nth-child(8) { opacity: 1; transform: translateY(0); transition-delay: 0.56s; }
</style>
