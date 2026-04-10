<template>
  <main class="login-page">
    <!-- LEFT: Simple form -->
    <section class="form-side">
      <div class="login-container">
        <!-- Logo/Brand -->
        <div class="brand-mark mb-4">
          <div class="logo-circle">R</div>
          <h2 class="brand-name mb-0">RUNNIT</h2>
        </div>

        <h1 class="h2 fw-bold mb-2">Welcome back</h1>
        <p class="text-muted mb-4">Sign in to continue tracking your progress.</p>

        <!-- Social Buttons -->
        <div class="social-buttons mb-4">
          <button type="button" class="btn btn-social" @click="handleGoogleSignIn">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button type="button" class="btn btn-social" @click="handleAppleSignIn">
            <i class="bi bi-apple"></i>
            Continue with Apple
          </button>
        </div>

        <div class="divider">
          <span>or</span>
        </div>

        <!-- Email Form -->
        <form @submit="onSubmit" novalidate class="mt-4">
          <div class="mb-3">
            <input
              id="email"
              v-model.trim="email"
              type="email"
              class="form-control"
              placeholder="Email"
              required
              autocomplete="email"
            />
          </div>

          <div class="mb-3">
            <div class="password-input">
              <input
                :type="showPwd ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="form-control"
                placeholder="Password"
                required
                autocomplete="current-password"
              />
              <button
                class="password-toggle"
                type="button"
                @click="showPwd = !showPwd"
                aria-label="Toggle password visibility"
              >
                <i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-options mb-3">
            <label class="remember-label">
              <input type="checkbox" v-model="remember" />
              <span>Remember me</span>
            </label>
            <a href="/support" class="forgot-link">Forgot password?</a>
          </div>

          <div v-if="error" class="alert alert-danger py-2 mb-3" role="alert">
            {{ error }}
          </div>

          <!-- Lockout warning -->
          <div v-if="isLocked" class="lockout-bar mb-3">
            <i class="bi bi-shield-exclamation me-2"></i>
            Account locked — try again in <strong>{{ lockCountdown }}s</strong>
          </div>

          <button
            class="btn btn-primary w-100"
            :disabled="loading || isLocked"
            type="submit"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2"></span>
              Signing in...
            </span>
          </button>
        </form>

        <p class="text-center text-muted small mt-4 mb-0">
          Don't have an account?
          <router-link to="/signup" class="link">Sign up</router-link>
        </p>
      </div>
    </section>

    <!-- RIGHT: Minimal motivational visual -->
    <section class="visual-side">
      <div class="visual-content">
        <!-- Stats Preview -->
        <div class="stats-preview">
          <div class="stat-item">
            <div class="stat-number">24</div>
            <div class="stat-label">Day Streak</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">127</div>
            <div class="stat-label">Activities</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-number">8:42</div>
            <div class="stat-label">Avg Pace</div>
          </div>
        </div>

        <!-- Message -->
        <div class="visual-message">
          <h2 class="visual-title">Your progress is waiting.</h2>
          <p class="visual-subtitle">
            Sign in to continue your training journey and see how far you've come.
          </p>
        </div>

        <!-- Quote -->
        <div class="quote-card">
          <div class="quote-icon">"</div>
          <p class="quote-text">
            Consistency isn't about perfection. It's about showing up.
          </p>
        </div>
      </div>
    </section>
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

onMounted(() => {
  if (isAuthenticated.value) {
    router.replace(role.value === 'coach' ? '/coach/dashboard' : '/dashboard')
  }
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const handleGoogleSignIn = () => {
  window.location.href = `${API_URL}/auth/oauth/google`
}

const handleAppleSignIn = () => {
  window.location.href = `${API_URL}/auth/oauth/apple`
}
</script>

<style scoped>
/* ===== Design Tokens ===== */
.login-page {
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--r-white);
}

/* ===== LEFT SIDE: Form ===== */
.form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: var(--r-white);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

/* Brand Mark */
.brand-mark {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-circle {
  width: 48px;
  height: 48px;
  border-radius: 0;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 900;
  color: white;
}

.brand-name {
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 0.08em;
  color: #000;
}

/* Typography */
.login-page h1 {
  color: #000;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.text-muted {
  color: #6B7280;
  font-size: 15px;
}

/* Social Buttons */
.social-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-social {
  width: 100%;
  height: 48px;
  border: 1px solid #E5E7EB;
  border-radius: 0;
  background: white;
  color: #1F2937;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-social:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-social svg {
  flex-shrink: 0;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  margin: 24px 0;
}

.divider::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 1px;
  background: #E5E7EB;
}

.divider span {
  position: relative;
  background: white;
  padding: 0 12px;
  font-size: 13px;
  color: #9CA3AF;
  font-weight: 500;
}

/* Form Inputs */
.form-control {
  height: 48px;
  border: 1px solid #E5E7EB;
  border-radius: 0;
  padding: 0 16px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-control::placeholder {
  color: #9CA3AF;
}

.form-control:focus {
  outline: none;
  border-color: #000;
  box-shadow: none;
}

/* Password Input */
.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #6B7280;
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6B7280;
  cursor: pointer;
}

.remember-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border: 2px solid #D1D5DB;
  border-radius: 0;
  cursor: pointer;
}

.remember-label input[type="checkbox"]:checked {
  accent-color: #000;
}

.forgot-link {
  font-size: 14px;
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* Links */
.link {
  color: #000;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

/* Primary Button */
.btn-primary {
  height: 48px;
  background: #0052FF;
  border: none;
  border-radius: 0;
  color: white;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #003ECC;
  transform: none;
  box-shadow: none;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alert */
.alert-danger {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 0;
  color: #DC2626;
  font-size: 14px;
}

/* Lockout bar */
.lockout-bar {
  background: #FFF7ED;
  border: 1px solid #FED7AA;
  color: #C2410C;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 14px;
  display: flex;
  align-items: center;
}

/* ===== RIGHT SIDE: Visual ===== */
.visual-side {
  position: relative;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  overflow: hidden;
}


.visual-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Stats Preview */
.stats-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0;
  box-shadow: none;
  backdrop-filter: blur(10px);
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  font-size: 32px;
  font-weight: 800;
  color: #000;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
  font-weight: 600;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #E5E7EB;
}

/* Visual Message */
.visual-message {
  text-align: center;
  color: white;
}

.visual-title {
  font-size: 36px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.visual-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  line-height: 1.5;
}

/* Quote Card */
.quote-card {
  position: relative;
  padding: 28px 32px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0;
  backdrop-filter: blur(10px);
}

.quote-icon {
  position: absolute;
  top: -10px;
  left: 20px;
  font-size: 72px;
  color: rgba(255, 255, 255, 0.2);
  line-height: 1;
  font-family: Futura, "Futura PT", "Futura Std", "Avenir Next", Avenir, system-ui, -apple-system, sans-serif;
}

.quote-text {
  position: relative;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  font-style: italic;
  line-height: 1.6;
  margin: 0;
  padding-top: 20px;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 991px) {
  .login-page {
    grid-template-columns: 1fr;
  }
  
  .visual-side {
    display: none;
  }
  
  .form-side {
    padding: 40px 20px;
  }
}

@media (max-width: 480px) {
  .login-container {
    max-width: 100%;
  }
  
  .brand-mark {
    justify-content: center;
  }
  
  h1 {
    font-size: 24px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>