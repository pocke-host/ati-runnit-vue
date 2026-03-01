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
        <p class="text-muted mb-4">Track every workout. Train smarter. Connect with runners.</p>

        <!-- Social Buttons (Simplified) -->
        <div class="social-buttons mb-4">
          <button type="button" class="btn btn-social" @click="onSocial('google')">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.582c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.29C4.672 5.163 6.656 3.582 9 3.582z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
          <button type="button" class="btn btn-social" @click="onSocial('apple')">
            <i class="bi bi-apple"></i>
            Continue with Apple
          </button>
        </div>

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

          <div class="form-check mb-3">
            <input id="tos" class="form-check-input" type="checkbox" v-model="agree" />
            <label class="form-check-label small" for="tos">
              I agree to the <a href="/terms" class="link">Terms of Service</a> and <a href="/privacy" class="link">Privacy Policy</a>
            </label>
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
          <router-link to="/login" class="link">Sign in</router-link>
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
            Track every mile.<br>
            Train with AI.<br>
            Connect with runners.
          </h2>
          <p class="visual-subtitle">Join thousands who've simplified their training.</p>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const displayName = ref('')
const email = ref('')
const password = ref('')
const agree = ref(false)
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')

const canSubmit = computed(() =>
  displayName.value && 
  email.value && 
  password.value.length >= 8 && 
  agree.value && 
  !loading.value
)

const submit = async () => {
  if (!canSubmit.value) return
  loading.value = true
  error.value = ''
  
  try {
    await authStore.register(email.value, password.value, displayName.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e?.response?.data?.message || e?.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}

const onSocial = (provider) => {
  console.log(`Social signup: ${provider}`)
  // TODO: Implement OAuth flow
}
</script>

<style scoped>
/* ===== Design Tokens ===== */
.register-page {
  --r-olive: #5A6B4E;
  --r-olive-deep: #2C3726;
  --r-accent: #C46A2A;
  --r-offwhite: #F5F6F3;
  --r-white: #FFFFFF;
  
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
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
  border-radius: 12px;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
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
  color: var(--r-olive-deep);
}

/* Typography */
.register-page h1 {
  color: var(--r-olive-deep);
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
  border-radius: 10px;
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
  border-radius: 10px;
  padding: 0 16px;
  font-size: 15px;
  transition: all 0.2s ease;
}

.form-control::placeholder {
  color: #9CA3AF;
}

.form-control:focus {
  outline: none;
  border-color: var(--r-accent);
  box-shadow: 0 0 0 3px rgba(196, 106, 42, 0.1);
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
  border-radius: 4px;
  cursor: pointer;
}

.form-check-input:checked {
  background-color: var(--r-accent);
  border-color: var(--r-accent);
}

.form-check-label {
  color: #6B7280;
  margin-left: 8px;
  cursor: pointer;
}

/* Links */
.link {
  color: var(--r-accent);
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

/* Primary Button */
.btn-primary {
  height: 48px;
  background: var(--r-accent);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.01em;
  transition: all 0.2s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #a85722;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(196, 106, 42, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Alert */
.alert-danger {
  background: #FEF2F2;
  border: 1px solid #FCA5A5;
  border-radius: 8px;
  color: #DC2626;
  font-size: 14px;
}

/* ===== RIGHT SIDE: Visual ===== */
.visual-side {
  position: relative;
  background: linear-gradient(135deg, var(--r-olive) 0%, var(--r-olive-deep) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  overflow: hidden;
}

/* Subtle grid pattern */
.visual-side::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.08;
  background: 
    repeating-linear-gradient(
      0deg,
      rgba(255, 255, 255, 0.05) 0px,
      transparent 1px,
      transparent 40px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.05) 0px,
      transparent 1px,
      transparent 40px
    );
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
  border-radius: 16px;
  padding: 20px 28px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
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
  color: var(--r-olive-deep);
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