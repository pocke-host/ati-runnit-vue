<template>
  <main class="login-page">

    <!-- Ticker -->
    <div class="lp-ticker-wrap" aria-hidden="true">
      <div class="lp-ticker">
        <span>&nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
        <span aria-hidden="true">&nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
      </div>
    </div>

    <!-- Logo bar -->
    <div class="lp-logo-bar">
      <span class="lp-logo-text">RUNNIT<span class="lp-logo-dot">.</span></span>
    </div>

    <!-- Form body -->
    <div class="lp-body">

      <h1 class="lp-headline">Welcome back.</h1>
      <p class="lp-sub">Pick up where your legs left off.</p>

      <!-- Hidden Google button container — renderButton targets this, we click it programmatically -->
      <div ref="googleBtnContainer" style="position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;" aria-hidden="true"></div>

      <!-- Social Buttons -->
      <div class="lp-socials">
        <button type="button" class="lp-social-btn" @click="handleGoogleSignIn" :disabled="googleLoading">
          <span v-if="googleLoading" class="lp-spinner lp-spinner--sm"></span>
          <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z" fill="#EA4335"/>
          </svg>
          {{ googleLoading ? 'Signing in…' : 'Continue with Google' }}
        </button>
        <button type="button" class="lp-social-btn lp-social-btn--disabled" @click="handleAppleSignIn" disabled>
          <i class="bi bi-apple" aria-hidden="true"></i>
          Continue with Apple
        </button>
      </div>

      <div v-if="googleError" class="lp-error">{{ googleError }}</div>

      <!-- Divider -->
      <div class="lp-divider"><span>or</span></div>

      <!-- Email/Password Form -->
      <form @submit="onSubmit" novalidate>
        <div class="lp-field">
          <label class="lp-label" for="email">Email</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            class="lp-input"
            placeholder="you@email.com"
            required
            autocomplete="email"
          />
        </div>

        <div class="lp-field">
          <div class="lp-label-row">
            <label class="lp-label" for="password">Password</label>
            <router-link to="/forgot-password" class="lp-forgot">Forgot?</router-link>
          </div>
          <div class="lp-password-wrap">
            <input
              :type="showPwd ? 'text' : 'password'"
              id="password"
              v-model="password"
              class="lp-input"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              class="lp-pwd-toggle"
              type="button"
              @click="showPwd = !showPwd"
              aria-label="Toggle password visibility"
            >
              <i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <div class="lp-form-opts">
          <label class="lp-remember">
            <input type="checkbox" v-model="remember" />
            <span>Remember me</span>
          </label>
        </div>

        <div v-if="error" class="lp-error" role="alert">{{ error }}</div>

        <div v-if="isLocked" class="lp-lockout">
          <i class="bi bi-shield-exclamation" aria-hidden="true"></i>
          Account locked — try again in <strong>{{ lockCountdown }}s</strong>
        </div>

        <button class="lp-btn" :disabled="loading || isLocked" type="submit">
          <span v-if="!loading">Sign In →</span>
          <span v-else class="lp-spinner-row">
            <span class="lp-spinner"></span>Signing in…
          </span>
        </button>
      </form>

      <p class="lp-signup-link">
        New here? <router-link to="/signup" class="lp-signup-a">Create an account</router-link>
      </p>

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

// ── Google Sign-In (GIS popup — avoids One Tap / third-party cookie issues) ──
const googleLoading = ref(false)
const googleError = ref('')
const googleBtnContainer = ref(null)
let popupTimer = null

const initGoogleSignIn = () => {
  if (!window.google?.accounts?.id) { setTimeout(initGoogleSignIn, 300); return }
  window.google.accounts.id.initialize({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    callback: async ({ credential }) => {
      clearTimeout(popupTimer)
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
    cancel_on_tap_outside: true
  })
  // Render Google's own button into a hidden div so it uses the popup flow,
  // not One Tap (which is blocked when third-party cookies are off).
  if (googleBtnContainer.value) {
    window.google.accounts.id.renderButton(googleBtnContainer.value, {
      type: 'standard', theme: 'outline', size: 'large', text: 'signin_with'
    })
  }
}

const handleGoogleSignIn = () => {
  if (!window.google?.accounts?.id) {
    googleError.value = 'Google Sign-In is loading, please try again.'
    return
  }
  googleError.value = ''
  // Click the hidden Google-rendered button to trigger the popup OAuth flow
  const gBtn = googleBtnContainer.value?.querySelector('div[role="button"]')
  if (gBtn) {
    googleLoading.value = true
    gBtn.click()
    // If the popup is closed without completing sign-in, reset loading after 2 min
    popupTimer = setTimeout(() => { googleLoading.value = false }, 120_000)
  } else {
    // renderButton not ready — fall back to One Tap
    googleLoading.value = true
    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || (notification.isDismissedMoment() && notification.getDismissedReason() !== 'credential_returned')) {
        googleLoading.value = false
        if (notification.isNotDisplayed()) {
          googleError.value = 'Google Sign-In unavailable. Please use email or try again.'
        }
      }
    })
  }
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

onUnmounted(() => {
  clearInterval(lockTimer)
  clearTimeout(popupTimer)
})

// Apple Sign-In — placeholder until Apple Developer credentials are configured
const handleAppleSignIn = () => {}
</script>

<style scoped>
@keyframes rkMarq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes spin    { to { transform: rotate(360deg) } }

.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
  padding-top: var(--nav-h, 66px);
}

/* Ticker */
.lp-ticker-wrap {
  width: 100%;
  background: #16130F;
  border-bottom: 3px solid #2A55F5;
  overflow: hidden;
  flex-shrink: 0;
}
.lp-ticker {
  display: flex;
  white-space: nowrap;
  animation: rkMarq 28s linear infinite;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #FBF6EC;
  padding: 7px 0;
}
@media (prefers-reduced-motion: reduce) { .lp-ticker { animation: none; } }

/* Logo bar */
.lp-logo-bar {
  width: 100%;
  padding: 18px 32px;
  border-bottom: 2px solid #16130F;
  display: flex;
  align-items: center;
}
.lp-logo-text {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.4rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #16130F;
}
.lp-logo-dot { color: #2A55F5; }

/* Body */
.lp-body {
  width: 100%;
  max-width: 440px;
  padding: 44px 24px 60px;
}

.lp-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.4rem, 7vw, 3.2rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0 0 12px;
  color: #16130F;
}
.lp-sub {
  font-size: 1rem;
  line-height: 1.6;
  color: #5a5348;
  margin: 0 0 28px;
}

/* Social buttons */
.lp-socials {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 6px;
}
.lp-social-btn {
  width: 100%;
  height: 50px;
  border: 2px solid #16130F;
  background: #fff;
  color: #16130F;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.lp-social-btn:hover:not(:disabled) { background: #F1EADC; }
.lp-social-btn--disabled { opacity: 0.4; cursor: not-allowed; }

/* Divider */
.lp-divider {
  position: relative;
  text-align: center;
  margin: 22px 0 20px;
}
.lp-divider::before {
  content: '';
  position: absolute;
  left: 0; right: 0; top: 50%;
  height: 2px;
  background: #E7DFCE;
}
.lp-divider span {
  position: relative;
  background: #FBF6EC;
  padding: 0 12px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #8a8a8a;
}

/* Fields */
.lp-field { margin-bottom: 18px; }
.lp-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 7px;
}
.lp-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5a5348;
  margin-bottom: 0;
  display: block;
}
.lp-input {
  width: 100%;
  height: 48px;
  border: 2px solid #16130F;
  background: #fff;
  padding: 0 14px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 16px;
  color: #16130F;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.lp-input:focus { border-color: #2A55F5; }
.lp-input::placeholder { color: #8a8a8a; }

/* Password */
.lp-password-wrap { position: relative; }
.lp-password-wrap .lp-input { padding-right: 52px; }
.lp-pwd-toggle {
  position: absolute;
  right: 0; top: 0;
  width: 48px; height: 48px;
  background: none;
  border: none;
  color: #8a8a8a;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}
.lp-pwd-toggle:hover { color: #16130F; }

/* Form options */
.lp-form-opts {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.lp-remember {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: #5a5348;
  cursor: pointer;
}
.lp-remember input[type="checkbox"] {
  width: 16px; height: 16px;
  accent-color: #2A55F5;
  cursor: pointer;
}
.lp-forgot {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #2A55F5;
  text-decoration: none;
}
.lp-forgot:hover { color: #1E42D6; }

/* Error / lockout */
.lp-error {
  background: #FEF2F2;
  border: 2px solid #FCA5A5;
  color: #DC2626;
  font-size: 0.85rem;
  padding: 10px 14px;
  margin-bottom: 16px;
}
.lp-lockout {
  background: #FFF7ED;
  border: 2px solid #FED7AA;
  color: #C2410C;
  font-size: 0.84rem;
  font-weight: 600;
  padding: 10px 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Submit button */
.lp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 15px 28px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 #16130F;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 4px;
}
.lp-btn:hover:not(:disabled) { background: #1E42D6; }
.lp-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

/* Spinner */
.lp-spinner-row { display: flex; align-items: center; gap: 8px; }
.lp-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
.lp-spinner--sm {
  width: 14px; height: 14px;
  border: 2px solid rgba(22,19,15,0.2);
  border-top-color: #16130F;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Sign up link */
.lp-signup-link {
  text-align: center;
  font-size: 0.88rem;
  color: #5a5348;
  margin: 24px 0 0;
}
.lp-signup-a {
  color: #2A55F5;
  font-weight: 700;
  text-decoration: none;
}
.lp-signup-a:hover { text-decoration: underline; }

@media (max-width: 640px) {
  .lp-logo-bar { padding: 14px 18px; }
  .lp-body { padding: 32px 18px 48px; }
  .lp-form-opts { flex-direction: column; align-items: flex-start; gap: 12px; }
}
</style>
