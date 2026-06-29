<template>
  <main class="home-page">

    <!-- 001 HERO ─ black band -->
    <section class="hero">
      <div class="home-inner">
        <SectionIndex :num="1" label="The Record" :on-dark="true" />
        <h1 class="hero-h1">EVERY RUN GOES<br>ON THE RECORD.</h1>
        <p class="hero-sub">The social training app for distance athletes.<br>Run · Track · Post · Repeat.</p>
        <div class="hero-actions">
          <router-link to="/waitlist" class="btn-cta">Get Early Access</router-link>
          <a href="#moment-detail" class="btn-ghost" @click.prevent="scrollTo('moment-detail')">Watch a Moment</a>
        </div>
      </div>

      <!-- 4-up MomentTile grid -->
      <div class="home-inner">
        <div class="moment-grid">
          <MomentTile
            v-for="(m, i) in heroMoments"
            :key="m.handle"
            :handle="m.handle"
            :photo="m.photo"
            :distance-meters="m.distanceMeters"
            :pace-sec-per-km="m.paceSecPerKm"
            :style="{ animation: `rkRise 0.6s ease-out ${i * 0.08}s both` }"
          />
        </div>
        <div class="syncs-row">
          <span class="syncs-label">Syncs With</span>
          <span class="syncs-app">STRAVA</span>
          <span class="syncs-slash">/</span>
          <span class="syncs-app">GARMIN</span>
          <span class="syncs-slash">/</span>
          <span class="syncs-app">APPLE HEALTH</span>
        </div>
      </div>
    </section>

    <!-- 002 PROTOCOL ─ white -->
    <section class="section-white">
      <div class="home-inner">
        <SectionIndex :num="2" label="Protocol" />
        <h2 class="section-h2">Stop. Snap. It's posted.</h2>
        <div class="newsprint-grid-3">
          <div v-for="(step, i) in steps" :key="step.num" class="np-card" :style="{ animation: `rkRise 0.55s ease-out ${i * 0.1}s both` }">
            <div class="np-step-row">
              <span class="np-step-label">Step</span>
              <span class="np-num">{{ step.num }}</span>
            </div>
            <div class="np-title">{{ step.title }}</div>
            <p class="np-body">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 003 MOMENT DETAIL ─ 2-col -->
    <section id="moment-detail" class="detail-section">
      <div class="detail-photo-panel">
        <div class="detail-placeholder"></div>
        <div class="detail-overlay" aria-hidden="true"></div>
        <div class="detail-chip">
          <div class="detail-avatar">WO</div>
          <div class="detail-chip-info">
            <div class="detail-chip-name">Wren Okafor</div>
            <div class="detail-chip-handle">@wren · 05:58</div>
          </div>
        </div>
        <div class="data-stamp">
          <div class="stamp-cell"><div class="stamp-label">DIST</div><div class="stamp-value">8.00</div></div>
          <div class="stamp-cell"><div class="stamp-label">PACE</div><div class="stamp-value">{{ detailPace }}</div></div>
          <div class="stamp-cell stamp-cell--last"><div class="stamp-label">TIME</div><div class="stamp-value">{{ formatDurationClock(detailActivity.timeSec) }}</div></div>
        </div>
      </div>

      <div class="detail-info-panel">
        <SectionIndex :num="3" label="A Moment, In Full" />
        <h2 class="detail-h2">The data lives under the photo.</h2>
        <div class="stat-grid">
          <div class="stat-cell">
            <div class="stat-label">Distance</div>
            <div class="stat-value-row"><span class="stat-num">8.00</span><span class="stat-unit">KM</span></div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Avg Pace</div>
            <div class="stat-value-row"><span class="stat-num">{{ detailPace }}</span><span class="stat-unit">/KM</span></div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Moving Time</div>
            <div class="stat-value-row"><span class="stat-num">{{ formatDurationClock(detailActivity.timeSec) }}</span></div>
          </div>
          <div class="stat-cell">
            <div class="stat-label">Elevation</div>
            <div class="stat-value-row"><span class="stat-num">82</span><span class="stat-unit">M</span></div>
          </div>
        </div>
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

    <!-- 004 OFFICIAL RESULTS ─ smoke -->
    <section class="board-section">
      <div class="home-inner">
        <div class="board-header-row">
          <SectionIndex :num="4" label="Official Results" />
          <span class="week-tag">WK {{ currentWeek }} · 2026</span>
        </div>
        <h2 class="section-h2">The board doesn't lie.</h2>
        <ActivityBoard :rows="boardRows" />
      </div>
    </section>

    <!-- 005 CTA ─ black with finish-line tick -->
    <section class="final-cta">
      <div class="finish-tick"></div>
      <div class="cta-inner">
        <div class="cta-label">005 — The Start Line</div>
        <h2 class="cta-h2">YOUR MILES.<br>ON RECORD.</h2>
        <p class="cta-body">Get early access and claim your handle<br>before someone else does.</p>
        <router-link to="/waitlist" class="btn-cta">Get Early Access</router-link>
      </div>
    </section>

  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useHead } from '@unhead/vue'
import MomentTile from '@/components/MomentTile.vue'
import ActivityBoard from '@/components/ActivityBoard.vue'
import SectionIndex from '@/components/SectionIndex.vue'
import { useUnits } from '@/composables/useUnits'

useHead({
  title: 'Runnit — Every Run Goes on the Record',
  link: [{ rel: 'canonical', href: 'https://runnit.live' }],
  meta: [
    { name: 'description', content: 'Runnit is the social training app for distance athletes. GPS tracking, clubs, training plans, and Moments — one photo, auto-stamped with your data.' },
    { property: 'og:title', content: 'Runnit — Every Run Goes on the Record' },
    { property: 'og:description', content: 'GPS tracking, clubs, AI training plans, and Moments — one photo, auto-stamped with your data.' },
    { property: 'og:url', content: 'https://runnit.live' },
    { property: 'og:image', content: 'https://runnit.live/og-image.png' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ]
})

const { formatDurationClock } = useUnits()

const heroMoments = [
  { handle: '@theo',   photo: null, distanceMeters: 5020,  paceSecPerKm: 261 },
  { handle: '@maya.k', photo: null, distanceMeters: 21100, paceSecPerKm: 278 },
  { handle: '@wren',   photo: null, distanceMeters: 8000,  paceSecPerKm: 238 },
  { handle: '@marcus', photo: null, distanceMeters: 30200, paceSecPerKm: 310 },
]

const steps = [
  { num: '01', title: 'Finish your run',  desc: 'Hit stop on the watch or the app. Your splits, route and time are already captured.' },
  { num: '02', title: 'One photo',        desc: 'The sweat, the view, the finish line. One shot — no editing, no second takes.' },
  { num: '03', title: 'Auto-stamped',     desc: 'Distance and pace print onto the moment like a timing-mat receipt. Posted to your crew.' },
]

const detailActivity = { distanceMeters: 8000, paceSecPerKm: 238, timeSec: 1904, elevationMeters: 82 }

const detailPace = computed(() => {
  const minPerKm = detailActivity.paceSecPerKm / 60
  const mins = Math.floor(minPerKm)
  const secs = Math.round((minPerKm - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
})

const reactions = [
  { type: 'LIKE', label: 'Like', count: 41, selected: true },
  { type: 'FIRE', label: 'Fire', count: 53, selected: false },
  { type: 'CLAP', label: 'Clap', count: 12, selected: false },
]

const boardRows = [
  { name: 'Maya Kessler',  club: 'East Side Run Club', distanceMeters: 21100, paceSecPerKm: 278, fire: 128 },
  { name: 'Theo Albright', club: 'Dawn Patrol',        distanceMeters: 16000, paceSecPerKm: 245, fire: 96  },
  { name: 'Priya Nair',    club: 'Bridgerunners',      distanceMeters: 12400, paceSecPerKm: 292, fire: 74  },
  { name: 'Marcus Lee',    club: 'Trackhouse',          distanceMeters: 30200, paceSecPerKm: 310, fire: 61  },
]

const currentWeek = computed(() => {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 1)
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7)
})

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #fff;
  font-family: Futura, 'Futura PT', 'Avenir Next', Avenir, 'Jost', system-ui, sans-serif;
  color: #000;
}

.home-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── HERO ── */
.hero {
  background: #000;
  color: #fff;
  padding-top: 72px;
}
.hero-h1 {
  font-size: clamp(3rem, 7.4vw, 5.4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.9;
  margin: 18px 0 0;
  animation: rkRise 0.7s ease-out both;
}
.hero-sub {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 400;
  letter-spacing: 0.08em;
  line-height: 1.7;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin: 24px 0 0;
  max-width: 520px;
}
.hero-actions {
  display: flex;
  gap: 12px;
  margin: 34px 0 56px;
  flex-wrap: wrap;
}

/* ── BUTTONS ── */
.btn-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 24px;
  background: #0052FF;
  color: #fff;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid #0052FF;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.btn-cta:hover { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }

.btn-ghost {
  display: inline-flex;
  align-items: center;
  padding: 13px 24px;
  background: transparent;
  color: #fff;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.3);
  cursor: pointer;
  transition: border-color 0.15s;
}
.btn-ghost:hover { border-color: #fff; text-decoration: none; }

/* ── MOMENT GRID ── */
.moment-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #1d1d1d;
  border: 1px solid #1d1d1d;
}

.syncs-row {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 0 80px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
.syncs-label {
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.syncs-app {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.7);
}
.syncs-slash { color: rgba(255,255,255,0.25); }

/* ── PROTOCOL ── */
.section-white {
  background: #fff;
  border-top: 1px solid #E5E5E5;
}
.section-white .home-inner { padding-top: 76px; padding-bottom: 76px; }

.section-h2 {
  font-size: clamp(2.2rem, 4vw, 3rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.0;
  margin: 14px 0 36px;
  max-width: 620px;
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
.np-step-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 20px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
.np-step-label {
  font-size: 0.56rem;
  font-weight: 500;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #767676;
}
.np-num {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
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
  border-right: 1px solid #E5E5E5;
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
}
.detail-chip-name {
  font-size: 0.84rem;
  font-weight: 800;
  color: #fff;
}
.detail-chip-handle {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  color: rgba(255,255,255,0.7);
}
.data-stamp {
  position: absolute;
  left: 20px;
  bottom: 20px;
  display: flex;
  border: 1px solid rgba(255,255,255,0.3);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.stamp-cell {
  padding: 9px 16px;
  border-right: 1px solid rgba(255,255,255,0.3);
}
.stamp-cell--last { border-right: none; }
.stamp-label {
  font-size: 0.54rem;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.65);
  text-transform: uppercase;
}
.stamp-value {
  font-size: 1.05rem;
  font-weight: 600;
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
  font-size: clamp(1.7rem, 3vw, 2.2rem);
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
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.stat-cell {
  background: #fff;
  padding: 18px 20px;
}
.stat-label {
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #767676;
  margin-bottom: 4px;
}
.stat-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.stat-num {
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: -0.02em;
}
.stat-unit {
  font-size: 0.7rem;
  font-weight: 500;
  color: #767676;
}

/* Reaction bar */
.reaction-bar {
  display: flex;
  border: 1px solid #E5E5E5;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
.reaction-btn {
  flex: 1;
  text-align: center;
  padding: 13px 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: none;
  border-right: 1px solid #E5E5E5;
  background: #fff;
  color: #767676;
  cursor: pointer;
  transition: color 0.15s;
}
.reaction-btn:last-child { border-right: none; }
.reaction-btn:hover { color: #000; }
.reaction-selected {
  color: #000;
  font-weight: 600;
  border-bottom: 2px solid #000;
}

/* ── RESULTS BOARD ── */
.board-section {
  background: #F5F5F5;
  border-top: 1px solid #E5E5E5;
  border-bottom: 1px solid #E5E5E5;
}
.board-section .home-inner { padding-top: 76px; padding-bottom: 76px; }

.board-header-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 8px;
}
.week-tag {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #767676;
}

/* ── FINAL CTA ── */
.final-cta {
  background: #000;
  color: #fff;
}
.finish-tick {
  height: 10px;
  background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 2px, transparent 2px 9px);
}
.cta-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 80px 24px 84px;
  text-align: center;
}
.cta-label {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.64rem;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  margin-bottom: 20px;
}
.cta-h2 {
  font-size: clamp(2.6rem, 5.5vw, 4rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.94;
  margin: 0;
  animation: rkRise 0.7s ease-out both;
}
.cta-body {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.74rem;
  font-weight: 400;
  letter-spacing: 0.06em;
  line-height: 1.7;
  text-transform: uppercase;
  color: rgba(255,255,255,0.6);
  margin: 18px auto 30px;
  max-width: 440px;
}

/* ── Responsive ── */
@media (max-width: 860px) {
  .moment-grid { grid-template-columns: repeat(2, 1fr); }
  .detail-section { grid-template-columns: 1fr; }
  .detail-photo-panel { min-height: 380px; border-right: none; border-bottom: 1px solid #E5E5E5; }
  .detail-info-panel { padding: 36px 24px; }
  .newsprint-grid-3 { grid-template-columns: 1fr; }
}

@media (max-width: 560px) {
  .hero-actions { flex-direction: column; }
  .btn-cta, .btn-ghost { width: 100%; justify-content: center; }
  .detail-info-panel { padding: 28px 20px; }
  .syncs-row { flex-wrap: wrap; gap: 12px; padding-bottom: 48px; }
}
</style>
