<template>
  <main class="waitlist-page">

    <!-- HERO -->
    <section class="hero">
      <div class="page-inner hero-grid">
        <div class="hero-copy">
          <div class="hero-kicker"><span class="hero-kicker-dot"></span> RUNNIT / EARLY ACCESS</div>
          <h1 class="hero-h1">Your training,<br><span>one home.</span></h1>
          <p class="hero-sub">Bring your workouts, recovery, race goals, and people together in one place — then make the next week count.</p>
          <div class="hero-note"><span>01</span> Built for committed athletes training for something.</div>
        </div>

        <div class="hero-visual" aria-label="A preview of the Runnit training hub">
          <div class="orbit orbit--one"></div>
          <div class="orbit orbit--two"></div>
          <div class="preview-card preview-card--back">
            <span>WEEK 08</span>
            <strong>BUILD<br>WITH INTENT.</strong>
          </div>
          <div class="preview-card preview-card--front">
            <div class="preview-topline"><span class="preview-live"><i></i> TRAINING HUB</span><span>MON 08</span></div>
            <div class="preview-title">London Marathon</div>
            <div class="preview-progress"><span></span></div>
            <div class="preview-meta"><span><b>42</b> DAYS OUT</span><span><b>68%</b> COMPLETE</span></div>
            <div class="preview-quote">“The work adds up.”</div>
          </div>
          <span class="hero-sticker hero-sticker--yellow">SHOW UP<br>AGAIN.</span>
          <span class="hero-sticker hero-sticker--cobalt">+ 1 WEEK<br>STRONGER</span>
        </div>
      </div>
    </section>

    <!-- PROMISE STRIP -->
    <section class="promise-section">
      <div class="page-inner promise-grid">
        <div class="promise-intro">
          <span class="section-label">The idea</span>
          <h2>Less tab-hopping.<br><em>More training.</em></h2>
        </div>
        <div class="promise-list">
          <div class="promise-item"><span class="promise-index">01</span><div><strong>Bring it together.</strong><p>One home for the data you already collect.</p></div></div>
          <div class="promise-item"><span class="promise-index">02</span><div><strong>Train toward something.</strong><p>Make your race or goal the center of the week.</p></div></div>
          <div class="promise-item"><span class="promise-index">03</span><div><strong>Keep each other moving.</strong><p>Progress feels better when your people see it.</p></div></div>
        </div>
      </div>
    </section>

    <!-- WAITLIST FORM -->
    <section class="form-section">
      <div class="page-inner form-grid">

        <!-- Form card -->
        <div class="form-card">
          <div class="form-kicker">Be first through the door</div>
          <h2 class="form-title">Save your spot.</h2>
          <p class="form-sub">We’ll send one email when early access opens. That’s it.</p>
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
            <div class="sync-item"><span class="sync-icon">↗</span><div><strong>Early access</strong><small>See the training hub before the crowd.</small></div></div>
            <div class="sync-item"><span class="sync-icon">◌</span><div><strong>Product updates</strong><small>Useful notes, never a noisy newsletter.</small></div></div>
            <div class="sync-item"><span class="sync-icon">✦</span><div><strong>A better training home</strong><small>Your data, your goal, your people.</small></div></div>
          </div>
          <div class="proof-strip">
            <div class="proof-cell">
              <div class="proof-lbl">Form</div>
              <div class="proof-val">1 field</div>
            </div>
            <div class="proof-cell">
              <div class="proof-lbl">Spam</div>
              <div class="proof-val">None</div>
            </div>
            <div class="proof-cell proof-cell--last">
              <div class="proof-lbl">Next</div>
              <div class="proof-val">Invite you</div>
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

/* ── Launch polish ── */
.waitlist-page {
  padding-top: calc(var(--nav-h, 66px) + var(--spec-h, 35px));
  overflow: hidden;
}
.hero {
  padding: 82px 0 88px;
  text-align: left;
  position: relative;
  isolation: isolate;
}
.hero::before {
  content: '';
  position: absolute;
  width: 540px;
  height: 540px;
  right: -160px;
  top: -230px;
  border: 1px solid rgba(251,246,236,0.18);
  border-radius: 50%;
  box-shadow: 0 0 0 42px rgba(251,246,236,0.04), 0 0 0 84px rgba(251,246,236,0.035);
  z-index: -1;
}
.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.94fr) minmax(420px, 1.06fr);
  gap: 44px;
  align-items: center;
}
.hero-copy { max-width: 560px; }
.hero-kicker, .hero-note, .section-label, .form-kicker, .syncs-label, .proof-lbl {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  text-transform: uppercase;
}
.hero-kicker {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #FFC53D;
  font-size: .66rem;
  font-weight: 700;
  letter-spacing: .15em;
}
.hero-kicker-dot { width: 8px; height: 8px; background: #FFC53D; border-radius: 50%; box-shadow: 0 0 0 5px rgba(255,197,61,.14); }
.hero-h1 {
  font-size: clamp(68px, 9vw, 116px);
  line-height: .78;
  letter-spacing: -.015em;
  margin: 22px 0 25px;
}
.hero-h1 > span { display: inline-block; color: #2A55F5; transform: translateX(.16em); }
.hero-sub { max-width: 470px; margin: 0; color: rgba(251,246,236,.72); font-size: 1.02rem; line-height: 1.6; }
.hero-note { display: flex; align-items: center; gap: 12px; color: rgba(251,246,236,.58); font-size: .62rem; font-weight: 700; letter-spacing: .12em; margin-top: 34px; }
.hero-note span { color: #FFC53D; font-size: .68rem; border: 1px solid rgba(255,197,61,.65); padding: 6px 7px; }
.hero-visual { min-height: 405px; position: relative; display: grid; place-items: center; }
.orbit { position: absolute; border: 1px solid rgba(251,246,236,.2); border-radius: 50%; transform: rotate(-16deg); }
.orbit--one { width: 390px; height: 225px; }
.orbit--two { width: 440px; height: 300px; transform: rotate(28deg); }
.preview-card { border: 2px solid #16130F; position: absolute; width: min(100%, 370px); }
.preview-card--back { background: #FFC53D; color: #16130F; padding: 24px; transform: translate(-36px,-42px) rotate(-7deg); box-shadow: 5px 5px 0 #2A55F5; }
.preview-card--back span { font: 700 .63rem 'Spline Sans Mono', monospace; letter-spacing: .16em; }
.preview-card--back strong { display: block; font: 900 clamp(2.6rem,5vw,4rem)/.8 'Big Shoulders Display', sans-serif; margin-top: 48px; }
.preview-card--front { background: #FBF6EC; color: #16130F; padding: 20px 20px 18px; transform: translate(22px,30px) rotate(4deg); box-shadow: 7px 7px 0 #16130F; z-index: 2; }
.preview-topline, .preview-meta { display: flex; align-items: center; justify-content: space-between; font: 700 .58rem 'Spline Sans Mono', monospace; letter-spacing: .1em; text-transform: uppercase; color: #665f55; }
.preview-live { color: #2A55F5; }
.preview-live i { display: inline-block; width: 6px; height: 6px; margin-right: 5px; background: #2A55F5; border-radius: 50%; vertical-align: 1px; }
.preview-title { font: 900 2.35rem/.9 'Big Shoulders Display', sans-serif; text-transform: uppercase; margin: 28px 0 18px; }
.preview-progress { height: 12px; border: 2px solid #16130F; background: #fff; padding: 2px; }
.preview-progress span { display: block; width: 68%; height: 100%; background: #2A55F5; }
.preview-meta { margin-top: 12px; color: #16130F; }
.preview-meta b { color: #2A55F5; }
.preview-quote { border-top: 1px solid #d7cfbf; margin-top: 19px; padding-top: 14px; font: italic 600 .9rem 'Hanken Grotesk', sans-serif; }
.hero-sticker { position: absolute; z-index: 3; border: 2px solid #16130F; padding: 8px 10px; font: 800 .62rem/1.05 'Spline Sans Mono', monospace; letter-spacing: .06em; text-transform: uppercase; box-shadow: 3px 3px 0 #16130F; }
.hero-sticker--yellow { background: #FFC53D; left: 1%; bottom: 12px; transform: rotate(-8deg); }
.hero-sticker--cobalt { background: #2A55F5; color: #fff; right: 1%; top: 28px; transform: rotate(7deg); }

.promise-section { background: #FBF6EC; border-bottom: 2px solid #16130F; padding: 64px 0 70px; }
.promise-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 70px; align-items: start; }
.section-label { color: #2A55F5; font-size: .66rem; font-weight: 800; letter-spacing: .14em; }
.promise-intro h2 { font: 900 clamp(3rem,6vw,5.2rem)/.82 'Big Shoulders Display', sans-serif; margin: 14px 0 0; text-transform: uppercase; }
.promise-intro em { color: #2A55F5; font-style: normal; }
.promise-list { border-top: 2px solid #16130F; }
.promise-item { display: grid; grid-template-columns: 44px 1fr; gap: 16px; padding: 20px 0; border-bottom: 1px solid #cfc6b5; }
.promise-index { color: #2A55F5; font: 700 .68rem 'Spline Sans Mono', monospace; }
.promise-item strong { font-size: 1.05rem; }
.promise-item p { color: #665f55; line-height: 1.45; margin: 5px 0 0; }

.form-section { padding: 70px 0 78px; background: #E7DFCE; border-bottom: 2px solid #16130F; }
.form-grid { grid-template-columns: 1.08fr .92fr; gap: 52px; align-items: center; }
.form-card { padding: 34px; background: #fff; box-shadow: 8px 8px 0 #16130F; }
.form-kicker { color: #2A55F5; font-size: .64rem; font-weight: 800; letter-spacing: .14em; }
.form-title { font: 900 clamp(3.2rem,6vw,5rem)/.82 'Big Shoulders Display', sans-serif; margin: 13px 0 12px; text-transform: uppercase; }
.form-sub { color: #665f55; line-height: 1.5; margin: 0 0 26px; }
.field-input { transition: border-color .15s, box-shadow .15s; }
.field-input:focus { border-color: #2A55F5; box-shadow: 4px 4px 0 rgba(42,85,245,.2); }
.btn-submit { transition: background .15s, transform .15s, box-shadow .15s; }
.btn-submit:hover:not(:disabled) { transform: translate(2px,2px); box-shadow: 2px 2px 0 #16130F; }
.syncs-label { color: #5A5348; font-size: .64rem; font-weight: 800; letter-spacing: .14em; }
.sync-item { display: flex; align-items: flex-start; gap: 13px; border: none; border-bottom: 1px solid #bfb5a4; padding: 14px 0; }
.sync-icon { color: #2A55F5; font: 900 1.2rem 'Big Shoulders Display', sans-serif; line-height: 1; }
.sync-item strong { display: block; font-size: 1rem; }
.sync-item small { display: block; color: #665f55; font-size: .82rem; line-height: 1.4; margin-top: 4px; }
.proof-strip { background: #FBF6EC; }
.proof-val { font-size: .9rem; font-weight: 700; }

button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid #FFC53D; outline-offset: 4px; }
@media (prefers-reduced-motion: reduce) { .hero-h1, .btn-spinner { animation: none; } .btn-submit { transition: none; } }
@media (max-width: 900px) {
  .hero-grid { grid-template-columns: 1fr; gap: 38px; }
  .hero-copy { max-width: 640px; }
  .hero-visual { min-height: 370px; }
  .promise-grid { gap: 42px; }
  .form-grid { gap: 36px; }
}
@media (max-width: 768px) {
  .promise-grid, .form-grid { grid-template-columns: 1fr; }
  .promise-section { padding: 48px 0 54px; }
  .form-section { padding: 52px 0 60px; }
  .syncs-col { max-width: 560px; }
}
@media (max-width: 640px) {
  .page-inner { padding: 0 22px; }
  .hero { padding: 60px 0 72px; }
  .hero-h1 { font-size: clamp(62px,18vw,92px); }
  .hero-h1 > span { transform: none; }
  .hero-visual { min-height: 310px; margin-top: 8px; }
  .orbit--one { width: 290px; height: 180px; }
  .orbit--two { width: 330px; height: 230px; }
  .preview-card { width: min(90vw,330px); }
  .preview-card--back { transform: translate(-20px,-30px) rotate(-7deg); }
  .preview-card--front { transform: translate(15px,25px) rotate(4deg); }
  .hero-sticker { font-size: .54rem; }
  .hero-sticker--yellow { left: 0; bottom: 0; }
  .hero-sticker--cobalt { right: 0; top: 5px; }
  .promise-intro h2 { font-size: 3.5rem; }
  .form-card { padding: 26px 22px; box-shadow: 5px 5px 0 #16130F; }
  .proof-cell { padding: 14px 6px; }
  .proof-val { font-size: .72rem; }
}
</style>
