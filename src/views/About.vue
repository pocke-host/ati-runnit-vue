<template>
  <main class="about-page">

    <!-- HERO — ink -->
    <section class="hero">
      <div class="page-inner">
        <span class="gr-eyebrow-badge">Our story</span>
        <h1 class="hero-h1">We built the app<br>we wanted to use.</h1>
      </div>
    </section>

    <!-- LEAD + 2-col story -->
    <section class="story-section">
      <div class="page-inner">
        <p class="story-lead">Most apps track your run. Runnit is where your run lives.</p>
        <div class="story-grid">
          <p class="story-body">Runnit started as one runner's frustration: the apps that tracked everything somehow felt like nothing. Numbers without a story. A feed full of strangers' splits and sponsored shoes.</p>
          <p class="story-body">So it got built — solo, in the hours around training — into the place a run actually lives. The photo. The route. The people who were there when your legs gave out at mile twenty.</p>
        </div>
      </div>
    </section>

    <!-- THREE THINGS -->
    <section class="beliefs-section">
      <div class="page-inner">
        <div class="gr-eyebrow">What we believe</div>
        <h2 class="section-h2">Three things, held hard.</h2>
        <div class="beliefs-grid">
          <div v-for="b in beliefs" :key="b.num" class="belief-card">
            <div class="belief-num">{{ b.num }}</div>
            <div class="belief-title">{{ b.title }}</div>
            <p class="belief-body">{{ b.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT'S BUILT — 2-col -->
    <section class="build-section">
      <div class="page-inner">
        <div class="build-grid">
          <div>
            <div class="gr-eyebrow">How it's built</div>
            <div class="stack-list">
              <div v-for="(item, i) in stackItems" :key="item" class="stack-row">
                <span class="stack-num">{{ String(i + 1).padStart(2, '0') }}</span>
                <span class="stack-name">{{ item }}</span>
              </div>
            </div>
          </div>
          <div class="build-copy">
            <p class="build-body">Runnit is built and maintained by one person, in the hours around marathon and Ironman training. Every feature earns its place because there's no room for the ones that don't.</p>
            <p class="build-bold">Beta opens summer 2026 — built in public, shaped by the people on the list.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA — cobalt -->
    <section class="final-cta">
      <h2 class="cta-h2">Come build with us.</h2>
      <p class="cta-sub">Get on the list and help shape what Runnit becomes.</p>
      <router-link to="/waitlist" class="btn-pill-paper">Join the Waitlist</router-link>
    </section>

  </main>
</template>

<script setup>
import { useHead } from '@unhead/vue'

useHead({
  title: 'About — Runnit',
  meta: [
    { name: 'description', content: 'We built the app we wanted to use. Runnit is built by runners, for runners.' },
  ]
})

const beliefs = [
  { num: '01', title: 'Community over metrics',      body: 'The people you run with matter more than the numbers you post.' },
  { num: '02', title: 'Real athletes, not influencers', body: 'No sponsored feeds, no perfect lighting. Just people who did the work.' },
  { num: '03', title: 'Data that means something',   body: "Every stat has to earn the pixels. If it doesn't change how you train, it's gone." },
]

const stackItems = [
  'iOS — native Swift',
  'Backend — Spring Boot',
  'Data — MySQL',
  'Infra — Render + PlanetScale',
]
</script>

<style scoped>
.about-page {
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
  font-size: clamp(52px, 8vw, 96px);
  line-height: 0.82;
  text-transform: uppercase;
  margin: 20px 0 0;
  animation: rkRise 0.6s ease-out both;
}

/* ── STORY ── */
.story-section {
  padding: 56px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.story-lead {
  font-family: 'Big Shoulders Display', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.02;
  letter-spacing: 0.01em;
  text-transform: uppercase;
  margin: 0 0 26px;
  max-width: 760px;
}
.story-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}
.story-body {
  color: #5A5348;
  line-height: 1.7;
  font-size: 1rem;
  margin: 0;
}

/* ── BELIEFS ── */
.beliefs-section {
  padding: 52px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
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
  line-height: 0.9;
  text-transform: uppercase;
  margin: 8px 0 28px;
}
.beliefs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 2px solid #16130F;
}
.belief-card {
  padding: 28px;
  border-right: 2px solid #16130F;
}
.belief-card:last-child { border-right: none; }
.belief-num {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #2A55F5;
  margin-bottom: 14px;
}
.belief-title { font-weight: 800; font-size: 1.2rem; margin-bottom: 8px; }
.belief-body { color: #5A5348; line-height: 1.6; font-size: 0.9rem; margin: 0; }

/* ── BUILD ── */
.build-section {
  padding: 52px 0;
  background: #FBF6EC;
  border-bottom: 2px solid #16130F;
}
.build-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 36px;
  align-items: center;
}
.stack-list { margin-top: 16px; }
.stack-row {
  display: flex;
  gap: 14px;
  align-items: baseline;
  font-weight: 800;
  font-size: 1.1rem;
  border-top: 1px solid #E7DFCE;
  padding: 14px 0;
}
.stack-row:last-child { border-bottom: 1px solid #E7DFCE; }
.stack-num {
  font-family: 'Spline Sans Mono', ui-monospace, monospace;
  font-size: 0.7rem;
  font-weight: 500;
  color: #5A5348;
}
.build-copy { display: flex; flex-direction: column; gap: 16px; }
.build-body { color: #5A5348; line-height: 1.7; font-size: 1rem; margin: 0; }
.build-bold { color: #16130F; line-height: 1.7; font-size: 1rem; font-weight: 800; margin: 0; }

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
  font-size: clamp(48px, 7vw, 88px);
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
  .story-grid { grid-template-columns: 1fr; }
  .beliefs-grid { grid-template-columns: 1fr; }
  .belief-card { border-right: none; border-bottom: 2px solid #16130F; }
  .belief-card:last-child { border-bottom: none; }
  .build-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .page-inner { padding: 0 22px; }
  .hero { padding: 44px 0 40px; }
  .story-section, .beliefs-section, .build-section { padding: 40px 0; }
  .final-cta { padding: 48px 22px; }
}
</style>
