<template>
  <main class="waitlist-page">

    <!-- 001 HERO ─ black -->
    <section class="hero">
      <div class="hero-inner">
        <SectionIndex :num="1" label="Waitlist" :on-dark="true" />
        <h1 class="hero-h1">CLAIM YOUR HANDLE.</h1>
        <p class="hero-sub">Be first in when we open your city. No spam — just the green light and your @name held.</p>
      </div>
    </section>

    <!-- FORM SECTION ─ white -->
    <section class="form-section">
      <div class="form-inner">

        <!-- syncs row -->
        <div class="syncs-row">
          <span class="syncs-label">Syncs With</span>
          <span class="syncs-app">STRAVA</span>
          <span class="syncs-slash">/</span>
          <span class="syncs-app">GARMIN</span>
          <span class="syncs-slash">/</span>
          <span class="syncs-app">APPLE HEALTH</span>
        </div>

        <!-- form card -->
        <div v-if="!submitted" class="form-card">
          <form @submit.prevent="submit" class="waitlist-form" novalidate>

            <div class="field-group">
              <label class="field-label" for="wl-email">Email</label>
              <input
                id="wl-email"
                v-model.trim="form.email"
                type="email"
                class="field-input"
                :class="{ 'field-error': errors.email }"
                placeholder="you@email.com"
                autocomplete="email"
              />
              <p v-if="errors.email" class="field-err-msg">{{ errors.email }}</p>
            </div>

            <div class="field-group">
              <label class="field-label" for="wl-handle">Desired Handle</label>
              <input
                id="wl-handle"
                v-model.trim="form.handle"
                type="text"
                class="field-input"
                placeholder="@yourname"
                autocomplete="username"
              />
            </div>

            <div class="field-group">
              <label class="field-label" for="wl-city">City</label>
              <input
                id="wl-city"
                v-model.trim="form.city"
                type="text"
                class="field-input"
                placeholder="Where you run"
                autocomplete="address-level2"
              />
            </div>

            <p v-if="serverError" class="server-error">{{ serverError }}</p>

            <button type="submit" class="btn-submit" :disabled="loading">
              <span v-if="loading" class="btn-spinner"></span>
              <span v-else>Join the Waitlist</span>
            </button>

          </form>
        </div>

        <!-- SUCCESS -->
        <div v-else class="success-card">
          <div class="success-label">You're on the list.</div>
          <p class="success-body">We'll reach out as soon as beta access opens in your city.</p>
          <router-link to="/" class="btn-ghost">Back to home</router-link>
        </div>

      </div>
    </section>

    <!-- PROOF STRIP -->
    <section class="proof-section">
      <div class="form-inner">
        <div class="proof-strip">
          <div class="proof-cell">
            <div class="proof-label">On The List</div>
            <div class="proof-val">12,400</div>
          </div>
          <div class="proof-cell">
            <div class="proof-label">Cities</div>
            <div class="proof-val">38</div>
          </div>
          <div class="proof-cell proof-cell--last">
            <div class="proof-label">Launching</div>
            <div class="proof-val">SUMMER '26</div>
          </div>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useHead } from '@unhead/vue'
import SectionIndex from '@/components/SectionIndex.vue'

useHead({
  title: 'Join the Waitlist — Runnit',
  link: [{ rel: 'canonical', href: 'https://runnit.live/waitlist' }],
  meta: [
    { name: 'description', content: 'Claim your handle before someone else does. Join the Runnit waitlist and get early access when we open your city.' },
    { property: 'og:title', content: 'Claim Your Handle — Runnit Waitlist' },
    { property: 'og:url', content: 'https://runnit.live/waitlist' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const form = reactive({ email: '', handle: '', city: '' })
const errors = reactive({ email: '' })
const loading = ref(false)
const submitted = ref(false)
const serverError = ref('')

function validate() {
  errors.email = ''
  if (!form.email) { errors.email = 'Email is required.'; return false }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { errors.email = 'Enter a valid email.'; return false }
  return true
}

async function submit() {
  if (!validate()) return
  loading.value = true
  serverError.value = ''
  try {
    const res = await fetch(`${API_URL}/newsletter/waitlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        name: form.handle || undefined,
        city: form.city || undefined,
      }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      serverError.value = data.error || 'Something went wrong. Try again.'
      return
    }
    submitted.value = true
  } catch {
    serverError.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.waitlist-page {
  min-height: 100vh;
  background: #fff;
  font-family: Futura, 'Futura PT', 'Avenir Next', Avenir, 'Jost', system-ui, sans-serif;
  color: #000;
}

/* ── HERO ── */
.hero {
  background: #000;
  color: #fff;
  padding: 92px 0 80px;
  text-align: center;
}
.hero-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.hero-h1 {
  font-size: clamp(2.6rem, 6vw, 4.125rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.96;
  margin: 18px 0 0;
  animation: rkWipe 0.85s cubic-bezier(0.65,0,0.35,1) 0.08s both;
}
.hero-sub {
  max-width: 460px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  font-size: 1rem;
  margin: 22px auto 0;
  animation: rkRise 0.6s ease-out 0.3s both;
}

/* ── FORM SECTION ── */
.form-section {
  padding: 64px 24px 80px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.form-inner {
  width: 100%;
  max-width: 440px;
}

.syncs-row {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 32px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  flex-wrap: wrap;
}
.syncs-label {
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(0,0,0,0.5);
}
.syncs-app {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(0,0,0,0.55);
}
.syncs-slash { color: rgba(0,0,0,0.25); }

.form-card {
  border: 1px solid #E5E5E5;
  padding: 32px;
  animation: rkRise 0.6s ease-out 0.15s both;
}

.waitlist-form { display: flex; flex-direction: column; gap: 0; }

.field-group { margin-bottom: 18px; }
.field-group:last-of-type { margin-bottom: 24px; }

.field-label {
  display: block;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 8px;
}

.field-input {
  display: block;
  width: 100%;
  border: 1px solid #E5E5E5;
  padding: 13px 14px;
  font-family: inherit;
  font-size: 0.95rem;
  color: #000;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}
.field-input:focus { border-color: #000; }
.field-input.field-error { border-color: #dc2626; }
.field-input::placeholder { color: #767676; }
.field-err-msg {
  font-size: 0.75rem;
  color: #dc2626;
  margin: 6px 0 0;
}

.server-error {
  font-size: 0.8rem;
  color: #dc2626;
  margin-bottom: 16px;
}

.btn-submit {
  display: block;
  width: 100%;
  text-align: center;
  background: #0052FF;
  color: #fff;
  border: 2px solid #0052FF;
  padding: 14px 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  position: relative;
}
.btn-submit:hover:not(:disabled) { background: #003ECC; border-color: #003ECC; }
.btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* SUCCESS */
.success-card {
  border: 1px solid #E5E5E5;
  padding: 40px 32px;
  text-align: center;
}
.success-label {
  font-size: 1.2rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}
.success-body {
  color: #767676;
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 24px;
}
.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 11px 20px;
  background: transparent;
  color: #000;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid #E5E5E5;
  transition: border-color 0.15s;
}
.btn-ghost:hover { border-color: #000; text-decoration: none; }

/* ── PROOF STRIP ── */
.proof-section {
  padding: 0 24px 80px;
  background: #fff;
  display: flex;
  justify-content: center;
}
.proof-strip {
  width: 100%;
  max-width: 440px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #E5E5E5;
  animation: rkRise 0.6s ease-out 0.25s both;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.proof-cell {
  padding: 28px 24px;
  border-right: 1px solid #E5E5E5;
  text-align: center;
}
.proof-cell--last { border-right: none; }
.proof-label {
  font-size: 0.58rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 8px;
}
.proof-val {
  font-size: 1.3rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

@media (max-width: 640px) {
  /* Hero */
  .hero { padding: 56px 0 52px; }
  .hero-inner { padding-left: 22px; padding-right: 22px; }
  .hero-h1 { font-size: 40px !important; line-height: 0.96; }
  .hero-sub { font-size: 0.95rem; }

  /* Form section */
  .form-section { padding: 44px 22px 56px; }
  .form-inner { max-width: 100%; }

  /* Syncs row — label on own line, apps wrap below */
  .syncs-row {
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px 12px;
  }
  .syncs-label { width: 100%; text-align: center; }

  /* Form card */
  .form-card { padding: 26px 22px; }
  .field-input { min-height: 44px; }
  .btn-submit { min-height: 44px; padding: 15px 0; }

  /* Proof strip */
  .proof-section { padding: 0 22px 44px; }
  .proof-cell { padding: 22px 10px; }
  .proof-label { font-size: 0.54rem; }
  .proof-val { font-size: 1.1rem; }
}
</style>
