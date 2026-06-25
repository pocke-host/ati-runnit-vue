<template>
  <main class="home-page">

    <!-- ── HERO (Direction B) ── -->
    <section class="hero">
      <div class="hero-inner">
        <p class="kicker">Runnit — Moments</p>
        <h1 class="hero-h1">EVERY RUN GOES<br>ON THE RECORD.</h1>
        <div class="hero-actions">
          <router-link to="/waitlist" class="btn-primary">Get early access</router-link>
          <a href="#moment-detail" class="btn-ghost-dark" @click.prevent="scrollTo('moment-detail')">Watch a moment</a>
        </div>
      </div>
      <!-- 4-up MomentTile grid -->
      <div class="moment-grid">
        <MomentTile
          v-for="m in heroMoments"
          :key="m.handle"
          :handle="m.handle"
          :photo="m.photo"
          :distance-meters="m.distanceMeters"
          :pace-sec-per-km="m.paceSecPerKm"
        />
      </div>
    </section>

    <!-- ── HOW IT WORKS (Direction B) ── -->
    <section class="hiw-section">
      <div class="home-inner">
        <p class="kicker kicker-light">How it works</p>
        <h2 class="section-h2">Stop. Snap. It's posted.</h2>
        <div class="newsprint-grid-3">
          <div class="np-card">
            <div class="np-num">01</div>
            <div class="np-title">Finish your run</div>
            <p class="np-body">Hit stop on the watch or the app. Your splits, route and time are already captured.</p>
          </div>
          <div class="np-card">
            <div class="np-num">02</div>
            <div class="np-title">One photo</div>
            <p class="np-body">The sweat, the view, the finish line. One shot — no editing, no second takes.</p>
          </div>
          <div class="np-card">
            <div class="np-num">03</div>
            <div class="np-title">Auto-stamped</div>
            <p class="np-body">Distance and pace print onto the moment like a timing-mat receipt. Posted to your crew.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── FEATURE INDEX (Direction A) ── -->
    <section class="feature-section">
      <div class="home-inner">
        <p class="kicker kicker-light">What you get</p>
        <h2 class="section-h2" style="max-width:620px">Built for the work,<br>not the trophy case.</h2>
        <div class="feature-list">
          <div v-for="f in features" :key="f.num" class="feature-row">
            <div class="f-num">{{ f.num }}</div>
            <div class="f-name">{{ f.name }}</div>
            <div class="f-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── MOMENT DETAIL (Direction B) ── -->
    <section id="moment-detail" class="detail-section">
      <div class="detail-photo-panel">
        <div class="detail-placeholder"></div>
        <div class="detail-overlay" aria-hidden="true"></div>
        <!-- Avatar chip -->
        <div class="detail-chip">
          <div class="detail-avatar">WO</div>
          <div class="detail-chip-info">
            <div class="detail-chip-name">Wren Okafor</div>
            <div class="detail-chip-handle">@wren · 5:58 AM</div>
          </div>
        </div>
        <!-- DIST / PACE / TIME stamp -->
        <div class="data-stamp">
          <div class="stamp-cell">
            <div class="stamp-label">DIST</div>
            <div class="stamp-value">{{ formatDistance(detailActivity.distanceMeters, 2) }}</div>
          </div>
          <div class="stamp-cell">
            <div class="stamp-label">PACE</div>
            <div class="stamp-value">{{ detailPace }}</div>
          </div>
          <div class="stamp-cell">
            <div class="stamp-label">TIME</div>
            <div class="stamp-value">{{ formatDurationClock(detailActivity.timeSec) }}</div>
          </div>
        </div>
      </div>
      <div class="detail-info-panel">
        <p class="kicker kicker-light">A moment, in full</p>
        <h2 class="detail-h2">The data lives<br>under the photo.</h2>
        <!-- 2×2 stat grid -->
        <div class="stat-grid">
          <div class="stat-cell">
            <div class="stat-label">Distance</div>
            <div class="stat-value">{{ formatDistance(detailActivity.distanceMeters, 2) }}</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Avg pace</div>
            <div class="stat-value">{{ detailPace }} {{ paceLabel }}</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Moving time</div>
            <div class="stat-value">{{ formatDurationClock(detailActivity.timeSec) }}</div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Elevation</div>
            <div class="stat-value">{{ formatElevation(detailActivity.elevationMeters) }}</div>
          </div>
        </div>
        <!-- Reaction bar -->
        <div class="reaction-bar">
          <button
            v-for="r in reactions"
            :key="r.type"
            class="reaction-btn"
            :class="{ 'reaction-selected': r.selected }"
          >{{ r.label }} {{ r.count }}</button>
        </div>
      </div>
    </section>

    <!-- ── ACTIVITY BOARD (Direction A) ── -->
    <section class="board-section">
      <div class="home-inner">
        <p class="kicker kicker-light">On the board today</p>
        <h2 class="section-h2">The board doesn't lie.</h2>
        <ActivityBoard :rows="boardRows" />
      </div>
    </section>

    <!-- ── CTA (Direction B) ── -->
    <section class="final-cta">
      <div class="cta-inner">
        <h2 class="cta-h2">YOUR MILES.<br>ON RECORD.</h2>
        <p class="cta-body">Get early access to Moments and claim your handle before someone else does.</p>
        <router-link to="/waitlist" class="btn-primary">Get early access</router-link>
      </div>
    </section>

  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import MomentTile from '@/components/MomentTile.vue'
import ActivityBoard from '@/components/ActivityBoard.vue'
import { useUnits } from '@/composables/useUnits'

useHead({
  title: 'Runnit — Every Run Goes on the Record',
  link: [{ rel: 'canonical', href: 'https://runnit.live' }],
  meta: [
    { name: 'description', content: 'Runnit is the social fitness app for athletes who put every mile on the record. GPS tracking, clubs, AI training plans, and Moments — one photo, auto-stamped with your data.' },
    { property: 'og:title', content: 'Runnit — Every Run Goes on the Record' },
    { property: 'og:description', content: 'GPS tracking, clubs, AI training plans, and Moments — one photo, auto-stamped with your data.' },
    { property: 'og:url', content: 'https://runnit.live' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Runnit — Every Run Goes on the Record' },
    { name: 'twitter:description', content: 'Social fitness for athletes who put every mile on the record.' },
    { name: 'twitter:image', content: 'https://runnit.live/og-image.png' },
  ]
})

const { formatDistance, formatDurationClock, formatElevation, paceLabel } = useUnits()

// ── Demo data ──────────────────────────────────────────────

const heroMoments = [
  { handle: '@theo',   photo: null, distanceMeters: 5020,  paceSecPerKm: 261 },
  { handle: '@maya.k', photo: null, distanceMeters: 21100, paceSecPerKm: 278 },
  { handle: '@wren',   photo: null, distanceMeters: 8000,  paceSecPerKm: 238 },
  { handle: '@marcus', photo: null, distanceMeters: 30200, paceSecPerKm: 310 },
]

const features = [
  { num: '01', name: 'AI training plans',    desc: '12-week periodized blocks that adapt to the runs you actually log — not a static PDF you ignore by week three.' },
  { num: '02', name: 'Live GPS tracking',    desc: 'Record on your wrist or your phone. Friends see the dot move in real time, mile by mile.' },
  { num: '03', name: 'Clubs that move',      desc: 'Find the people who run your pace and your hours. Weekly boards, shared routes, real meetups.' },
  { num: '04', name: 'Strava & Garmin sync', desc: 'Bring your history with you. Two-way sync means nothing you\'ve already done gets left behind.' },
]

const detailActivity = { distanceMeters: 8000, paceSecPerKm: 238, timeSec: 1904, elevationMeters: 82 }

const detailPace = computed(() => {
  const minPerKm = detailActivity.paceSecPerKm / 60
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const reactions = [
  { type: 'LIKE', label: 'Like',  count: 41, selected: true },
  { type: 'FIRE', label: 'Fire',  count: 53, selected: false },
  { type: 'CLAP', label: 'Clap',  count: 12, selected: false },
]

const boardRows = [
  { name: 'Maya Kessler', club: 'East Side Run Club', distanceMeters: 21100, paceSecPerKm: 278, fire: 128 },
  { name: 'Theo Albright', club: 'Dawn Patrol',       distanceMeters: 16000, paceSecPerKm: 245, fire: 96  },
  { name: 'Priya Nair',    club: 'Bridgerunners',     distanceMeters: 12400, paceSecPerKm: 292, fire: 74  },
  { name: 'Marcus Lee',    club: 'Trackhouse',         distanceMeters: 30200, paceSecPerKm: 310, fire: 61  },
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
/* ── Base ── */
.home-page {
  min-height: 100vh;
  background: #fff;
  padding-top: var(--nav-h, 64px);
  font-family: Futura, 'Futura PT', 'Avenir Next', Avenir, system-ui, sans-serif;
  color: #000;
}

.home-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── Shared type ── */
.kicker {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 16px;
}
.kicker-light { color: #767676; }

.section-h2 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.0;
  margin: 14px 0 38px;
}

/* ── Buttons ── */
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  background: #0052FF;
  color: #fff;
  font-family: inherit;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid #0052FF;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
}
.btn-primary:hover { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }

.btn-ghost-dark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  background: transparent;
  color: #fff;
  font-family: inherit;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer;
  transition: border-color 0.12s;
}
.btn-ghost-dark:hover { border-color: #fff; color: #fff; text-decoration: none; }

/* ── HERO ── */
.hero {
  background: #000;
  color: #fff;
  padding: 80px 24px 0;
}
.hero-inner {
  max-width: 1000px;
  margin: 0 auto;
}
.hero-h1 {
  font-size: clamp(3rem, 8vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.92;
  margin: 16px 0 26px;
  max-width: 780px;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}
.moment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #1d1d1d;
  border: 1px solid #1d1d1d;
  margin-top: 0;
}

/* ── HOW IT WORKS ── */
.hiw-section {
  padding: 72px 0;
  background: #fff;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
}
.newsprint-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.np-card {
  background: #fff;
  padding: 34px;
}
.np-num {
  font-weight: 900;
  font-size: 1.1rem;
  margin-bottom: 18px;
}
.np-title {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}
.np-body {
  color: #767676;
  line-height: 1.6;
  font-size: 0.92rem;
  margin: 0;
}

/* ── FEATURE INDEX ── */
.feature-section {
  padding: 72px 0;
  background: #fff;
  border-bottom: 1px solid #E5E5E5;
}
.feature-list { margin-top: 0; }
.feature-row {
  display: grid;
  grid-template-columns: 60px 1.1fr 1.3fr;
  gap: 24px;
  align-items: start;
  padding: 26px 0;
  border-top: 1px solid #E5E5E5;
}
.feature-row:last-child { border-bottom: 1px solid #E5E5E5; }
.f-num {
  font-weight: 900;
  font-size: 1.05rem;
  padding-top: 2px;
}
.f-name {
  font-weight: 800;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.f-desc {
  color: #767676;
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
}

/* ── MOMENT DETAIL ── */
.detail-section {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
}
.detail-photo-panel {
  position: relative;
  background: #111;
  min-height: 560px;
}
.detail-placeholder {
  position: absolute;
  inset: 0;
  background: #1a1a1a;
}
.detail-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0) 48%);
  pointer-events: none;
}
.detail-chip {
  position: absolute;
  left: 20px;
  top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.detail-avatar {
  width: 36px;
  height: 36px;
  background: #fff;
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.78rem;
  flex-shrink: 0;
}
.detail-chip-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}
.detail-chip-handle {
  font-size: 0.64rem;
  color: rgba(255,255,255,0.7);
}
.data-stamp {
  position: absolute;
  left: 20px;
  bottom: 20px;
  display: flex;
  border: 1px solid rgba(255,255,255,0.3);
}
.stamp-cell {
  padding: 9px 16px;
  border-right: 1px solid rgba(255,255,255,0.3);
}
.stamp-cell:last-child { border-right: none; }
.stamp-label {
  font-size: 0.56rem;
  letter-spacing: 0.16em;
  color: rgba(255,255,255,0.65);
  text-transform: uppercase;
  margin-bottom: 3px;
}
.stamp-value {
  font-size: 1.05rem;
  font-weight: 900;
  color: #fff;
}

.detail-info-panel {
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fff;
}
.detail-h2 {
  font-size: clamp(1.6rem, 3vw, 2.1rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.04;
  margin: 12px 0 24px;
}

/* 2×2 stat grid */
.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
  margin-bottom: 28px;
}
.stat-cell {
  background: #fff;
  padding: 18px 20px;
}
.stat-label {
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 6px;
}
.stat-value {
  font-size: 1.4rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1;
}

/* Reaction bar */
.reaction-bar {
  display: flex;
  border: 1px solid #E5E5E5;
}
.reaction-btn {
  flex: 1;
  text-align: center;
  padding: 13px 0;
  font-family: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  border: none;
  border-right: 1px solid #E5E5E5;
  background: #fff;
  color: #767676;
  cursor: pointer;
  transition: color 0.12s;
}
.reaction-btn:last-child { border-right: none; }
.reaction-btn:hover { color: #000; }
.reaction-selected {
  color: #000;
  border-bottom: 2px solid #000;
}

/* ── ACTIVITY BOARD ── */
.board-section {
  padding: 72px 0;
  background: #F5F5F5;
  border-bottom: 1px solid #E5E5E5;
}

/* ── FINAL CTA ── */
.final-cta {
  background: #000;
  color: #fff;
  padding: 84px 24px;
  text-align: center;
}
.cta-inner { max-width: 600px; margin: 0 auto; }
.cta-h2 {
  font-size: clamp(2.5rem, 6vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.94;
  margin: 0 0 18px;
}
.cta-body {
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  font-size: 0.98rem;
  max-width: 440px;
  margin: 0 auto 30px;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .moment-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-section { grid-template-columns: 1fr; }
  .detail-photo-panel { min-height: 420px; }
  .detail-info-panel { padding: 36px 24px; }
  .newsprint-grid-3 { grid-template-columns: 1fr; }
}

@media (max-width: 720px) {
  .feature-row {
    grid-template-columns: 48px 1fr;
    grid-template-rows: auto auto;
  }
  .f-num { grid-row: 1; }
  .f-name { grid-row: 1; }
  .f-desc { grid-column: 2; grid-row: 2; }
}

@media (max-width: 560px) {
  .hero { padding: 64px 24px 0; }
  .hero-actions { flex-direction: column; align-items: flex-start; }
  .btn-primary, .btn-ghost-dark { width: 100%; }
  .feature-row { grid-template-columns: 1fr; }
  .f-num { font-size: 0.85rem; }
  .detail-info-panel { padding: 28px 20px; }
  .stat-value { font-size: 1.15rem; }
}
</style>
