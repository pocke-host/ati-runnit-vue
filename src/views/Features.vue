<template>
  <main class="features-page">

    <!-- 001 HERO ─ black -->
    <section class="hero">
      <div class="page-inner">
        <SectionIndex :num="1" label="What's Inside" :on-dark="true" />
        <h1 class="hero-h1">BUILT FOR THE WORK.<br>NOT THE AESTHETIC.</h1>
        <p class="hero-sub">Every feature earns its place. No badges, no streaks, no noise — just the tools serious athletes actually open the app for.</p>
      </div>
    </section>

    <!-- 002 MOMENTS ─ black 2-col -->
    <section class="moments-feature">
      <div class="moments-photo-col">
        <div class="photo-placeholder"></div>
        <div class="photo-overlay" aria-hidden="true"></div>
        <div class="photo-chip">
          <span class="chip-handle">@maya.k</span>
          <span class="chip-time">06:12</span>
        </div>
        <div class="data-stamp">
          <div class="stamp-cell"><div class="stamp-label">DIST</div><div class="stamp-value">21.1<span class="stamp-unit">KM</span></div></div>
          <div class="stamp-cell"><div class="stamp-label">PACE</div><div class="stamp-value">4:38</div></div>
          <div class="stamp-cell stamp-cell--last"><div class="stamp-label">TIME</div><div class="stamp-value">1:37:42</div></div>
        </div>
      </div>
      <div class="moments-text-col">
        <SectionIndex :num="2" label="Runnit Moments" :on-dark="true" />
        <h2 class="feature-h2">One photo.<br>Auto-stamped.</h2>
        <div class="bullet-list">
          <div class="bullet-row">Distance, pace and time print onto the shot — automatically</div>
          <div class="bullet-row">One frame, no filters, no second takes</div>
          <div class="bullet-row">Posted straight to the crew that ran it with you</div>
        </div>
      </div>
    </section>

    <!-- 003 GPS TRACKING ─ white 2-col reversed -->
    <section class="gps-feature">
      <div class="gps-text-col">
        <SectionIndex :num="3" label="Live GPS Tracking" />
        <h2 class="feature-h2-light">Your route.<br>Live.</h2>
        <div class="bullet-list-light">
          <div class="bullet-row-light">Friends watch your dot move, mile by mile, in real time</div>
          <div class="bullet-row-light">Splits, elevation and heart rate captured automatically</div>
          <div class="bullet-row-light">Routes you can save, share, and run again</div>
        </div>
      </div>
      <div class="gps-map-col">
        <svg viewBox="0 0 640 460" preserveAspectRatio="none" class="route-svg">
          <path d="M70,380 C170,300 150,200 260,210 C380,221 350,90 460,120 C540,142 520,300 600,250" fill="none" stroke="#cfcfcf" stroke-width="3" :stroke-dasharray="pathLen" :stroke-dashoffset="pathLen" class="route-path"></path>
          <circle cx="70" cy="380" r="5" fill="#0052FF"></circle>
          <circle cx="600" cy="250" r="5" fill="#000"></circle>
          <circle cx="600" cy="250" r="3" fill="none" stroke="#000" stroke-width="1.5" class="ping-circle"></circle>
        </svg>
        <div class="live-badge">
          <span class="live-dot"></span>
          <span class="live-text">Live</span>
        </div>
      </div>
    </section>

    <!-- 004 THE WHOLE KIT ─ smoke -->
    <section class="kit-section">
      <div class="page-inner">
        <SectionIndex :num="4" label="Everything Included" />
        <h2 class="section-h2">The whole kit.</h2>
        <div class="kit-grid">
          <div v-for="item in kitItems" :key="item.num" class="kit-card">
            <div class="kit-num">{{ item.num }}</div>
            <div class="kit-name">{{ item.name }}</div>
            <div class="kit-desc">{{ item.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 005 WHAT WE LEAVE OUT ─ white -->
    <section class="restraint-section">
      <div class="page-inner">
        <SectionIndex :num="5" label="Restraint" />
        <h2 class="section-h2">What we leave out.</h2>
        <p class="restraint-sub">The features we said no to matter as much as the ones we shipped.</p>
        <div class="restraint-grid">
          <div class="restraint-card">
            <div class="restraint-title">No badges or streaks</div>
            <p class="restraint-body">Your training isn't a video game. We don't hand out trophies for showing up.</p>
          </div>
          <div class="restraint-card">
            <div class="restraint-title">No algorithmic feed</div>
            <p class="restraint-body">You see the people you follow, in the order they ran. Nothing reshuffled, nothing promoted.</p>
          </div>
          <div class="restraint-card">
            <div class="restraint-title">No ads, ever</div>
            <p class="restraint-body">You're the athlete, not the product. Runnit is paid for by the people who use it.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA ─ black -->
    <section class="final-cta">
      <div class="finish-tick"></div>
      <div class="cta-inner">
        <h2 class="cta-h2">START TRAINING.</h2>
        <p class="cta-body">Join the waitlist and be first in when we open your city.</p>
        <router-link to="/waitlist" class="btn-cta">Join the Waitlist</router-link>
      </div>
    </section>

  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'
import SectionIndex from '@/components/SectionIndex.vue'

useHead({
  title: 'Features — Runnit',
  meta: [
    { name: 'description', content: 'Built for the work, not the aesthetic. GPS tracking, Moments, clubs, live sharing — every feature earns its place.' },
  ]
})

const pathLen = 1600

const kitItems = [
  { num: '01', name: 'GPS',       desc: 'Wrist or phone, mile-accurate' },
  { num: '02', name: 'Clubs',     desc: 'Crews that run your pace' },
  { num: '03', name: 'Plans',     desc: 'Adaptive 12-week blocks' },
  { num: '04', name: 'Strava',    desc: 'Two-way history sync' },
  { num: '05', name: 'Garmin',    desc: 'Auto-import every device' },
  { num: '06', name: 'Moments',   desc: 'Photo + stamp, one tap' },
  { num: '07', name: 'PRs',       desc: 'Every record, tracked' },
  { num: '08', name: 'Live Share',desc: 'Friends watch in real time' },
]
</script>

<style scoped>
.features-page {
  min-height: 100vh;
  background: #fff;
  font-family: Futura, 'Futura PT', 'Avenir Next', Avenir, 'Jost', system-ui, sans-serif;
  color: #000;
}

.page-inner {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 24px;
}

/* ── HERO ── */
.hero {
  background: #000;
  color: #fff;
  padding: 88px 0 80px;
}
.hero-h1 {
  font-size: clamp(2.6rem, 6vw, 4.25rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.94;
  margin: 18px 0 0;
  max-width: 880px;
  animation: rkWipe 0.85s cubic-bezier(0.65,0,0.35,1) 0.08s both;
}
.hero-sub {
  max-width: 520px;
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  font-size: 1rem;
  margin: 24px 0 0;
  animation: rkRise 0.6s ease-out 0.3s both;
}

/* ── MOMENTS FEATURE ─ 2-col black ── */
.moments-feature {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #000;
  color: #fff;
  border-top: 1px solid rgba(255,255,255,0.12);
}
.moments-photo-col {
  position: relative;
  min-height: 480px;
  background: #111;
  border-right: 1px solid rgba(255,255,255,0.12);
}
.photo-placeholder {
  position: absolute;
  inset: 0;
  background: #181818;
}
.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0) 50%);
  pointer-events: none;
}
.photo-chip {
  position: absolute;
  left: 18px;
  top: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.55);
  padding: 7px 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
.chip-handle { font-size: 0.66rem; font-weight: 600; color: #fff; }
.chip-time   { font-size: 0.62rem; color: rgba(255,255,255,0.6); }
.data-stamp {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: flex;
  border: 1px solid rgba(255,255,255,0.3);
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.stamp-cell { padding: 8px 14px; border-right: 1px solid rgba(255,255,255,0.3); }
.stamp-cell--last { border-right: none; }
.stamp-label { font-size: 0.54rem; letter-spacing: 0.14em; color: rgba(255,255,255,0.6); text-transform: uppercase; }
.stamp-value { font-size: 0.95rem; font-weight: 600; color: #fff; }
.stamp-unit  { font-size: 0.58rem; color: rgba(255,255,255,0.65); margin-left: 3px; }

.moments-text-col {
  padding: 56px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.feature-h2 {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.0;
  margin: 14px 0 26px;
}
.bullet-list { display: flex; flex-direction: column; }
.bullet-row {
  font-size: 1rem;
  font-weight: 700;
  border-top: 1px solid rgba(255,255,255,0.15);
  padding: 14px 0;
}

/* ── GPS FEATURE ─ white 2-col reversed ── */
.gps-feature {
  display: grid;
  grid-template-columns: 1fr 1.05fr;
  background: #fff;
}
.gps-text-col {
  padding: 64px 48px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.feature-h2-light {
  font-size: clamp(2rem, 4vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.0;
  margin: 14px 0 26px;
}
.bullet-list-light { display: flex; flex-direction: column; }
.bullet-row-light {
  font-size: 1rem;
  font-weight: 700;
  border-top: 1px solid #E5E5E5;
  padding: 14px 0;
}
.bullet-row-light:last-child { border-bottom: 1px solid #E5E5E5; }

.gps-map-col {
  position: relative;
  min-height: 440px;
  background: #F5F5F5;
  border-left: 1px solid #E5E5E5;
  overflow: hidden;
}
.route-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
.route-path {
  animation: rkDraw 2.8s ease-out 0.2s forwards;
}
.ping-circle {
  animation: rkPing 2s ease-out 1.4s infinite;
}
.live-badge {
  position: absolute;
  left: 18px;
  bottom: 18px;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(255,255,255,0.92);
  padding: 6px 10px;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}
.live-dot {
  width: 7px;
  height: 7px;
  background: #0052FF;
  display: inline-block;
  animation: rkBlink 1.4s ease-in-out infinite;
}
.live-text {
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #000;
}

/* ── KIT SECTION ── */
.kit-section {
  background: #F5F5F5;
  border-top: 1px solid #E5E5E5;
}
.kit-section .page-inner { padding-top: 72px; padding-bottom: 72px; }

.section-h2 {
  font-size: clamp(2.2rem, 4vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.0;
  margin: 14px 0 36px;
  max-width: 620px;
}

.kit-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.kit-card {
  background: #fff;
  padding: 28px;
}
.kit-num {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 1.1rem;
  color: #767676;
  font-variant-numeric: tabular-nums;
}
.kit-name {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-weight: 600;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin: 14px 0 8px;
}
.kit-desc {
  color: #767676;
  line-height: 1.5;
  font-size: 0.86rem;
}

/* ── RESTRAINT ── */
.restraint-section {
  background: #fff;
  border-top: 1px solid #E5E5E5;
}
.restraint-section .page-inner { padding-top: 72px; padding-bottom: 72px; }
.restraint-sub {
  color: #767676;
  line-height: 1.6;
  font-size: 1rem;
  margin: 0 0 36px;
  max-width: 560px;
}
.restraint-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: #E5E5E5;
  border: 1px solid #E5E5E5;
}
.restraint-card {
  background: #fff;
  padding: 36px;
}
.restraint-title {
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.02em;
  margin-bottom: 10px;
}
.restraint-body {
  color: #767676;
  line-height: 1.6;
  font-size: 0.92rem;
  margin: 0;
}

/* ── FINAL CTA ── */
.final-cta { background: #000; color: #fff; }
.finish-tick {
  height: 9px;
  background-image: repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 2px, transparent 2px 9px);
}
.cta-inner {
  padding: 80px 48px 84px;
  text-align: center;
}
.cta-h2 {
  font-size: clamp(2.6rem, 5vw, 3.75rem);
  font-weight: 900;
  letter-spacing: -0.04em;
  line-height: 0.94;
  margin: 0;
  animation: rkWipe 0.85s cubic-bezier(0.65,0,0.35,1) both;
}
.cta-body {
  color: rgba(255,255,255,0.6);
  line-height: 1.6;
  margin: 18px auto 30px;
  max-width: 420px;
}
.btn-cta {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  background: #0052FF;
  color: #fff;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
  border: 2px solid #0052FF;
  transition: background 0.15s, border-color 0.15s;
}
.btn-cta:hover { background: #003ECC; border-color: #003ECC; color: #fff; text-decoration: none; }

/* ── Responsive ── */
@media (max-width: 860px) {
  .moments-feature { grid-template-columns: 1fr; }
  .moments-photo-col { min-height: 360px; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.12); }
  .moments-text-col { padding: 40px 32px; }
  .gps-feature { grid-template-columns: 1fr; }
  .gps-map-col { min-height: 300px; border-left: none; border-top: 1px solid #E5E5E5; }
  .gps-text-col { padding: 40px 32px; }
  .kit-grid { grid-template-columns: repeat(2, 1fr); }
  .restraint-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .page-inner { padding-left: 22px; padding-right: 22px; }

  /* Hero */
  .hero { padding: 52px 0 48px; }
  .hero-h1 { font-size: 38px !important; line-height: 0.96; }
  .hero-sub { font-size: 0.95rem; }

  /* Moments */
  .moments-photo-col { min-height: 300px; }
  .moments-text-col { padding: 40px 22px; }
  .photo-chip { padding: 7px 12px; }
  .stamp-cell { padding: 7px 12px; }
  .stamp-value { font-size: 0.9rem; }

  /* GPS */
  .gps-text-col { padding: 44px 22px 36px; }
  .gps-map-col { height: 240px; min-height: unset; }

  /* Kit */
  .kit-section .page-inner { padding-top: 44px; padding-bottom: 44px; }
  .kit-grid { grid-template-columns: repeat(2, 1fr); }
  .kit-card { padding: 20px; }
  .kit-name { font-size: 0.72rem; }
  .kit-desc { font-size: 0.8rem; }

  /* Restraint */
  .restraint-section .page-inner { padding-top: 44px; padding-bottom: 44px; }
  .restraint-grid { flex-direction: column; }
  .restraint-card { padding: 26px 22px; }

  /* Section h2 */
  .section-h2 { font-size: 32px !important; }
  .feature-h2, .feature-h2-light { font-size: 32px !important; }

  /* CTA */
  .cta-inner { padding: 56px 22px 60px; }
  .cta-h2 { font-size: 36px !important; }
  .cta-inner .btn-cta { display: block; width: 100%; text-align: center; padding: 15px 0; }
}
</style>
