<template>
  <main class="features-page">

    <!-- HERO — ink -->
    <section class="hero">
      <div class="page-inner">
        <span class="gr-eyebrow-badge">What's inside</span>
        <h1 class="hero-h1">Everything a session<br>should remember.</h1>
        <p class="hero-sub">Track, share, compete, train. The whole kit that used to take five apps — in one. Built by athletes who'd rather be outside than switching tabs.</p>
      </div>
    </section>

    <!-- MOMENTS — 2-col -->
    <section class="moments-feature">
      <div class="moments-photo-col">
        <div class="photo-placeholder"></div>
        <div class="photo-overlay"></div>
        <div class="photo-chip">@maya.k · 06:12</div>
        <div class="data-stamp">
          <div class="stamp-cell"><div class="stamp-lbl">DIST</div><div class="stamp-val">21.1</div></div>
          <div class="stamp-cell"><div class="stamp-lbl">PACE</div><div class="stamp-val">4:38</div></div>
          <div class="stamp-cell stamp-cell--last"><div class="stamp-lbl">TIME</div><div class="stamp-val">1:37:42</div></div>
        </div>
        <span class="posted-badge">Posted ✓</span>
      </div>
      <div class="moments-text-col">
        <div class="gr-eyebrow">Moments</div>
        <h2 class="section-h2">One photo.<br>Auto-stamped.</h2>
        <div class="bullet-list">
          <div class="bullet-row">Distance, pace &amp; time print onto the shot automatically</div>
          <div class="bullet-row">One frame — no filters, no second takes</div>
          <div class="bullet-row">Straight to the crew that ran it with you</div>
        </div>
      </div>
    </section>

    <!-- EVERYTHING INCLUDED grid -->
    <section class="kit-section">
      <div class="page-inner">
        <div class="gr-eyebrow">The whole kit</div>
        <h2 class="section-h2">Everything included.</h2>
        <div class="kit-grid">
          <div class="kit-cell">
            <div class="kit-num">01</div>
            <div class="kit-name">GPS Tracking</div>
            <div class="kit-desc">Wrist or phone, mile-accurate every time</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">02</div>
            <div class="kit-name">Crews</div>
            <div class="kit-desc">Clubs that train at your pace</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">03</div>
            <div class="kit-name">Segments</div>
            <div class="kit-desc">Chase course records block by block</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">04</div>
            <div class="kit-name">Adaptive Plans</div>
            <div class="kit-desc">12-week blocks that adjust to your load</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">05</div>
            <div class="kit-name">Live Share</div>
            <div class="kit-desc">Your crew tracks you in real time</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">06</div>
            <div class="kit-name">Personal Records</div>
            <div class="kit-desc">Every benchmark, automatically tracked</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">07</div>
            <div class="kit-name">Challenges</div>
            <div class="kit-desc">Monthly distance & time races</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">08</div>
            <div class="kit-name">Coaching</div>
            <div class="kit-desc">Assign plans, track athlete load & progress</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">09</div>
            <div class="kit-name">Workout Library</div>
            <div class="kit-desc">Build custom sessions, drills & interval sets</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">10</div>
            <div class="kit-name">TrainingPeaks</div>
            <div class="kit-desc">Import & export structured plans seamlessly</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">11</div>
            <div class="kit-name">Recovery</div>
            <div class="kit-desc">HRV, rest days & training load in one view</div>
          </div>
          <div class="kit-cell">
            <div class="kit-num">12</div>
            <div class="kit-name">Sync</div>
            <div class="kit-desc">Strava, Garmin, Apple Health, Wahoo</div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHAT WE LEAVE OUT -->
    <section class="leave-out-section">
      <div class="page-inner">
        <div class="gr-eyebrow">Restraint</div>
        <h2 class="section-h2">What we leave out.</h2>
        <p class="section-intro">The stuff we said no to matters as much as the stuff we shipped.</p>
        <div class="leave-grid">
          <div class="leave-cell">
            <div class="leave-title">No badges or streaks</div>
            <div class="leave-body">Your training isn't a video game.</div>
          </div>
          <div class="leave-cell">
            <div class="leave-title">No algorithmic feed</div>
            <div class="leave-body">The people you follow, in the order they ran.</div>
          </div>
          <div class="leave-cell leave-cell--last">
            <div class="leave-title">No ads, ever</div>
            <div class="leave-body">You're the athlete, not the product.</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA — cobalt -->
    <section class="final-cta">
      <h2 class="cta-h2">Start training.</h2>
      <p class="cta-sub">Join the waitlist — first in when we open your city.</p>
      <router-link to="/waitlist" class="btn-pill-paper">Join the Waitlist</router-link>
    </section>

  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'Features — Runnit',
  meta: [
    { name: 'description', content: 'Everything a run should remember. GPS tracking, Moments, clubs, live sharing — every feature earns its place.' },
  ]
})

const kitItems = [
  { num: '01', name: 'GPS Tracking',  desc: 'Wrist or phone, mile-accurate' },
  { num: '02', name: 'Crews',         desc: 'Clubs that run your pace' },
  { num: '03', name: 'Segments',      desc: 'Chase crowns block by block' },
  { num: '04', name: 'Plans',         desc: 'Adaptive 12-week blocks' },
  { num: '05', name: 'Live Share',    desc: 'Friends watch in real time' },
  { num: '06', name: 'PRs',          desc: 'Every record, tracked' },
  { num: '07', name: 'Challenges',    desc: 'Monthly distance races' },
  { num: '08', name: 'Sync',         desc: 'Strava, Garmin, Apple Health' },
]
</script>

<style scoped>
.features-page {
  min-height: 100vh;
  background: #FBF6EC;
  font-family: 'Hanken Grotesk', system-ui, sans-serif;
  color: #16130F;
  padding-top: var(--nav-h, 66px);
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
  padding: 60px 0 56px;
  border-bottom: 2px solid #16130F;
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
  font-size: clamp(56px, 8vw, 96px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 20px 0 0;
  animation: rkRise 0.6s ease-out both;
}
.hero-sub {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(251,246,236,0.68);
  max-width: 520px;
  margin: 22px 0 0;
}

/* ── MOMENTS ── */
.moments-feature {
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  border-bottom: 2px solid #16130F;
}
.moments-photo-col {
  position: relative;
  background: #EDE5D5;
  min-height: 420px;
  border-right: 2px solid #16130F;
  overflow: hidden;
}
.photo-placeholder {
  position: absolute;
  inset: 0;
  background: #D5C9B5;
  background-image: url('https://images.unsplash.com/photo-1486218119243-13301bc199c2?w=600&fit=crop&q=80');
  background-size: cover;
  background-position: center;
}
.photo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0) 50%);
}
.photo-chip {
  position: absolute;
  left: 20px;
  top: 18px;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 600;
  color: #fff;
}
.data-stamp {
  position: absolute;
  left: 20px;
  bottom: 20px;
  display: flex;
  border: 1px solid rgba(255,255,255,0.35);
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-variant-numeric: tabular-nums;
}
.stamp-cell {
  padding: 9px 15px;
  border-right: 1px solid rgba(255,255,255,0.35);
}
.stamp-cell--last { border-right: none; }
.stamp-lbl { font-size: 0.52rem; letter-spacing: 0.12em; color: rgba(255,255,255,0.6); }
.stamp-val { font-size: 1.05rem; font-weight: 600; color: #fff; }
.posted-badge {
  position: absolute;
  right: 16px;
  top: 16px;
  background: #2A55F5;
  color: #fff;
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 7px 11px;
  border: 2px solid #16130F;
  transform: rotate(5deg);
}
.moments-text-col {
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #FBF6EC;
}

/* ── SHARED ── */
.gr-eyebrow {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #2A55F5;
}
.section-h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(40px, 5vw, 56px);
  line-height: 0.88;
  text-transform: uppercase;
  margin: 8px 0 16px;
}
.section-intro {
  color: #5A5348;
  font-size: 1rem;
  margin: 0 0 26px;
  max-width: 520px;
}

.bullet-list { display: flex; flex-direction: column; }
.bullet-row {
  font-size: 1rem;
  font-weight: 700;
  border-top: 1px solid #E7DFCE;
  padding: 14px 0;
}
.bullet-row:last-child { border-bottom: 1px solid #E7DFCE; }

/* ── KIT GRID ── */
.kit-section {
  padding: 52px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.kit-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border: 2px solid #16130F;
  margin-top: 28px;
}
.kit-cell {
  padding: 22px;
  border-right: 2px solid #16130F;
  border-bottom: 2px solid #16130F;
}
.kit-cell:nth-child(4n) { border-right: none; }
.kit-cell:nth-child(n+9) { border-bottom: none; }
.kit-num {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.9rem;
  font-weight: 600;
  color: #2A55F5;
}
.kit-name { font-weight: 800; font-size: 1.05rem; margin: 10px 0 4px; }
.kit-desc { color: #5A5348; font-size: 0.86rem; line-height: 1.5; }

/* ── LEAVE OUT ── */
.leave-out-section {
  padding: 52px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.leave-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 2px solid #16130F;
}
.leave-cell {
  padding: 28px;
  border-right: 2px solid #16130F;
}
.leave-cell--last { border-right: none; }
.leave-title { font-weight: 800; font-size: 1.2rem; margin-bottom: 8px; }
.leave-body { color: #5A5348; line-height: 1.6; font-size: 0.9rem; }

/* ── CTA ── */
.final-cta {
  background: #2A55F5;
  color: #fff;
  padding: 60px 32px;
  text-align: center;
}
.cta-h2 {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 900;
  font-size: clamp(56px, 8vw, 88px);
  line-height: 0.84;
  text-transform: uppercase;
  margin: 0;
}
.cta-sub {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: 16px 0 24px;
  opacity: 0.92;
}
.btn-pill-paper {
  display: inline-block;
  background: #FBF6EC;
  color: #16130F;
  border: 2px solid #16130F;
  border-radius: 999px;
  padding: 14px 30px;
  font-weight: 800;
  font-size: 0.95rem;
  text-decoration: none;
  box-shadow: 4px 4px 0 #16130F;
  transition: opacity 0.15s;
}
.btn-pill-paper:hover { opacity: 0.85; text-decoration: none; color: #16130F; }

/* ── RESPONSIVE ── */
@media (max-width: 768px) {
  .moments-feature { grid-template-columns: 1fr; }
  .moments-photo-col { min-height: 300px; border-right: none; border-bottom: 2px solid #16130F; }
  .moments-text-col { padding: 36px 24px; }
  .kit-grid { grid-template-columns: repeat(2, 1fr); }
  .kit-cell:nth-child(2n) { border-right: none; }
  .kit-cell:nth-child(n+11) { border-bottom: none; }
  .leave-grid { grid-template-columns: 1fr; }
  .leave-cell { border-right: none; border-bottom: 2px solid #16130F; }
  .leave-cell--last { border-bottom: none; }
}
@media (max-width: 640px) {
  .page-inner { padding: 0 22px; }
  .hero { padding: 44px 0 40px; }
  .kit-section, .leave-out-section { padding: 40px 0; }
  .kit-grid { grid-template-columns: 1fr 1fr; }
  .final-cta { padding: 48px 22px; }
}
</style>
