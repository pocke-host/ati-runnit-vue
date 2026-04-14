<template>
  <main class="register-page">
    <!-- LEFT: Clean, minimal form -->
    <section class="form-side">
      <div class="register-container">
        <!-- Logo/Brand -->
        <div class="brand-mark mb-4">
          <div class="logo-circle">R</div>
          <h2 class="brand-name mb-0">RUNNIT</h2>
        </div>

        <h1 class="h2 fw-bold mb-2">Create your account</h1>
        <p class="text-muted mb-4">Track every workout. Train smarter. Connect with athletes.</p>

        <!-- Social Buttons (Simplified) -->
        <div class="social-buttons mb-4">
          <button type="button" class="btn btn-social" @click="onSocial('google')" :disabled="googleLoading">
            <span v-if="googleLoading" class="spinner-border spinner-border-sm"></span>
            <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z" fill="#EA4335"/>
            </svg>
            {{ googleLoading ? 'Signing in...' : 'Continue with Google' }}
          </button>
          <button type="button" class="btn btn-social" disabled style="opacity:0.45;cursor:not-allowed">
            <i class="bi bi-apple"></i>
            Continue with Apple
          </button>
        </div>
        <div v-if="googleError" class="alert alert-danger py-2 mb-3">{{ googleError }}</div>

        <div class="divider">
          <span>or</span>
        </div>

        <!-- Email Form -->
        <form @submit.prevent="submit" novalidate class="mt-4">
          <div class="mb-3">
            <input
              id="displayName"
              v-model.trim="displayName"
              type="text"
              class="form-control"
              placeholder="Full name"
              required
              autofocus
              autocomplete="name"
            />
          </div>

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
                placeholder="Password (min 8 characters)"
                minlength="8"
                required
                autocomplete="new-password"
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

          <!-- Password strength meter -->
          <div v-if="password.length > 0" class="pwd-strength mb-3">
            <div class="pwd-strength-bars">
              <div
                v-for="i in 4" :key="i"
                class="pwd-bar"
                :style="{ background: i <= pwdStrength.score ? pwdStrength.color : '#E5E5E5' }"
              ></div>
            </div>
            <span class="pwd-strength-label" :style="{ color: pwdStrength.color }">{{ pwdStrength.label }}</span>
          </div>

          <div class="form-check mb-3">
            <input id="tos" class="form-check-input" type="checkbox" v-model="agree" />
            <label class="form-check-label small" for="tos">
              I agree to the <a href="/terms" class="link">Terms of Service</a> and <a href="/privacy" class="link">Privacy Policy</a>
            </label>
          </div>

          <!-- Role Selector -->
          <div class="role-selector mb-3">
            <div class="role-label">I am joining as</div>
            <div class="role-tiles">
              <button
                type="button"
                class="role-tile"
                :class="{ 'role-tile--selected': role === 'athlete' }"
                @click="role = 'athlete'"
              >
                <i class="bi bi-person-running role-tile-icon"></i>
                <div class="role-tile-name">I'm an Athlete</div>
                <div class="role-tile-sub">Track workouts and follow plans</div>
              </button>
              <button
                type="button"
                class="role-tile"
                :class="{ 'role-tile--selected': role === 'coach' }"
                @click="role = 'coach'"
              >
                <i class="bi bi-clipboard2-pulse-fill role-tile-icon"></i>
                <div class="role-tile-name">I'm a Coach</div>
                <div class="role-tile-sub">Manage athletes and build plans</div>
              </button>
            </div>
          </div>

          <div v-if="error" class="alert alert-danger py-2 mb-3" role="alert">
            {{ error }}
          </div>

          <button
            class="btn btn-primary w-100"
            :disabled="!canSubmit || loading"
          >
            <span v-if="!loading">Create Account</span>
            <span v-else>
              <span class="spinner-border spinner-border-sm me-2"></span>
              Creating account...
            </span>
          </button>
        </form>

        <p class="text-center text-muted small mt-4 mb-0">
          Already have an account?
          <router-link to="/join-us" class="link">Sign in</router-link>
        </p>
      </div>
    </section>

    <!-- RIGHT: Visual with floating cards around text -->
    <section class="visual-side">
      <div class="visual-content">
        <!-- Floating Stat Cards (positioned around text) -->
        <div class="stat-card card-1">
          <div class="stat-icon">🏃</div>
          <div class="stat-value">127</div>
          <div class="stat-label">ACTIVITIES</div>
        </div>

        <div class="stat-card card-2">
          <div class="stat-icon">⚡</div>
          <div class="stat-value">8:42</div>
          <div class="stat-label">AVG PACE</div>
        </div>

        <div class="stat-card card-3">
          <div class="stat-icon">🔥</div>
          <div class="stat-value">24</div>
          <div class="stat-label">DAY STREAK</div>
        </div>

        <!-- Main Message (centered) -->
        <div class="visual-message">
          <h2 class="visual-title">
            Track every session.<br>
            Train with AI.<br>
            Connect with athletes.
          </h2>
          <p class="visual-subtitle">Join thousands who've simplified their training.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)

onMounted(() => {
  if (isAuthenticated.value) {
    router.replace(authStore.role === 'coach' ? '/coach/dashboard' : '/dashboard')
  }
  initGoogleSignIn()
})

const displayName = ref('')
const email = ref('')
const password = ref('')
const agree = ref(false)
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')
const role = ref('athlete')

// ── Password strength ─────────────────────────────────────────────────────────
const pwdStrength = computed(() => {
  const p = password.value
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { score, label: 'Weak',      color: '#DC2626' }
  if (score === 2) return { score, label: 'Fair',      color: '#f59e0b' }
  if (score === 3) return { score, label: 'Good',      color: '#0052FF' }
  return               { score, label: 'Strong',     color: '#16a34a' }
})

const canSubmit = computed(() =>
  displayName.value &&
  email.value &&
  pwdStrength.value.score >= 2 &&
  agree.value &&
  !loading.value
)

const submit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  error.value = ''
  
  try {
    await authStore.register(email.value, password.value, displayName.value, role.value)
    sessionStorage.setItem('needs_onboarding', 'true')
    router.push('/onboard')
  } catch (e) {
    error.value = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

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
        // Always go to onboarding — it will skip to dashboard if already complete
        sessionStorage.setItem('needs_onboarding', 'true')
        router.push('/onboard')
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

const onSocial = (provider) => {
  if (provider === 'google') {
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
}
</script>

<style scoped>
/* ===== Design Tokens ===== */
.register-page {
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

.register-container {
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
.register-page h1 {
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

/* Password Input with Toggle */
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

/* Checkbox */
.form-check-input {
  width: 18px;
  height: 18px;
  border: 2px solid #D1D5DB;
  border-radius: 0;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: #000;
  border-color: #000;
}

.form-check-label {
  color: #6B7280;
  margin-left: 8px;
  cursor: pointer;
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

/* Role Selector */
.role-selector { display: flex; flex-direction: column; gap: 8px; }
.role-label { font-size: 13px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; }
.role-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.role-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 14px 16px;
  border: 1.5px solid #E5E7EB;
  border-radius: 0;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}
.role-tile:hover:not(.role-tile--selected) { border-color: #000; }
.role-tile--selected { background: #000; border-color: #000; color: #fff; }
.role-tile-icon { font-size: 20px; margin-bottom: 2px; }
.role-tile--selected .role-tile-icon { color: #fff; }
.role-tile-name { font-size: 13px; font-weight: 700; letter-spacing: 0.02em; }
.role-tile-sub { font-size: 11px; color: #9CA3AF; line-height: 1.3; }
.role-tile--selected .role-tile-sub { color: rgba(255,255,255,0.65); }

/* Password strength */
.pwd-strength {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pwd-strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}
.pwd-bar {
  flex: 1;
  height: 4px;
  transition: background 0.2s;
}
.pwd-strength-label {
  font-size: 12px;
  font-weight: 700;
  min-width: 44px;
  text-align: right;
  transition: color 0.2s;
}

/* Alert */
.alert-danger {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 0;
  color: #DC2626;
  font-size: 14px;
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
  max-width: 600px;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

/* Visual Message (CENTERED) */
.visual-message {
  text-align: center;
  color: white;
  position: relative;
  z-index: 2;
}

.visual-title {
  font-size: 42px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 20px;
  letter-spacing: -0.02em;
}

.visual-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  line-height: 1.5;
}

/* Floating Stat Cards (POSITIONED AROUND TEXT) */
.stat-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 0;
  padding: 20px 28px;
  box-shadow: none;
  text-align: center;
  backdrop-filter: blur(10px);
  min-width: 120px;
  z-index: 1;
}

/* Card 1: Top Left (Activities) */
.card-1 {
  top: 15%;
  left: 5%;
  animation: float-1 6s ease-in-out infinite;
}

/* Card 2: Right Side (Avg Pace) */
.card-2 {
  top: 45%;
  right: 8%;
  animation: float-2 5s ease-in-out infinite;
  animation-delay: 1s;
}

/* Card 3: Bottom Left (Streak) */
.card-3 {
  bottom: 20%;
  left: 8%;
  animation: float-3 7s ease-in-out infinite;
  animation-delay: 2s;
}

.stat-icon {
  font-size: 36px;
  margin-bottom: 10px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.stat-value {
  font-size: 32px;
  font-weight: 800;
  color: #000;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6B7280;
  font-weight: 700;
}

/* Different float animations for variety */
@keyframes float-1 {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) translateX(10px) rotate(2deg);
  }
}

@keyframes float-2 {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) translateX(-8px) rotate(-2deg);
  }
}

@keyframes float-3 {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
  }
  50% {
    transform: translateY(-18px) translateX(12px) rotate(3deg);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 991px) {
  .register-page {
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
  .register-container {
    max-width: 100%;
  }
  
  .brand-mark {
    justify-content: center;
  }
  
  h1 {
    font-size: 24px;
  }
}
</style>