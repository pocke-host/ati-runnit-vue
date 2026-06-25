<template>
  <main class="waitlist-page">

    <!-- HERO -->
    <section class="hero">
      <div class="hero-inner">
        <p class="hero-kicker">BETA — COMING SOON</p>
        <h1 class="hero-headline">Train together.<br>Race further.</h1>
        <p class="hero-sub">
          Runnit is a social fitness app built for athletes who want more than a leaderboard.
          GPS tracking, club runs, training plans, and a community that actually shows up.
        </p>
        <p class="hero-fine">Join the waitlist — early access drops this summer.</p>
      </div>
    </section>

    <!-- FORM -->
    <section class="form-section">
      <div class="form-inner">

        <div v-if="!submitted" class="form-card">
          <p class="form-eyebrow">GET EARLY ACCESS</p>
          <h2 class="form-title">You're in the right place.</h2>
          <p class="form-desc">
            Tell us a little about yourself and we'll let you know the moment the app is live.
          </p>

          <form @submit.prevent="submit" class="waitlist-form" novalidate>

            <div class="field-group">
              <label class="field-label" for="wl-email">EMAIL *</label>
              <input
                id="wl-email"
                v-model.trim="form.email"
                type="email"
                class="field-input"
                :class="{ 'field-error': errors.email }"
                placeholder="you@example.com"
                autocomplete="email"
              />
              <p v-if="errors.email" class="field-err-msg">{{ errors.email }}</p>
            </div>

            <div class="field-group">
              <label class="field-label" for="wl-name">NAME</label>
              <input
                id="wl-name"
                v-model.trim="form.name"
                type="text"
                class="field-input"
                placeholder="First name (optional)"
                autocomplete="given-name"
              />
            </div>

            <div class="field-group">
              <label class="field-label" for="wl-training">WHAT ARE YOU TRAINING FOR?</label>
              <select id="wl-training" v-model="form.trainingFor" class="field-input field-select">
                <option value="">Pick one (optional)</option>
                <option value="5K">5K</option>
                <option value="10K">10K</option>
                <option value="Half Marathon">Half Marathon</option>
                <option value="Marathon">Marathon</option>
                <option value="Triathlon">Triathlon</option>
                <option value="Ironman">Ironman</option>
                <option value="Ultra">Ultra / Trail</option>
                <option value="Cycling">Cycling</option>
                <option value="Swimming">Swimming</option>
                <option value="General Fitness">General Fitness</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div class="field-group">
              <label class="field-label">DO YOU TRAIN SOLO OR WITH OTHERS?</label>
              <div class="radio-group">
                <label class="radio-opt" :class="{ active: form.trainsWith === 'solo' }">
                  <input type="radio" v-model="form.trainsWith" value="solo" />
                  Solo
                </label>
                <label class="radio-opt" :class="{ active: form.trainsWith === 'group' }">
                  <input type="radio" v-model="form.trainsWith" value="group" />
                  With a group
                </label>
                <label class="radio-opt" :class="{ active: form.trainsWith === 'both' }">
                  <input type="radio" v-model="form.trainsWith" value="both" />
                  Both
                </label>
              </div>
            </div>

            <p v-if="serverError" class="server-error">{{ serverError }}</p>

            <button type="submit" class="submit-btn" :disabled="loading">
              <span v-if="loading" class="btn-spinner"></span>
              <span v-else>Reserve my spot</span>
            </button>

            <p class="form-fine">No spam. No credit card. Just early access.</p>
          </form>
        </div>

        <!-- SUCCESS STATE -->
        <div v-else class="success-card">
          <div class="success-icon">✓</div>
          <h2 class="success-title">You're on the list.</h2>
          <p class="success-desc">
            We'll reach out as soon as beta access opens up.
            In the meantime, follow the build on
            <a href="https://instagram.com/runnitapp" target="_blank" rel="noopener">Instagram</a>
            and
            <a href="https://x.com/runnitapp" target="_blank" rel="noopener">X</a>.
          </p>
          <router-link to="/" class="back-link">Back to home</router-link>
        </div>

      </div>
    </section>

    <!-- SOCIAL PROOF STRIP -->
    <section class="proof-strip">
      <div class="proof-inner">
        <div class="proof-item">
          <span class="proof-stat">GPS</span>
          <span class="proof-label">Activity tracking</span>
        </div>
        <div class="proof-divider"></div>
        <div class="proof-item">
          <span class="proof-stat">Clubs</span>
          <span class="proof-label">Train with friends</span>
        </div>
        <div class="proof-divider"></div>
        <div class="proof-item">
          <span class="proof-stat">AI</span>
          <span class="proof-label">Personalized plans</span>
        </div>
        <div class="proof-divider"></div>
        <div class="proof-item">
          <span class="proof-stat">Strava</span>
          <span class="proof-label">Sync your data</span>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Join the Waitlist — Runnit',
  link: [{ rel: 'canonical', href: 'https://runnit.live/waitlist' }],
  meta: [
    { name: 'description', content: 'Runnit is a social fitness app for athletes. GPS tracking, club runs, AI training plans — built for people who actually move. Join the beta waitlist.' },
    { property: 'og:title', content: 'Join the Waitlist — Runnit' },
    { property: 'og:description', content: 'GPS tracking, club runs, AI training plans. Built for athletes who show up. Get early access.' },
    { property: 'og:url', content: 'https://runnit.live/waitlist' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Join the Waitlist — Runnit' },
    { name: 'twitter:description', content: 'Social fitness app for athletes. GPS, clubs, AI plans. Beta dropping soon.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const form = reactive({ email: '', name: '', trainingFor: '', trainsWith: '' })
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
        name: form.name || undefined,
        trainingFor: form.trainingFor || undefined,
        trainsWith: form.trainsWith || undefined,
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
  padding-top: var(--nav-h, 64px);
  font-family: Futura, 'Futura PT', 'Avenir Next', system-ui, sans-serif;
  color: #000;
}

/* HERO */
.hero {
  background: #000;
  color: #fff;
  padding: 100px 24px 80px;
}
.hero-inner { max-width: 680px; margin: 0 auto; }
.hero-kicker {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: rgba(255,255,255,0.40);
  margin-bottom: 24px;
}
.hero-headline {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.95;
  margin: 0 0 24px;
}
.hero-sub {
  font-size: 1rem;
  color: rgba(255,255,255,0.60);
  line-height: 1.6;
  max-width: 520px;
  margin: 0 0 20px;
}
.hero-fine {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #0052FF;
  text-transform: uppercase;
  margin: 0;
}

/* FORM */
.form-section {
  padding: 64px 24px 80px;
  background: #F5F5F5;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
}
.form-inner {
  max-width: 560px;
  margin: 0 auto;
}
.form-card {
  background: #fff;
  border: 1px solid #E5E5E5;
  padding: 48px;
}
.form-eyebrow {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.20em;
  color: #767676;
  margin-bottom: 12px;
}
.form-title {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0 0 12px;
}
.form-desc {
  font-size: 0.88rem;
  color: #767676;
  line-height: 1.6;
  margin: 0 0 36px;
}

/* Fields */
.waitlist-form { display: flex; flex-direction: column; gap: 24px; }
.field-group { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 0.60rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  color: #767676;
}
.field-input {
  padding: 12px 14px;
  font-family: inherit;
  font-size: 0.9rem;
  border: 1px solid #E5E5E5;
  background: #fff;
  color: #000;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
  border-radius: 0;
}
.field-input:focus { border-color: #000; }
.field-input.field-error { border-color: #dc2626; }
.field-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23000' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}
.field-err-msg {
  font-size: 0.75rem;
  color: #dc2626;
  margin: 0;
}

/* Radio */
.radio-group { display: flex; gap: 0; border: 1px solid #E5E5E5; }
.radio-opt {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 11px 8px;
  font-size: 0.80rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: #767676;
  cursor: pointer;
  border-right: 1px solid #E5E5E5;
  transition: background 0.12s, color 0.12s;
  user-select: none;
}
.radio-opt:last-child { border-right: none; }
.radio-opt.active { background: #000; color: #fff; }
.radio-opt input { display: none; }

/* Submit */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px 24px;
  background: #0052FF;
  color: #fff;
  font-family: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  border: 2px solid #0052FF;
  cursor: pointer;
  transition: background 0.15s;
  margin-top: 8px;
}
.submit-btn:hover:not(:disabled) { background: #003ECC; border-color: #003ECC; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.server-error {
  font-size: 0.82rem;
  color: #dc2626;
  margin: 0;
}

.form-fine {
  font-size: 0.68rem;
  color: #767676;
  letter-spacing: 0.05em;
  text-align: center;
  margin: 0;
}

.btn-spinner {
  display: inline-block;
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.30);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Success */
.success-card {
  background: #fff;
  border: 1px solid #E5E5E5;
  padding: 64px 48px;
  text-align: center;
}
.success-icon {
  width: 56px; height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  color: #fff;
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0 auto 28px;
}
.success-title {
  font-size: 1.8rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  margin: 0 0 16px;
}
.success-desc {
  font-size: 0.9rem;
  color: #767676;
  line-height: 1.65;
  max-width: 360px;
  margin: 0 auto 32px;
}
.success-desc a { color: #0052FF; text-decoration: none; }
.success-desc a:hover { text-decoration: underline; }
.back-link {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
  text-decoration: none;
  border-bottom: 1px solid #E5E5E5;
  padding-bottom: 2px;
}
.back-link:hover { color: #000; border-color: #000; }

/* PROOF STRIP */
.proof-strip {
  padding: 48px 24px;
  background: #fff;
  border-top: 1px solid #E5E5E5;
}
.proof-inner {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}
.proof-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
}
.proof-stat {
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #000;
}
.proof-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #767676;
}
.proof-divider {
  width: 1px;
  height: 40px;
  background: #E5E5E5;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .form-card, .success-card { padding: 32px 24px; }
  .hero { padding: 64px 24px 56px; }
  .proof-inner { flex-wrap: wrap; gap: 24px; }
  .proof-divider { display: none; }
  .radio-group { flex-direction: column; }
  .radio-opt { border-right: none; border-bottom: 1px solid #E5E5E5; }
  .radio-opt:last-child { border-bottom: none; }
}
</style>
