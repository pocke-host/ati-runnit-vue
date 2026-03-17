<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import TopNav from './components/TopNav.vue'
import BottomNav from './components/BottomNav.vue'
import Footer from './components/Footer.vue'

const route  = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

const showChrome = computed(() => route.path !== '/onboard')
const sessionToast = ref(false)

// ── Session helpers ──────────────────────────────────────────────────────────
const INACTIVITY_MS = 30 * 60 * 1000  // 30 minutes
const JWT_CHECK_MS  =  5 * 60 * 1000  //  5 minutes

const isJWTExpired = (t) => {
  try {
    const payload = JSON.parse(atob(t.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch { return true }
}

const expireSession = (showToast = true) => {
  if (!isAuthenticated.value) return
  authStore.logout()
  if (showToast) {
    sessionToast.value = true
    setTimeout(() => { sessionToast.value = false }, 4000)
  }
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

// ── Lifecycle ────────────────────────────────────────────────────────────────
onMounted(() => {
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
})
</script>

<template>
  <TopNav v-if="showChrome" />
  <BottomNav v-if="showChrome" />
  <router-view />
  <Footer v-if="showChrome" />

  <!-- Session expired toast -->
  <Teleport to="body">
    <div v-if="sessionToast" class="session-toast">
      <i class="bi bi-shield-lock-fill me-2"></i>
      Session expired — please sign in again.
    </div>
  </Teleport>
</template>

<style>
/* ── Session Toast ── */
.session-toast {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #000;
  color: #fff;
  padding: 12px 24px;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  z-index: 9999;
  white-space: nowrap;
  animation: toast-in 0.25s ease, toast-out 0.25s ease 3.75s forwards;
  font-family: Futura, "Avenir Next", system-ui, sans-serif;
}
@keyframes toast-in  { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@keyframes toast-out { from { opacity: 1; } to { opacity: 0; } }

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
