<template>
  <main class="waitlist-page">

    <!-- HERO — ink, centered -->
    <section class="hero">
      <div class="page-inner hero-inner">
        <span class="gr-eyebrow-badge">Waitlist</span>
        <h1 class="hero-h1">Get early access.</h1>
        <p class="hero-sub">One email. No spam. We’ll let you know when Runnit is ready for you.</p>
      </div>
    </section>

    <!-- FORM + SYNCS -->
    <section class="form-section">
      <div class="page-inner form-grid">

        <!-- Form card -->
        <div class="form-card">
          <div v-if="!submitted">
            <form @submit.prevent="submit" novalidate>

              <div class="field-group">
                <label class="field-label" for="wl-email">Email</label>
                <input
                  id="wl-email"
                  v-model.trim="form.email"
                  type="email"
                  class="field-input"
                  :class="{ 'field-input--error': errors.email }"
                  placeholder="you@email.com"
                  autocomplete="email"
                  required
                  :aria-invalid="Boolean(errors.email)"
                  :aria-describedby="errors.email ? 'wl-email-error' : undefined"
                />
                <p v-if="errors.email" id="wl-email-error" class="field-err" role="alert">{{ errors.email }}</p>
              </div>

              <p v-if="serverError" class="server-error" role="alert" aria-live="polite">{{ serverError }}</p>

              <button type="submit" class="btn-submit" :disabled="loading">
                <span v-if="loading" class="btn-spinner"></span>
                <span v-else>Join the waitlist</span>
              </button>

            </form>
          </div>

          <div v-else class="success-block">
            <div class="success-label">You're on the list.</div>
            <p class="success-body">We’ll email you when early access opens. Until then, keep putting in the miles.</p>
            <router-link to="/" class="btn-ghost">Back to home</router-link>
          </div>
        </div>

        <!-- Right: syncs + stats -->
        <div class="syncs-col">
          <div class="syncs-label">What you’ll get</div>
          <div class="sync-list">
            <div class="sync-item">Early access</div>
            <div class="sync-item">Product updates</div>
            <div class="sync-item">A better training home</div>
          </div>
          <div class="proof-strip">
            <div class="proof-cell">
              <div class="proof-lbl">Field</div>
              <div class="proof-val">1 email</div>
            </div>
            <div class="proof-cell">
              <div class="proof-lbl">Spam</div>
              <div class="proof-val">None</div>
            </div>
            <div class="proof-cell proof-cell--last">
              <div class="proof-lbl">Next</div>
              <div class="proof-val">Invite</div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Join the Waitlist — Runnit Early Access',
  link: [{ rel: 'canonical', href: 'https://runnit.live/waitlist' }],
  meta: [
    { name: 'description', content: 'Join the Runnit waitlist for early access to the training app built for endurance athletes.' },
    { property: 'og:title', content: 'Join the Waitlist — Runnit Early Access' },
    { property: 'og:description', content: 'Join the Runnit waitlist for early access.' },
    { property: 'og:url', content: 'https://runnit.live/waitlist' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Join the Waitlist — Runnit Early Access' },
    { name: 'twitter:description', content: 'Join the Runnit waitlist for early access.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const form = reactive({ email: '' })
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
      body: JSON.stringify({ email: form.email }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      serverError.value = data.error || "Didn't go through. Try again."
      return
    }
    submitted.value = true
  } catch {
    serverError.value = "Network hiccup. Try again."
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.waitlist-page {
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
}
.page-inner {
  max-width: 1040px;
  margin: 0 auto;
  padding: 0 32px;
}

/* ── HERO ── */
.hero {
  background: #16130F;
  color: #FBF6EC;
  padding: 76px 0 60px;
  text-align: center;
  border-bottom: 2px solid #16130F;
}
.hero-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.gr-eyebrow-badge {
  display: inline-block;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 6px 12px;
  transform: rotate(-2deg);
}
.hero-h1 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(60px, 9vw, 100px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 18px 0 0;
  animation: rkRise 0.6s ease-out both;
}
.hero-sub {
  font-size: 1.08rem;
  line-height: 1.6;
  color: rgba(251,246,236,0.68);
  max-width: 480px;
  margin: 20px auto 0;
}

/* ── FORM ── */
.form-section {
  padding: 48px 0;
  border-bottom: 2px solid #16130F;
}
.form-grid {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 36px;
  align-items: start;
}
.form-card {
  border: 2px solid #16130F;
  padding: 30px;
  background: #fff;
}

.field-group { margin-bottom: 16px; }
.field-label {
  display: block;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5A5348;
  margin-bottom: 8px;
}
.field-input {
  display: block;
  width: 100%;
  border: 2px solid #16130F;
  padding: 13px 14px;
  font-size: 0.95rem;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
  background: #fff;
  outline: none;
  border-radius: 0;
  transition: border-color 0.15s;
}
.field-input:focus { border-color: #2A55F5; }
.field-input--error { border-color: #dc2626; }
.field-input::placeholder { color: #8a8a8a; }
.field-err {
  margin: 6px 0 0;
  font-size: 0.8rem;
  color: #dc2626;
}
.server-error {
  font-size: 0.85rem;
  color: #dc2626;
  margin: 0 0 12px;
}
.btn-submit {
  display: block;
  width: 100%;
  text-align: center;
  background: #2A55F5;
  color: #fff;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 15px 0;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 4px 4px 0 #16130F;
  transition: background 0.15s;
  margin-top: 22px;
}
.btn-submit:hover:not(:disabled) { background: #1E42D6; }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* success */
.success-block { text-align: center; padding: 20px 0; }
.success-label {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: 2rem;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.success-body { color: #5A5348; line-height: 1.6; margin-bottom: 20px; }
.btn-ghost {
  display: inline-flex;
  align-items: center;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 11px 20px;
  font-weight: 700;
  font-size: 0.88rem;
  color: #16130F;
  text-decoration: none;
  transition: background 0.15s;
}
.btn-ghost:hover { background: rgba(22,19,15,0.06); text-decoration: none; }

/* ── SYNCS COL ── */
.syncs-col { display: flex; flex-direction: column; gap: 0; }
.syncs-label {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5A5348;
  margin-bottom: 14px;
}
.sync-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
.sync-item {
  border: 2px solid #16130F;
  padding: 14px 16px;
  font-weight: 800;
  background: #fff;
}
.proof-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 2px solid #16130F;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
  background: #fff;
}
.proof-cell {
  padding: 18px 12px;
  border-right: 2px solid #16130F;
  text-align: center;
}
.proof-cell--last { border-right: none; }
.proof-lbl {
  font-size: 0.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #5A5348;
  margin-bottom: 6px;
}
.proof-val { font-size: 1.05rem; font-weight: 600; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .form-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .page-inner { padding: 0 22px; }
  .hero { padding: 56px 0 44px; }
  .form-section { padding: 36px 0; }
}
</style>
