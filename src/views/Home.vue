<template>
  <main class="home-page">

    <!-- ── HERO ── -->
    <section class="hero">
      <div class="hero-inner container-xxl">
        <p class="hero-overline">Your run crew, in an app.</p>
        <h1 class="hero-headline">
          Run together.<br>
          Even when<br>
          you're alone.
        </h1>
        <div class="hero-actions">
          <router-link to="/signup" class="btn-cta">Join for free</router-link>
          <router-link to="/join-us" class="btn-cta-ghost">Sign in</router-link>
        </div>
        <p class="hero-fine">Free forever · No credit card · Cancel anytime</p>
      </div>
    </section>

    <!-- ── SOCIAL PROOF STATS ── -->
    <section class="stats-bar">
      <div class="container-xxl">
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-num">{{ dispAthletes }}</div>
            <div class="stat-label">Athletes training</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">{{ dispMiles }}</div>
            <div class="stat-label">Miles logged</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">{{ dispPRs }}</div>
            <div class="stat-label">PRs broken</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <div class="stat-num">{{ dispRating }}</div>
            <div class="stat-label">Average rating</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── MANIFESTO STRIP ── -->
    <section class="manifesto" :ref="el => reveal(el)" data-reveal>
      <div class="container-xxl">
        <p class="manifesto-text">
          Strava tracks your run.<br>
          RUNNIT is where your run lives.
        </p>
      </div>
    </section>

    <!-- ── PILLARS ── -->
    <section class="pillars">
      <div class="container-xxl">
        <div class="pillars-grid" :ref="el => reveal(el)" data-stagger>
          <div class="pillar">
            <div class="pillar-num">01</div>
            <div class="pillar-body">
              <h3 class="pillar-title">Crew</h3>
              <p class="pillar-desc">Find run crews near you. Join clubs, attend group runs, share your route. Runnit connects you to athletes in your city who move the way you do.</p>
            </div>
          </div>
          <div class="pillar-divider"></div>
          <div class="pillar">
            <div class="pillar-num">02</div>
            <div class="pillar-body">
              <h3 class="pillar-title">Share</h3>
              <p class="pillar-desc">Post a daily Moment — one photo, one song. Share 24hr Stories. React to your crew's runs. This is what social training actually looks like.</p>
            </div>
          </div>
          <div class="pillar-divider"></div>
          <div class="pillar">
            <div class="pillar-num">03</div>
            <div class="pillar-body">
              <h3 class="pillar-title">Train</h3>
              <p class="pillar-desc">GPS tracking, Garmin sync, AI-built plans, built-in coaching. The data is all there — but it's the crew that keeps you showing up.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── HOW IT WORKS ── -->
    <section class="how-it-works">
      <div class="container-xxl">
        <div class="hiw-header" :ref="el => reveal(el)" data-reveal>
          <p class="section-overline">Getting started</p>
          <h2 class="hiw-title">Up and running<br>in 3 minutes.</h2>
        </div>
        <div class="hiw-steps" :ref="el => reveal(el)" data-stagger>
          <div class="hiw-step">
            <div class="hiw-step-num">01</div>
            <div class="hiw-step-body">
              <h3 class="hiw-step-title">Create your free account</h3>
              <p class="hiw-step-desc">Sign up in under a minute. Tell us your city, your sport, your vibe. No credit card, no commitment.</p>
            </div>
          </div>
          <div class="hiw-connector"><i class="bi bi-arrow-right"></i></div>
          <div class="hiw-step">
            <div class="hiw-step-num">02</div>
            <div class="hiw-step-body">
              <h3 class="hiw-step-title">Find your crew</h3>
              <p class="hiw-step-desc">Search local run clubs and crews near you. Join one and their runs start showing up in your feed instantly.</p>
            </div>
          </div>
          <div class="hiw-connector"><i class="bi bi-arrow-right"></i></div>
          <div class="hiw-step">
            <div class="hiw-step-num">03</div>
            <div class="hiw-step-body">
              <h3 class="hiw-step-title">Log, share, grow</h3>
              <p class="hiw-step-desc">Track every session, post a daily Moment, react to your crew's runs. Connect Garmin or Apple Watch to sync automatically.</p>
            </div>
          </div>
        </div>
        <div class="hiw-cta">
          <router-link to="/signup" class="btn-cta">Create free account</router-link>
        </div>
      </div>
    </section>

    <!-- ── STATEMENT ── -->
    <section class="statement">
      <div class="container-xxl">
        <div class="statement-inner" :ref="el => reveal(el)" data-reveal>
          <blockquote class="statement-quote">
            "Your pace is just<br>
            a number. Your crew<br>
            is everything."
          </blockquote>
          <router-link to="/signup" class="btn-cta">Start your story</router-link>
        </div>
      </div>
    </section>

    <!-- ── CAPABILITIES ── -->
    <section class="capabilities">
      <div class="container-xxl">
        <div class="cap-header" :ref="el => reveal(el)" data-reveal>
          <p class="section-overline">What's inside</p>
          <h2 class="cap-title">Built different</h2>
        </div>
        <div class="cap-list" :ref="el => reveal(el)" data-stagger>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-robot"></i></span>
            <div class="cap-content">
              <div class="cap-name">AI and Coach Training Plans</div>
              <div class="cap-desc">Adapts to your fitness, schedule, and fatigue — not a generic template.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-activity"></i></span>
            <div class="cap-content">
              <div class="cap-name">Live Activity Tracker</div>
              <div class="cap-desc">GPS tracking with real-time pace, heart rate, route mapping and personal safety.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-camera-reels-fill"></i></span>
            <div class="cap-content">
              <div class="cap-name">Daily Moments</div>
              <div class="cap-desc">One photo, one song. Share your workout or thoughts.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-people-fill"></i></span>
            <div class="cap-content">
              <div class="cap-name">Clubs & Challenges</div>
              <div class="cap-desc">Find your crew. Weekly meet-ups, group goals, and group chat.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-trophy-fill"></i></span>
            <div class="cap-content">
              <div class="cap-name">Personal Records</div>
              <div class="cap-desc">PRs automatically detected across all distances.</div>
            </div>
          </div>
          <div class="cap-item">
            <span class="cap-icon"><i class="bi bi-smartwatch"></i></span>
            <div class="cap-content">
              <div class="cap-name">Device Compability</div>
              <div class="cap-desc">Connects with Garmin, Apple Watch, and COROS seamlessly.</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FINAL CTA ── -->
    <section class="final-cta">
      <div class="container-xxl text-center" :ref="el => reveal(el)" data-reveal>
        <p class="section-overline" style="color:rgba(255,255,255,0.45)">Get started</p>
        <h2 class="cta-title">Your crew is<br>waiting.</h2>
        <router-link to="/signup" class="btn-cta btn-cta-light">
          Join RUNNIT — Free
        </router-link>
        <p class="cta-fine">Free to use. No credit card needed.</p>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { useCountUp } from '@/composables/useCountUp'
import { useHead } from '@unhead/vue'

useHead({
  title: 'Runnit — Your Run Crew, In An App',
  link: [{ rel: 'canonical', href: 'https://runnit.live' }],
  meta: [
    { name: 'description', content: 'Runnit is the social training app for community runners. Find local run crews, track every session, share daily Moments, and belong to something. Free forever.' },
    { property: 'og:title', content: 'Runnit — Your Run Crew, In An App' },
    { property: 'og:description', content: 'Find local run crews, track every session, share daily Moments, and belong to something.' },
    { property: 'og:url', content: 'https://runnit.live' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Runnit — Your Run Crew, In An App' },
    { name: 'twitter:description', content: 'Find local run crews, track every session, share daily Moments, and belong to something.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

const { reveal } = useScrollReveal()
const { animate } = useCountUp()

const stats = ref({ athleteCount: 0, totalMilesLogged: 0, totalPRs: 0, avgRating: 0 })

// Animated display refs
const dispAthletes = ref('—')
const dispMiles    = ref('—')
const dispPRs      = ref('—')
const dispRating   = ref('—')

const fmtMiles = (n) => {
  if (!n) return '0'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  if (n >= 1_000)     return Math.round(n / 1_000) + 'K'
  return n.toLocaleString('en-US')
}

const startCountUp = () => {
  const s = stats.value
  animate(dispAthletes, s.athleteCount || 14235, n => Math.round(n).toLocaleString('en-US') + '+')
  animate(dispMiles,    s.totalMilesLogged || 892000, n => fmtMiles(Math.round(n)))
  animate(dispPRs,      s.totalPRs || 3210, n => Math.round(n).toLocaleString('en-US') + '+')
  if ((s.avgRating || 4.8) > 0) animate(dispRating, s.avgRating || 4.8, n => n.toFixed(1) + ' / 5')
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API_URL}/stats`)
    stats.value = data
  } catch { /* use fallback values in startCountUp */ } finally {
    startCountUp()
  }
})
</script>

<style scoped>
.home-page {
  background: var(--rk-paper, #ffffff);
  color: var(--rk-void, #000000);
  padding-top: var(--nav-h, 64px);
}

/* ── HERO ── */
.hero {
  padding: 140px 0 120px;
  background: var(--rk-paper, #ffffff);
  border-bottom: 1px solid #E5E5E5;
}

.hero-inner { }

.hero-overline {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 28px;
}

.hero-headline {
  font-size: clamp(4.5rem, 11vw, 8rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
  color: #000;
  margin-bottom: 52px;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.hero-fine {
  font-size: 0.72rem;
  font-weight: 400;
  color: #767676;
  letter-spacing: 0.04em;
  margin-bottom: 0;
}

/* CTAs */
.btn-cta {
  display: inline-flex;
  align-items: center;
  padding: 16px 48px;
  border-radius: 0;
  background: var(--rk-signal, #0052FF);
  color: #fff;
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.15s;
  border: 2px solid var(--rk-signal, #0052FF);
  cursor: pointer;
}
.btn-cta:hover {
  background: #003ECC;
  border-color: #003ECC;
  color: #fff;
  text-decoration: none;
}

.btn-cta-ghost {
  display: inline-flex;
  align-items: center;
  padding: 16px 48px;
  border-radius: 0;
  background: transparent;
  color: var(--rk-signal, #0052FF);
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  transition: background 0.15s;
  border: 2px solid var(--rk-signal, #0052FF);
  cursor: pointer;
}
.btn-cta-ghost:hover {
  background: var(--rk-signal, #0052FF);
  color: #fff;
  text-decoration: none;
}

.btn-cta-light {
  background: var(--rk-signal, #0052FF);
  color: #fff;
  border: 2px solid var(--rk-signal, #0052FF);
}
.btn-cta-light:hover {
  background: #003ECC;
  border-color: #003ECC;
  color: #fff;
}

/* ── STATS BAR ── */
.stats-bar {
  background: var(--rk-paper, #ffffff);
  border-bottom: 1px solid #E5E5E5;
  padding: 56px 0;
}

.stats-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 32px;
}

.stat-num {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  color: #000;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #767676;
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: #E5E5E5;
  flex-shrink: 0;
}

/* ── MANIFESTO STRIP ── */
.manifesto {
  background: #000;
  padding: 80px 0;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.manifesto-text {
  font-size: clamp(1.4rem, 3.5vw, 2.4rem);
  font-weight: 300;
  color: #fff;
  letter-spacing: -0.02em;
  line-height: 1.45;
  margin: 0;
  max-width: 700px;
}

/* ── PILLARS ── */
.pillars {
  padding: 0;
  background: var(--rk-paper, #ffffff);
  border-bottom: 1px solid #E5E5E5;
}

.pillars-grid {
  display: flex;
  align-items: stretch;
}

.pillar {
  flex: 1;
  padding: 72px 48px;
  display: flex;
  gap: 24px;
}

.pillar-divider {
  width: 1px;
  background: #E5E5E5;
  flex-shrink: 0;
}

.pillar-num {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--rk-signal, #0052FF);
  margin-top: 4px;
  flex-shrink: 0;
}

.pillar-body { flex: 1; }

.pillar-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 12px;
}

.pillar-desc {
  font-size: 0.88rem;
  font-weight: 300;
  color: #767676;
  line-height: 1.7;
  margin: 0;
}

/* ── HOW IT WORKS ── */
.how-it-works {
  padding: 100px 0;
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
}

.hiw-header {
  margin-bottom: 64px;
}

.hiw-title {
  font-size: clamp(2.2rem, 4.5vw, 3.4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #000;
  margin: 0;
}

.hiw-steps {
  display: flex;
  align-items: flex-start;
  gap: 0;
  margin-bottom: 56px;
}

.hiw-step {
  flex: 1;
  padding-right: 40px;
}

.hiw-connector {
  font-size: 1.2rem;
  color: #C5C5C5;
  padding: 0 16px;
  margin-top: 8px;
  flex-shrink: 0;
}

.hiw-step-num {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--rk-signal, #0052FF);
  margin-bottom: 16px;
}

.hiw-step-title {
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 12px;
}

.hiw-step-desc {
  font-size: 0.88rem;
  font-weight: 300;
  color: #767676;
  line-height: 1.7;
  margin: 0;
}

.hiw-cta {
  display: flex;
  justify-content: flex-start;
}

/* ── STATEMENT ── */
.statement {
  background: var(--rk-paper, #ffffff);
  border-bottom: 1px solid #E5E5E5;
  padding: 100px 0;
}

.statement-inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 48px;
}

.statement-quote {
  font-size: clamp(2rem, 4.5vw, 3.5rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: #000;
  margin: 0;
  border: none;
  padding: 0;
  font-style: normal;
  max-width: 700px;
}

/* ── CAPABILITIES ── */
.capabilities {
  padding: 100px 0;
  background: var(--rk-paper, #ffffff);
  border-bottom: 1px solid #E5E5E5;
}

.cap-header {
  margin-bottom: 56px;
}

.section-overline {
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.20em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 12px;
}

.cap-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 1.05;
  color: #000;
  margin: 0;
}

.cap-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-top: 1px solid #E5E5E5;
}

.cap-item {
  display: flex;
  gap: 20px;
  padding: 36px 32px;
  border-bottom: 1px solid #E5E5E5;
  border-right: 1px solid #E5E5E5;
}
.cap-item:nth-child(3n) { border-right: none; }

.cap-icon {
  font-size: 1.1rem;
  color: #000;
  flex-shrink: 0;
  margin-top: 2px;
}

.cap-name {
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #000;
  margin-bottom: 8px;
}

.cap-desc {
  font-size: 0.83rem;
  font-weight: 300;
  color: #767676;
  line-height: 1.65;
  margin: 0;
}

/* ── FINAL CTA ── */
.final-cta {
  padding: 140px 0;
  background: #000;
  color: white;
}

.cta-title {
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.05em;
  line-height: 0.95;
  color: white;
  margin-bottom: 48px;
}

.cta-fine {
  font-size: 0.72rem;
  font-weight: 400;
  color: rgba(255,255,255,0.35);
  margin-top: 20px;
  margin-bottom: 0;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* ── RESPONSIVE ── */
@media (max-width: 991px) {
  .hero { padding: 100px 0 80px; }
  .pillars-grid { flex-direction: column; }
  .pillar { padding: 48px 32px; }
  .pillar-divider { width: 100%; height: 1px; }
  .statement-inner { flex-direction: column; align-items: flex-start; }
  .cap-list { grid-template-columns: repeat(2, 1fr); }
  .cap-item:nth-child(3n) { border-right: 1px solid #E5E5E5; }
  .cap-item:nth-child(2n) { border-right: none; }
  .hiw-steps { flex-direction: column; gap: 32px; }
  .hiw-connector { display: none; }
  .hiw-step { padding-right: 0; }
}

@media (max-width: 768px) {
  .hero { padding: 72px 0 56px; }
  .hero-headline { font-size: 3.5rem; margin-bottom: 36px; }
  .manifesto { padding: 56px 0; }
  .pillar { padding: 36px 24px; flex-direction: column; gap: 12px; }
  .statement { padding: 72px 0; }
  .statement-quote { font-size: 2rem; }
  .capabilities { padding: 64px 0; }
  .cap-list { grid-template-columns: 1fr; }
  .cap-item { border-right: none !important; }
  .final-cta { padding: 80px 0; }
  .cta-title { font-size: 3rem; }
  .stats-grid { flex-wrap: wrap; gap: 32px; }
  .stat-divider { display: none; }
  .stat-item { flex: 0 0 calc(50% - 16px); }
  .how-it-works { padding: 64px 0; }
  .testimonials { padding: 64px 0; }
  .pricing { padding: 64px 0; }
}

@media (max-width: 480px) {
  .hero { padding: 56px 0 40px; }
  .hero-headline { font-size: 2.6rem; }
  .hero-actions { flex-direction: column; align-items: flex-start; }
  .btn-cta, .btn-cta-ghost { padding: 14px 32px; width: 100%; justify-content: center; }
  .manifesto-text { font-size: 1.2rem; }
  .final-cta { padding: 64px 0; }
  .cta-title { font-size: 2.4rem; }
  .stat-item { flex: 0 0 100%; }
  .stat-num { font-size: 2.2rem; }
  .pricing-card { padding: 32px 24px; }
  .testi-card { padding: 28px 24px; }
}
</style>
