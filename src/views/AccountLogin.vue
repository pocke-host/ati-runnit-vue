<template>
  <main class="login-page">
    <div class="login-wrap">
      <!-- Ticker -->
      <div class="login-ticker" aria-hidden="true">
        <div class="login-ticker-track">
          <span>&nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ NO OFF-SEASON &nbsp;</span>
          <span>&nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ NO OFF-SEASON &nbsp;</span>
        </div>
      </div>

      <!-- Logo bar -->
      <div class="login-logo-bar">
        <span class="login-logo-text">RUNNIT<span class="login-logo-dot">.</span></span>
      </div>

      <!-- Card body -->
      <div class="login-body">
        <h1 class="login-headline">Welcome back.</h1>
        <p class="login-sub">Pick up where your legs left off.</p>

        <!-- Social buttons -->
        <div class="login-social">
          <button type="button" class="login-social-btn" @click="handleGoogleSignIn" :disabled="googleLoading">
            <span v-if="googleLoading" class="login-spinner"></span>
            <svg v-else width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z" fill="#EA4335"/>
            </svg>
            {{ googleLoading ? 'Signing in...' : 'Continue with Google' }}
          </button>
          <button type="button" class="login-social-btn" @click="handleAppleSignIn" disabled style="opacity:0.45;cursor:not-allowed">
            <i class="bi bi-apple"></i>
            Continue with Apple
          </button>
        </div>
        <div v-if="googleError" class="login-alert">{{ googleError }}</div>

        <!-- Divider -->
        <div class="login-divider">
          <span class="login-divider-line"></span>
          <span class="login-divider-text">or</span>
          <span class="login-divider-line"></span>
        </div>

        <!-- Form fields -->
        <form @submit="onSubmit" novalidate>
          <div class="login-field">
            <label class="login-label" for="email">Email</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              class="login-input"
              placeholder="you@email.com"
              required
              autocomplete="email"
            />
          </div>

          <div class="login-field">
            <div class="login-label-row">
              <label class="login-label" for="password">Password</label>
              <router-link to="/forgot-password" class="login-forgot">Forgot?</router-link>
            </div>
            <div class="login-pwd-wrap">
              <input
                :type="showPwd ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="login-input"
                placeholder="Min 8 characters"
                required
                autocomplete="current-password"
              />
              <button class="login-pwd-toggle" type="button" @click="showPwd = !showPwd" aria-label="Toggle password visibility">
                <i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="error" class="login-alert" role="alert">{{ error }}</div>

          <div v-if="isLocked" class="login-lockout">
            <i class="bi bi-shield-exclamation"></i>
            Account locked — try again in <strong>{{ lockCountdown }}s</strong>
          </div>

          <button class="login-submit" :disabled="loading || isLocked" type="submit">
            <span v-if="!loading">Sign In →</span>
            <span v-else class="login-spinner-wrap">
              <span class="login-spinner"></span>Signing in...
            </span>
          </button>
        </form>

        <p class="login-signup-link">
          New here?
          <router-link to="/signup" class="login-link">Create an account</router-link>
        </p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { role, isAuthenticated } = storeToRefs(authStore)

// ── Google Sign-In (GIS) ──────────────────────────────────────────────────────
const googleLoading = ref(false)
const googleError = ref('')

const initGoogleSignIn = () => {
  if (!window.google?.accounts?.id) { setTimeout(initGoogleSignIn, 300); return }
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: async ({ credential }) => {
      googleLoading.value = true
      googleError.value = ''
      try {
        await authStore.loginWithGoogle(credential)
        router.push(authStore.onboardingComplete ? (role.value === 'coach' ? '/coach/dashboard' : '/dashboard') : '/onboard')
      } catch {
        googleError.value = 'Google sign-in failed. Please try again.'
      } finally {
        googleLoading.value = false
      }
    },
    ux_mode: 'popup',
    cancel_on_tap_outside: false
  })
}

const handleGoogleSignIn = () => {
  if (!window.google?.accounts?.id) {
    googleError.value = 'Google Sign-In is loading, please try again.'
    return
  }
  googleLoading.value = true
  window.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed()) {
      googleLoading.value = false
      googleError.value = 'Google Sign-In unavailable. Please use email or try again.'
    }
    if (notification.isDismissedMoment() && notification.getDismissedReason() !== 'credential_returned') {
      googleLoading.value = false
    }
  })
}

onMounted(() => {
  if (isAuthenticated.value) {
    router.replace(role.value === 'coach' ? '/coach/dashboard' : '/dashboard')
  }
  initGoogleSignIn()
})

const email = ref('')
const password = ref('')
const remember = ref(true)
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')

// ── Brute-force protection ────────────────────────────────────────────────────
const MAX_ATTEMPTS  = 5
const LOCKOUT_MS    = 30 * 1000 // 30 seconds

const failCount  = ref(parseInt(sessionStorage.getItem('login_fails') || '0'))
const lockedUntil = ref(parseInt(sessionStorage.getItem('login_locked_until') || '0'))
const lockCountdown = ref(0)

let lockTimer = null

const isLocked = computed(() => Date.now() < lockedUntil.value)

const startCountdown = () => {
  clearInterval(lockTimer)
  lockCountdown.value = Math.ceil((lockedUntil.value - Date.now()) / 1000)
  lockTimer = setInterval(() => {
    lockCountdown.value = Math.ceil((lockedUntil.value - Date.now()) / 1000)
    if (lockCountdown.value <= 0) {
      clearInterval(lockTimer)
      lockCountdown.value = 0
      failCount.value = 0
      sessionStorage.removeItem('login_fails')
      sessionStorage.removeItem('login_locked_until')
    }
  }, 1000)
}

// Resume countdown if locked on page load
if (isLocked.value) startCountdown()

const recordFailure = () => {
  failCount.value += 1
  sessionStorage.setItem('login_fails', failCount.value)
  if (failCount.value >= MAX_ATTEMPTS) {
    lockedUntil.value = Date.now() + LOCKOUT_MS
    sessionStorage.setItem('login_locked_until', lockedUntil.value)
    startCountdown()
  }
}

const clearFailures = () => {
  failCount.value = 0
  lockedUntil.value = 0
  sessionStorage.removeItem('login_fails')
  sessionStorage.removeItem('login_locked_until')
}

const onSubmit = async (e) => {
  e.preventDefault()
  if (isLocked.value) return
  error.value = ''

  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password.'
    return
  }

  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    clearFailures()
    router.push(role.value === 'coach' ? '/coach/dashboard' : '/dashboard')
  } catch (err) {
    recordFailure()
    if (isLocked.value) {
      error.value = `Too many failed attempts. Try again in ${lockCountdown.value}s.`
    } else {
      const remaining = MAX_ATTEMPTS - failCount.value
      error.value = (err?.response?.data?.message || 'Incorrect email or password.') +
        (remaining > 0 ? ` ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` : '')
    }
  } finally {
    loading.value = false
  }
}

onUnmounted(() => clearInterval(lockTimer))

// Apple Sign-In — placeholder until Apple Developer credentials are configured
const handleAppleSignIn = () => {}
</script>

<style scoped>
@keyframes rkMarq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes spin { to { transform: rotate(360deg) } }

.login-page {
  min-height: 100vh;
  background: #FBF6EC;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
}

.login-wrap {
  width: 100%;
  max-width: 440px;
  border: 2px solid #16130F;
  background: #fff;
  overflow: hidden;
}

/* Ticker */
.login-ticker {
  background: #16130F;
  border-bottom: 3px solid #2A55F5;
  overflow: hidden;
}
.login-ticker-track {
  display: flex;
  white-space: nowrap;
  animation: rkMarq 24s linear infinite;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #FBF6EC;
  padding: 7px 0;
}
@media (prefers-reduced-motion: reduce) { .login-ticker-track { animation: none; } }

/* Logo bar */
.login-logo-bar {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 32px;
  border-bottom: 2px solid #16130F;
}
.login-logo-text {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.6rem;
  color: #16130F;
  letter-spacing: 0.01em;
}
.login-logo-dot { color: #2A55F5; font-style: normal; }

/* Card body */
.login-body {
  padding: 36px 32px;
}

.login-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: clamp(40px, 8vw, 52px);
  font-weight: 900;
  line-height: 0.85;
  text-transform: uppercase;
  color: #16130F;
  margin: 0 0 10px;
}

.login-sub {
  font-size: 0.94rem;
  color: #5A5348;
  margin: 0 0 22px;
  line-height: 1.5;
}

/* Social buttons */
.login-social {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 6px;
}
.login-social-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px solid #16130F;
  background: #fff;
  color: #16130F;
  padding: 13px 0;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.15s;
}
.login-social-btn:hover:not(:disabled) { background: #FBF6EC; }
.login-social-btn svg { flex-shrink: 0; }

/* Divider */
.login-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 20px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a89e88;
}
.login-divider-line { flex: 1; height: 2px; background: #E7DFCE; }

/* Form fields */
.login-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.login-label-row { display: flex; justify-content: space-between; align-items: baseline; }
.login-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
}
.login-forgot {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #2A55F5;
  text-decoration: none;
  border-bottom: 1px solid transparent;
}
.login-forgot:hover { border-bottom-color: #2A55F5; }

.login-input {
  width: 100%;
  border: 2px solid #16130F;
  background: #fff;
  padding: 13px 14px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 16px; /* 16px prevents iOS auto-zoom */
  color: #16130F;
  outline: none;
  transition: border-color 0.15s;
  box-sizing: border-box;
}
.login-input::placeholder { color: #a89e88; }
.login-input:focus { border-color: #2A55F5; }

.login-pwd-wrap { position: relative; }
.login-pwd-wrap .login-input { padding-right: 48px; }
.login-pwd-toggle {
  position: absolute;
  right: 0; top: 0;
  width: 48px; height: 100%;
  background: none; border: none;
  color: #8A8A8A; font-size: 1rem;
  cursor: pointer; display: flex;
  align-items: center; justify-content: center;
  transition: color 0.15s;
}
.login-pwd-toggle:hover { color: #16130F; }

/* Alert */
.login-alert {
  background: #FEF2F2;
  border: 2px solid #FCA5A5;
  color: #DC2626;
  font-size: 0.84rem;
  padding: 10px 14px;
  margin-bottom: 12px;
}
.login-lockout {
  background: #FFF7ED;
  border: 2px solid #FED7AA;
  color: #C2410C;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

/* Submit pill */
.login-submit {
  width: 100%;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 15px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 4px 4px 0 #16130F;
  transition: background 0.15s, box-shadow 0.15s;
  margin-top: 20px;
}
.login-submit:hover:not(:disabled) { background: #1E42D6; }
.login-submit:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

.login-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  vertical-align: middle;
  margin-right: 6px;
}
.login-spinner-wrap { display: flex; align-items: center; justify-content: center; gap: 6px; }

/* Bottom link */
.login-signup-link {
  text-align: center;
  font-size: 0.86rem;
  color: #5A5348;
  margin: 18px 0 0;
}
.login-link {
  font-weight: 800;
  color: #16130F;
  text-decoration: none;
  border-bottom: 2px solid #2A55F5;
}
.login-link:hover { color: #2A55F5; }

@media (max-width: 480px) {
  .login-page { padding: 20px 0; align-items: flex-start; }
  .login-wrap { max-width: 100%; border-left: none; border-right: none; }
  .login-body { padding: 28px 20px; }
  .login-logo-bar { padding: 0 20px; }
}
</style>