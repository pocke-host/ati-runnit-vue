<template>
  <main class="register-page">

    <!-- LEFT: Form panel -->
    <section class="gr-form-side">
      <div class="gr-form-container">
        <h1 class="gr-form-headline">Create your account.</h1>
        <p class="gr-form-copy">Log every mile. Chase your crew. Post the receipts.</p>

        <!-- Social Buttons -->
        <div class="gr-social-btns">
          <button type="button" class="gr-social-btn" @click="onSocial('google')" :disabled="googleLoading">
            <span v-if="googleLoading" class="gr-spinner"></span>
            <svg v-else width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z" fill="#EA4335"/>
            </svg>
            {{ googleLoading ? 'Signing in…' : 'Continue with Google' }}
          </button>
          <button type="button" class="gr-social-btn" disabled style="opacity:0.45;cursor:not-allowed">
            <i class="bi bi-apple"></i>
            Continue with Apple
          </button>
        </div>
        <div v-if="googleError" class="gr-error-msg">{{ googleError }}</div>

        <div class="gr-divider"><span>or</span></div>

        <!-- Email Form -->
        <form @submit.prevent="submit" novalidate class="gr-form">
          <div class="gr-field">
            <label class="gr-field-label" for="displayName">Full name</label>
            <input
              id="displayName"
              v-model.trim="displayName"
              type="text"
              class="gr-input"
              placeholder="Jordan Rivera"
              required
              autofocus
              autocomplete="name"
            />
          </div>
          <div class="gr-field">
            <label class="gr-field-label" for="email">Email</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              class="gr-input"
              placeholder="you@email.com"
              required
              autocomplete="email"
            />
          </div>
          <div class="gr-field">
            <label class="gr-field-label" for="password">Password</label>
            <div class="gr-password-wrap">
              <input
                :type="showPwd ? 'text' : 'password'"
                id="password"
                v-model="password"
                class="gr-input"
                placeholder="Min 8 characters"
                minlength="8"
                required
                autocomplete="new-password"
              />
              <button class="gr-pwd-toggle" type="button" @click="showPwd = !showPwd" aria-label="Toggle password visibility">
                <i :class="showPwd ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="password.length > 0" class="gr-pwd-strength">
            <div class="gr-pwd-bars">
              <div v-for="i in 4" :key="i" class="gr-pwd-bar" :style="{ background: i <= pwdStrength.score ? pwdStrength.color : '#E7DFCE' }"></div>
            </div>
            <span class="gr-pwd-label" :style="{ color: pwdStrength.color }">{{ pwdStrength.label }}</span>
          </div>

          <label class="gr-tos-label" @click="agree = !agree">
            <span class="gr-tos-check" :class="{ 'gr-tos-check--checked': agree }">
              <span v-if="agree">✓</span>
            </span>
            I agree to the <a href="/terms" class="gr-tos-link" @click.stop>Terms of Service</a> and <a href="/privacy" class="gr-tos-link" @click.stop>Privacy Policy</a>
          </label>

          <div class="gr-role-label-text">I'm joining as</div>
          <div class="gr-role-tiles">
            <button type="button" class="gr-role-tile" :class="{ 'gr-role-tile--active': role === 'athlete' }" @click="role = 'athlete'">
              <div class="gr-role-name">Athlete</div>
              <div class="gr-role-sub">Track workouts &amp; follow plans</div>
            </button>
            <button type="button" class="gr-role-tile" :class="{ 'gr-role-tile--active': role === 'coach' }" @click="role = 'coach'">
              <div class="gr-role-name">Coach</div>
              <div class="gr-role-sub">Manage athletes &amp; build plans</div>
            </button>
          </div>

          <div v-if="error" class="gr-error-msg" role="alert">{{ error }}</div>

          <button class="gr-submit-btn" :disabled="!canSubmit || loading">
            <span v-if="!loading">Create Account →</span>
            <span v-else class="gr-submit-loading"><span class="gr-spinner"></span>Creating account…</span>
          </button>
        </form>

        <p class="gr-signin-link">Already have an account? <router-link to="/join-us" class="gr-signin-link-a">Sign in</router-link></p>
      </div>
    </section>

    <!-- RIGHT: Proof panel -->
    <section class="gr-proof-side">
      <div class="gr-proof-content">
        <span class="gr-proof-badge">Proof or it didn't happen</span>
        <h2 class="gr-proof-headline">Every mile,<br>on the record.</h2>
        <p class="gr-proof-copy">Join thousands of athletes logging their sessions, chasing crowns, and dragging their crew out at dawn.</p>

        <div class="gr-stamps-cluster">
          <!-- Receipt card -->
          <div class="gr-receipt-card">
            <div class="gr-receipt-header">
              <div class="gr-receipt-avatar">MK</div>
              <div>
                <div class="gr-receipt-name">Morning Long Run</div>
                <div class="gr-receipt-handle">@maya.k</div>
              </div>
            </div>
            <div class="gr-receipt-map">
              <svg viewBox="0 0 280 96" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">
                <path d="M16,76 C60,40 80,66 120,50 C165,32 190,58 230,30 C250,18 264,34 272,26" fill="none" stroke="#2A55F5" stroke-width="3" stroke-dasharray="500" stroke-dashoffset="0"></path>
                <circle cx="272" cy="26" r="4" fill="#2A55F5"></circle>
              </svg>
            </div>
            <div class="gr-receipt-stats">
              <div class="gr-receipt-stat">
                <div class="gr-receipt-stat-lbl">DIST</div>
                <div class="gr-receipt-stat-val">13.1</div>
              </div>
              <div class="gr-receipt-stat gr-receipt-stat--div">
                <div class="gr-receipt-stat-lbl">PACE</div>
                <div class="gr-receipt-stat-val">7:22</div>
              </div>
              <div class="gr-receipt-stat gr-receipt-stat--div">
                <div class="gr-receipt-stat-lbl">TIME</div>
                <div class="gr-receipt-stat-val">1:36</div>
              </div>
            </div>
          </div>
          <!-- Streak stamp -->
          <div class="gr-stamp gr-stamp--streak">
            <div class="gr-stamp-big">24</div>
            <div class="gr-stamp-lbl">Day Streak</div>
          </div>
          <!-- Avg pace stamp -->
          <div class="gr-stamp gr-stamp--pace">
            <div class="gr-stamp-big">8:42</div>
            <div class="gr-stamp-lbl">Avg Pace</div>
          </div>
          <!-- PR chip -->
          <div class="gr-pr-chip">★ New PR</div>
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
@keyframes rkDraw { to { stroke-dashoffset: 0; } }

.register-page {
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  min-height: 100vh;
  padding-top: var(--nav-h, 66px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #FBF6EC;
  color: #16130F;
}

/* ── LEFT: Form ── */
.gr-form-side {
  border-right: 2px solid #16130F;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #FBF6EC;
}
.gr-form-container {
  width: 100%;
  max-width: 420px;
}
.gr-form-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 3rem;
  line-height: 0.82;
  text-transform: uppercase;
  color: #16130F;
  margin: 0 0 12px;
}
.gr-form-copy {
  font-size: 1rem;
  color: #5a5348;
  margin: 0 0 26px;
}

/* Social buttons */
.gr-social-btns { display: flex; flex-direction: column; gap: 12px; margin-bottom: 0; }
.gr-social-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 2px solid #16130F;
  background: #fff;
  padding: 14px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.92rem;
  color: #16130F;
  cursor: pointer;
  transition: background 0.12s;
}
.gr-social-btn:hover:not(:disabled) { background: #F1EADC; }

/* Divider */
.gr-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 22px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.66rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #a89e88;
}
.gr-divider::before, .gr-divider::after {
  content: '';
  flex: 1;
  height: 2px;
  background: #E7DFCE;
}

/* Form */
.gr-form { display: flex; flex-direction: column; gap: 12px; }
.gr-field { display: flex; flex-direction: column; gap: 6px; }
.gr-field-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5a5348;
}
.gr-input {
  border: 2px solid #16130F;
  background: #fff;
  padding: 13px 14px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.92rem;
  color: #16130F;
  width: 100%;
  outline: none;
  transition: border-color 0.15s;
}
.gr-input:focus { border-color: #2A55F5; }
.gr-input::placeholder { color: #8a8a8a; }

/* Password */
.gr-password-wrap { position: relative; }
.gr-password-wrap .gr-input { padding-right: 48px; }
.gr-pwd-toggle {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #5a5348;
  font-size: 1rem;
  padding: 0;
}

/* Pwd strength */
.gr-pwd-strength { display: flex; align-items: center; gap: 8px; }
.gr-pwd-bars { display: flex; gap: 4px; flex: 1; }
.gr-pwd-bar { height: 4px; flex: 1; background: #E7DFCE; transition: background 0.2s; }
.gr-pwd-label { font-family: 'Spline Sans Mono', ui-monospace, monospace; font-size: 0.6rem; font-weight: 700; text-transform: uppercase; }

/* ToS */
.gr-tos-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.86rem;
  cursor: pointer;
  line-height: 1.4;
}
.gr-tos-check {
  width: 20px;
  height: 20px;
  border: 2px solid #16130F;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  flex-shrink: 0;
  transition: background 0.15s;
  color: #fff;
}
.gr-tos-check--checked { background: #2A55F5; border-color: #2A55F5; }
.gr-tos-link { font-weight: 800; color: #2A55F5; text-decoration: none; }
.gr-tos-link:hover { color: #1E42D6; }

/* Role selector */
.gr-role-label-text {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5a5348;
}
.gr-role-tiles { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.gr-role-tile {
  border: 2px solid #16130F;
  background: #fff;
  padding: 18px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}
.gr-role-tile--active { background: #16130F; color: #FBF6EC; box-shadow: 3px 3px 0 #2A55F5; }
.gr-role-name {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  text-transform: uppercase;
  line-height: 0.9;
}
.gr-role-sub { font-size: 0.78rem; color: inherit; opacity: 0.65; margin-top: 6px; }
.gr-role-tile--active .gr-role-sub { opacity: 0.65; color: #FBF6EC; }

/* Submit */
.gr-submit-btn {
  width: 100%;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 16px 0;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-weight: 800;
  font-size: 0.82rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 4px 4px 0 #16130F;
  transition: background 0.15s;
}
.gr-submit-btn:hover:not(:disabled) { background: #1E42D6; }
.gr-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.gr-submit-loading { display: flex; align-items: center; justify-content: center; gap: 8px; }

/* Error */
.gr-error-msg {
  background: #fef2f2;
  border: 2px solid #dc2626;
  color: #dc2626;
  padding: 10px 14px;
  font-size: 0.85rem;
}

/* Sign-in link */
.gr-signin-link { text-align: center; font-size: 0.88rem; color: #5a5348; margin-top: 18px; margin-bottom: 0; }
.gr-signin-link-a { font-weight: 800; color: #2A55F5; text-decoration: none; }
.gr-signin-link-a:hover { color: #1E42D6; }

/* Spinner */
.gr-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: grSpin 0.75s linear infinite;
}
@keyframes grSpin { to { transform: rotate(360deg); } }

/* ── RIGHT: Proof panel ── */
.gr-proof-side {
  background: #16130F;
  color: #FBF6EC;
  padding: 44px 48px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.gr-proof-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.gr-proof-badge {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 12px;
  transform: rotate(-2deg);
  align-self: flex-start;
  margin-bottom: 20px;
}
.gr-proof-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: 3.6rem;
  line-height: 0.84;
  text-transform: uppercase;
  margin: 0 0 18px;
  color: #FBF6EC;
}
.gr-proof-copy {
  font-size: 1rem;
  line-height: 1.55;
  color: rgba(251,246,236,0.68);
  max-width: 400px;
  margin: 0;
}

/* Stamps cluster */
.gr-stamps-cluster {
  position: relative;
  flex: 1;
  margin-top: 36px;
  min-height: 320px;
}

/* Receipt card */
.gr-receipt-card {
  position: absolute;
  left: 0;
  top: 20px;
  width: 260px;
  background: #FBF6EC;
  color: #16130F;
  border: 2px solid #FBF6EC;
  transform: rotate(-4deg);
  box-shadow: 8px 8px 0 rgba(0,0,0,0.35);
}
.gr-receipt-header {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-bottom: 2px solid #16130F;
}
.gr-receipt-avatar {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #2A55F5;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.64rem;
  flex-shrink: 0;
}
.gr-receipt-name { font-weight: 800; font-size: 0.78rem; }
.gr-receipt-handle {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  color: #8a8a8a;
  margin-top: 2px;
}
.gr-receipt-map {
  height: 80px;
  background: #EDE5D5;
  position: relative;
  border-bottom: 2px solid #16130F;
  overflow: hidden;
}
.gr-receipt-stats {
  display: flex;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
}
.gr-receipt-stat {
  flex: 1;
  padding: 10px 12px;
}
.gr-receipt-stat--div { border-left: 2px solid #16130F; }
.gr-receipt-stat-lbl { font-size: 0.46rem; letter-spacing: 0.1em; color: #8a8a8a; }
.gr-receipt-stat-val {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 1.2rem;
  font-weight: 800;
}

/* Streak stamp */
.gr-stamp {
  position: absolute;
  text-align: center;
  box-shadow: 6px 6px 0 rgba(0,0,0,0.35);
}
.gr-stamp--streak {
  right: 30px;
  top: 0;
  width: 140px;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #FBF6EC;
  transform: rotate(5deg);
  padding: 18px 16px;
}
.gr-stamp--pace {
  right: 0;
  bottom: 24px;
  width: 150px;
  background: #FFC53D;
  color: #16130F;
  border: 2px solid #FBF6EC;
  transform: rotate(-3deg);
  padding: 18px 16px;
}
.gr-stamp-big {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-size: 3rem;
  font-weight: 900;
  line-height: 0.8;
}
.gr-stamp-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.56rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-top: 6px;
}

/* PR chip */
.gr-pr-chip {
  position: absolute;
  left: 70px;
  bottom: 40px;
  background: #16130F;
  color: #FFC53D;
  border: 2px solid #FFC53D;
  transform: rotate(4deg);
  padding: 9px 14px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

@media (max-width: 900px) {
  .register-page { grid-template-columns: 1fr; }
  .gr-proof-side { display: none; }
  .gr-form-side { border-right: none; padding: 60px 20px; }
}
</style>
