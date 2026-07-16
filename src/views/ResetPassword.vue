<template>
  <main class="rp-page">

    <!-- Ticker -->
    <div class="rp-ticker" aria-hidden="true">
      <div class="rp-ticker-track">
        <span>&nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
        <span aria-hidden="true">&nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
      </div>
    </div>

    <!-- Logo bar -->
    <div class="rp-logo-bar">
      <span class="rp-logo-text">RUNNIT<span class="rp-logo-dot">.</span></span>
    </div>

    <!-- Card -->
    <div class="rp-body">

      <!-- Invalid token -->
      <div v-if="!token" class="rp-state">
        <div class="rp-state-icon rp-state-icon--warn">!</div>
        <h1 class="rp-headline">Bad link.</h1>
        <p class="rp-sub">This reset link is missing a token. Request a new one below.</p>
        <router-link to="/forgot-password" class="rp-btn rp-btn--full">Request New Link</router-link>
      </div>

      <!-- Success state -->
      <div v-else-if="done" class="rp-state">
        <div class="rp-state-icon">✓</div>
        <h1 class="rp-headline">You're all set.</h1>
        <p class="rp-sub">Your password has been updated. Sign in with your new credentials.</p>
        <router-link to="/signin" class="rp-btn rp-btn--full">Sign In →</router-link>
      </div>

      <!-- Form state -->
      <template v-else>
        <router-link to="/forgot-password" class="rp-back">← Back to reset</router-link>
        <h1 class="rp-headline">Set new password.</h1>
        <p class="rp-sub">Choose something strong. You'll be running again in no time.</p>

        <form @submit.prevent="submit" novalidate>

          <!-- New password -->
          <div class="rp-field">
            <label class="rp-label" for="rp-pwd">New Password</label>
            <div class="rp-pwd-wrap">
              <input
                id="rp-pwd"
                :type="showPwd ? 'text' : 'password'"
                v-model="password"
                class="rp-input"
                placeholder="Min 8 characters"
                minlength="8"
                required
                autocomplete="new-password"
              />
              <button
                type="button"
                class="rp-eye"
                @click="showPwd = !showPwd"
                :aria-label="showPwd ? 'Hide password' : 'Show password'"
              >
                <svg v-if="showPwd" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Strength meter -->
          <div v-if="password.length > 0" class="rp-strength">
            <div class="rp-strength-bars">
              <div
                v-for="i in 4"
                :key="i"
                class="rp-strength-bar"
                :class="{ 'rp-strength-bar--on': i <= pwdStrength.score }"
                :style="i <= pwdStrength.score ? { background: pwdStrength.color } : {}"
              ></div>
            </div>
            <span class="rp-strength-label" :style="{ color: pwdStrength.color }">{{ pwdStrength.label }}</span>
          </div>

          <!-- Confirm password -->
          <div class="rp-field">
            <label class="rp-label" for="rp-confirm">Confirm Password</label>
            <input
              id="rp-confirm"
              :type="showPwd ? 'text' : 'password'"
              v-model="confirm"
              class="rp-input"
              :class="{ 'rp-input--mismatch': confirm.length > 0 && confirm !== password }"
              placeholder="Same as above"
              required
              autocomplete="new-password"
            />
            <p v-if="confirm.length > 0 && confirm !== password" class="rp-mismatch">Passwords don't match</p>
          </div>

          <div v-if="error" class="rp-error">{{ error }}</div>

          <button class="rp-btn rp-btn--full" :disabled="loading || !canSubmit" type="submit">
            <span v-if="!loading">Update Password</span>
            <span v-else class="rp-spinner-row">
              <span class="rp-spinner"></span>Updating…
            </span>
          </button>

        </form>
      </template>

    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const route = useRoute()

const token = ref('')
const password = ref('')
const confirm = ref('')
const showPwd = ref(false)
const loading = ref(false)
const error = ref('')
const done = ref(false)

onMounted(() => {
  token.value = route.query.token || ''
})

const pwdStrength = computed(() => {
  const p = password.value
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { score, label: 'Weak',   color: '#DC2626' }
  if (score === 2) return { score, label: 'Fair',   color: '#f59e0b' }
  if (score === 3) return { score, label: 'Good',   color: '#0052FF' }
  return               { score, label: 'Strong', color: '#16a34a' }
})

const canSubmit = computed(() =>
  password.value.length >= 8 &&
  password.value === confirm.value &&
  !loading.value
)

const submit = async () => {
  error.value = ''
  if (password.value !== confirm.value) {
    error.value = 'Passwords do not match.'
    return
  }
  loading.value = true
  try {
    await axios.post(`${API_URL}/auth/reset-password`, {
      token: token.value,
      newPassword: password.value
    })
    done.value = true
  } catch (e) {
    error.value = e?.response?.data?.error || 'This link may have expired. Please request a new one.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes rkMarq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes spin { to { transform: rotate(360deg) } }

.rp-page {
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
.rp-ticker {
  width: 100%;
  background: #16130F;
  border-bottom: 3px solid #2A55F5;
  overflow: hidden;
  flex-shrink: 0;
}
.rp-ticker-track {
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
@media (prefers-reduced-motion: reduce) { .rp-ticker-track { animation: none; } }

/* Logo bar */
.rp-logo-bar {
  width: 100%;
  padding: 18px 32px;
  border-bottom: 2px solid #16130F;
  display: flex;
  align-items: center;
}
.rp-logo-text {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.4rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #16130F;
}
.rp-logo-dot { color: #2A55F5; }

/* Card body */
.rp-body {
  width: 100%;
  max-width: 440px;
  padding: 44px 24px 60px;
}

.rp-back {
  display: inline-block;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5a5348;
  text-decoration: none;
  margin-bottom: 28px;
}
.rp-back:hover { color: #2A55F5; }

.rp-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.4rem, 7vw, 3.2rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0 0 16px;
  color: #16130F;
}

.rp-sub {
  font-size: 1rem;
  line-height: 1.6;
  color: #5a5348;
  margin: 0 0 32px;
}

/* Fields */
.rp-field { margin-bottom: 18px; }
.rp-label {
  display: block;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5a5348;
  margin-bottom: 7px;
}
.rp-pwd-wrap { position: relative; }
.rp-input {
  width: 100%;
  height: 48px;
  border: 2px solid #16130F;
  background: #fff;
  padding: 0 44px 0 14px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.95rem;
  color: #16130F;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.rp-input:focus { border-color: #2A55F5; }
.rp-input::placeholder { color: #8a8a8a; }
.rp-input--mismatch { border-color: #DC2626; }

.rp-mismatch {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #DC2626;
  margin: 5px 0 0;
}

.rp-eye {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #5a5348;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}
.rp-eye:hover { color: #16130F; }

/* Strength bars */
.rp-strength {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: -8px 0 18px;
}
.rp-strength-bars { display: flex; gap: 5px; flex: 1; }
.rp-strength-bar {
  flex: 1;
  height: 4px;
  background: #E7DFCE;
  border: 1px solid #16130F;
  transition: background 0.2s;
}
.rp-strength-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  min-width: 44px;
  text-align: right;
}

/* Error */
.rp-error {
  background: #FEF2F2;
  border: 2px solid #FCA5A5;
  color: #DC2626;
  font-size: 0.85rem;
  padding: 10px 14px;
  margin-bottom: 16px;
}

/* Button */
.rp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  text-decoration: none;
  box-shadow: 4px 4px 0 #16130F;
  cursor: pointer;
  transition: background 0.15s;
}
.rp-btn:hover:not(:disabled) { background: #1E42D6; color: #fff; }
.rp-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
.rp-btn--full { width: 100%; margin-top: 4px; }

.rp-spinner-row { display: flex; align-items: center; gap: 8px; }
.rp-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* State screens (invalid token / success) */
.rp-state { text-align: center; }
.rp-state-icon {
  width: 52px;
  height: 52px;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  box-shadow: 3px 3px 0 #16130F;
  font-size: 1.4rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}
.rp-state-icon--warn { background: #DC2626; }

@media (max-width: 640px) {
  .rp-logo-bar { padding: 14px 18px; }
  .rp-body { padding: 32px 18px 48px; }
}
</style>
