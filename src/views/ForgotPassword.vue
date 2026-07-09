<template>
  <main class="fp-page">

    <!-- Ticker -->
    <div class="fp-ticker" aria-hidden="true">
      <div class="fp-ticker-track">
        <span>&nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
        <span aria-hidden="true">&nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;★ NO OFF-SEASON &nbsp;★ MILES ARE BETTER SHARED &nbsp;★ DRAG YOUR CREW OUT AT 6AM &nbsp;★ BRING THE FRIEND WHO ALWAYS FLAKES &nbsp;</span>
      </div>
    </div>

    <!-- Logo bar -->
    <div class="fp-logo-bar">
      <span class="fp-logo-text">RUNNIT<span class="fp-logo-dot">.</span></span>
    </div>

    <!-- Card -->
    <div class="fp-body">

      <!-- Success state -->
      <div v-if="sent" class="fp-success">
        <div class="fp-success-icon">✓</div>
        <h1 class="fp-headline">Check your inbox.</h1>
        <p class="fp-sub">
          If <strong>{{ submittedEmail }}</strong> is registered, a reset link is on its way.
          Check your spam folder if you don't see it within a minute.
        </p>
        <router-link to="/join-us" class="fp-btn fp-btn--full">Back to sign in →</router-link>
      </div>

      <!-- Form state -->
      <template v-else>
        <router-link to="/join-us" class="fp-back">← Back to sign in</router-link>
        <h1 class="fp-headline">Reset your password.</h1>
        <p class="fp-sub">Enter your email and we'll send a reset link your way.</p>

        <form @submit.prevent="submit" novalidate>
          <div class="fp-field">
            <label class="fp-label" for="email">Email</label>
            <input
              id="email"
              v-model.trim="email"
              type="email"
              class="fp-input"
              placeholder="you@email.com"
              required
              autocomplete="email"
              autofocus
            />
          </div>

          <div v-if="error" class="fp-error">{{ error }}</div>

          <button class="fp-btn fp-btn--full" :disabled="loading || !email" type="submit">
            <span v-if="!loading">Send Reset Link</span>
            <span v-else class="fp-spinner-row">
              <span class="fp-spinner"></span>Sending…
            </span>
          </button>
        </form>
      </template>

    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const email = ref('')
const loading = ref(false)
const error = ref('')
const sent = ref(false)
const submittedEmail = ref('')

const submit = async () => {
  if (!email.value) return
  loading.value = true
  error.value = ''
  try {
    await axios.post(`${API_URL}/auth/forgot-password`, { email: email.value })
    submittedEmail.value = email.value
    sent.value = true
  } catch (e) {
    error.value = e?.response?.data?.error || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@keyframes rkMarq { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes spin { to { transform: rotate(360deg) } }

.fp-page {
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
.fp-ticker {
  width: 100%;
  background: #16130F;
  border-bottom: 3px solid #2A55F5;
  overflow: hidden;
  flex-shrink: 0;
}
.fp-ticker-track {
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
@media (prefers-reduced-motion: reduce) { .fp-ticker-track { animation: none; } }

/* Logo bar */
.fp-logo-bar {
  width: 100%;
  padding: 18px 32px;
  border-bottom: 2px solid #16130F;
  display: flex;
  align-items: center;
}
.fp-logo-text {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-style: italic;
  font-size: 1.4rem;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #16130F;
}
.fp-logo-dot { color: #2A55F5; }

/* Card body */
.fp-body {
  width: 100%;
  max-width: 440px;
  padding: 44px 24px 60px;
}

.fp-back {
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
.fp-back:hover { color: #2A55F5; }

.fp-headline {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(2.4rem, 7vw, 3.2rem);
  line-height: 0.85;
  text-transform: uppercase;
  margin: 0 0 16px;
  color: #16130F;
}

.fp-sub {
  font-size: 1rem;
  line-height: 1.6;
  color: #5a5348;
  margin: 0 0 32px;
}
.fp-sub strong { color: #16130F; font-weight: 700; }

/* Fields */
.fp-field { margin-bottom: 18px; }
.fp-label {
  display: block;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5a5348;
  margin-bottom: 7px;
}
.fp-input {
  width: 100%;
  height: 48px;
  border: 2px solid #16130F;
  background: #fff;
  padding: 0 14px;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-size: 0.95rem;
  color: #16130F;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.15s;
}
.fp-input:focus { border-color: #2A55F5; }
.fp-input::placeholder { color: #8a8a8a; }

/* Error */
.fp-error {
  background: #FEF2F2;
  border: 2px solid #FCA5A5;
  color: #DC2626;
  font-size: 0.85rem;
  padding: 10px 14px;
  margin-bottom: 16px;
}

/* Button */
.fp-btn {
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
.fp-btn:hover:not(:disabled) { background: #1E42D6; color: #fff; }
.fp-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
.fp-btn--full { width: 100%; margin-top: 4px; }

.fp-spinner-row { display: flex; align-items: center; gap: 8px; }
.fp-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* Success state */
.fp-success { text-align: center; }
.fp-success-icon {
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

@media (max-width: 640px) {
  .fp-logo-bar { padding: 14px 18px; }
  .fp-body { padding: 32px 18px 48px; }
}
</style>
